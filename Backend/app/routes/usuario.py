from fastapi import APIRouter, Depends, HTTPException, Form
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioBase, UsuarioUpdate
from app.utils.utils import hash_password
from fastapi import status
from app.utils.utils import verify_password
from fastapi import BackgroundTasks
from app.utils.jwt_handler import create_reset_token, verify_reset_token

from email.message import EmailMessage
import aiosmtplib
from fastapi import APIRouter, Depends, BackgroundTasks
import resend

import app.models
import os

from google.oauth2 import id_token
from google.auth.transport import requests as grequests


router = APIRouter()
resend.api_key = os.getenv("RESEND_API_KEY")

# -----------------------
# LISTAR USUARIOS
# -----------------------
@router.get("/usuarios", response_model=list[UsuarioOut])
def obtener_usuarios(db: Session = Depends(get_db)):
    usuarios = db.query(Usuario).all()
    return usuarios

# -----------------------
# CREAR USUARIO
# -----------------------
@router.post("/usuarios", response_model=UsuarioOut)
def crear_usuario(usuario: UsuarioCreate, db: Session = Depends(get_db)):
    existente = db.query(Usuario).filter(Usuario.email == usuario.email).first()
    if existente:
        raise HTTPException(status_code=400, detail="El correo ya está registrado")

    # 👇 Cifrar la contraseña antes de guardar
    hashed_password = hash_password(usuario.password)

    nuevo_usuario = Usuario(
        nombreusuario=usuario.nombreusuario,
        telefono=usuario.telefono,
        email=usuario.email,
        password=hashed_password,
        proveedor=usuario.proveedor,
        idproveedor=usuario.idproveedor,
        codigoestudiantil=usuario.codigoestudiantil,
        rol=usuario.rol or "normal"
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario

# ACTUALIZAR
@router.put("/usuarios/{idusuario}", response_model=UsuarioOut)
def actualizar_usuario(
    idusuario: int,
    usuario_actualizado: UsuarioUpdate,
    db: Session = Depends(get_db)
):
    usuario_db = db.query(Usuario).filter(Usuario.idusuario == idusuario).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    # Actualiza solo los campos que hayan sido enviados
    update_data = usuario_actualizado.dict(exclude_unset=True)
    for key, value in update_data.items():
        setattr(usuario_db, key, value)

    db.commit()
    db.refresh(usuario_db)
    return usuario_db

# ELIMINAR
@router.delete("/usuarios/{idusuario}")
def eliminar_usuario(idusuario: int, db: Session = Depends(get_db)):
    usuario_db = db.query(Usuario).filter(Usuario.idusuario == idusuario).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    db.delete(usuario_db)
    db.commit()
    return {"message": "Usuario eliminado correctamente"}

# Comprobar autenticación básica
@router.post("/login")
def login(email: str = Form(...), password: str = Form(...), db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Usuario no encontrado")
    if not verify_password(password, usuario.password):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Contraseña incorrecta")

    # Generar token JWT reutilizando la función existente
    token_data = {"sub": usuario.email, "rol": usuario.rol}
    access_token = create_reset_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": usuario.nombreusuario,
        "rol": usuario.rol
    }

@router.post("/login/google")
def login_google(id_token_str: str = Form(...), db: Session = Depends(get_db)):
    CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    print("\n[DEBUG] CLIENT_ID =", CLIENT_ID)
    print("[DEBUG] id_token_str (primeros 20 chars):", id_token_str[:20])

    if not CLIENT_ID:
        raise HTTPException(status_code=500, detail="Google client ID no configurado en el servidor")

    try:
        # ✅ Verificar token de Google con margen de 5 segundos
        payload = id_token.verify_oauth2_token(
            id_token_str,
            grequests.Request(),
            CLIENT_ID,
            clock_skew_in_seconds=5  # <-- acepta hasta 5 seg. de desfase
        )
        print("[DEBUG] Payload verificado:", payload)

    except ValueError as e:
        # Token inválido / usado demasiado pronto
        print("Error verificando token:", e)
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail=f"Token de Google inválido o usado demasiado pronto: {e}"
        )

    # Extraer info del usuario
    email = payload.get("email")
    nombre = payload.get("name", email.split("@")[0])
    sub = payload.get("sub")  # ID único de Google

    if not email:
        raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail="Token inválido: sin email")

    print("[DEBUG] Usuario:", email, "| Nombre:", nombre)

    # Buscar usuario en DB
    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario:
        # Crear nuevo usuario proveniente de Google
        usuario = Usuario(
            nombreusuario=nombre,
            email=email,
            proveedor="google",
            idproveedor=sub,
            rol="normal"
        )
        db.add(usuario)
        db.commit()
        db.refresh(usuario)
    else:
        # Enlazar proveedor si no existía
        if not usuario.proveedor:
            usuario.proveedor = "google"
            usuario.idproveedor = sub
            db.commit()
            db.refresh(usuario)

    # Generar JWT local
    token_data = {"sub": usuario.email, "rol": usuario.rol}
    access_token = create_reset_token(token_data)

    return {
        "access_token": access_token,
        "token_type": "bearer",
        "usuario": usuario.nombreusuario,
        "rol": usuario.rol
    }

# -----------------------
# OLVIDÓ SU CONTRASEÑA
# -----------------------

@router.post("/forgot-password")
async def forgot_password(email: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    # No revelar existencia del usuario
    if not usuario:
        return {"mensaje": "Si el correo existe, se enviará un enlace para restablecer la contraseña."}

    # Crear token de recuperación
    token = create_reset_token({"sub": usuario.email})
    reset_link = f"http://localhost:5173/reset-password?token={token}"

    # DEBUG
    print(f"\n[DEBUG] Enlace de restablecimiento para {usuario.email}: {reset_link}\n")

    # Remitente (usa Resend o tu Gmail)
    from_email = os.getenv("EMAIL_SENDER") or "onboarding@resend.dev"

    # Envío del correo en background
    async def send_email():
        try:
            # ⚠️ Aquí quitamos el 'await' porque resend.Emails.send() es síncrono
            resend.Emails.send({
                "from": from_email,
                "to": usuario.email,
                "subject": "Recupera tu contraseña - MayorSearch",
                "html": f"""
                    <p>Hola {usuario.nombreusuario},</p>
                    <p>Haz clic en el siguiente enlace para restablecer tu contraseña:</p>
                    <p><a href="{reset_link}">{reset_link}</a></p>
                    <p>Si no solicitaste este cambio, ignora este mensaje.</p>
                    <p>Atentamente,<br>El equipo de MayorSearch.</p>
                """
            })
            print(f"[EMAIL] ✅ Enviado correctamente a {usuario.email} (from: {from_email})")
        except Exception as e:
            print(f"[ERROR EMAIL] ❌ No se pudo enviar a {usuario.email}: {e}")

    background_tasks.add_task(send_email)

    return {"mensaje": "Si el correo existe, se enviará un enlace para restablecer la contraseña."}


# -----------------------
# RESTABLECER CONTRASEÑA
# -----------------------
@router.post("/reset-password")
async def reset_password(data: dict, db: Session = Depends(get_db)):
    """
    Espera un JSON del tipo:
    {
        "token": "...",
        "nueva_contrasena": "..."
    }
    """
    token = data.get("token")
    nueva_contrasena = data.get("nueva_contrasena")

    if not token or not nueva_contrasena:
        raise HTTPException(status_code=400, detail="Faltan datos para restablecer la contraseña")

    email = verify_reset_token(token)
    if not email:
        raise HTTPException(status_code=400, detail="Token inválido o expirado")

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario.password = hash_password(nueva_contrasena)
    db.commit()

    return {"mensaje": "✅ Contraseña actualizada correctamente. Ya puedes iniciar sesión."}
