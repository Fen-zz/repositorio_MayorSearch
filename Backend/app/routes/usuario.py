from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.models.usuario import Usuario
from app.database import get_db
from app.schemas.usuario import UsuarioCreate, UsuarioOut, UsuarioBase, UsuarioUpdate
from app.utils.utils import hash_password
from fastapi import status
from app.utils.utils import verify_password
from fastapi import BackgroundTasks
from app.utils.jwt_handler import create_reset_token, verify_reset_token
# from utils.email_utils import send_reset_email
import app.models


router = APIRouter()

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
def login(email: str, password: str, db: Session = Depends(get_db)):
    """Autenticación básica de usuario."""
    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )
    
    if not verify_password(password, usuario.password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Contraseña incorrecta"
        )
    
    return {
        "mensaje": f"Bienvenido {usuario.nombreusuario}",
        "rol": usuario.rol
    }

@router.post("/forgot-password")
def forgot_password(email: str, background_tasks: BackgroundTasks, db: Session = Depends(get_db)):
    usuario = db.query(Usuario).filter(Usuario.email == email).first()

    if not usuario:
        # No revelamos si el correo existe o no (seguridad básica)
        return {"mensaje": "Si el correo existe, se enviará un enlace para restablecer la contraseña."}

    # Generar token de recuperación
    token = create_reset_token({"sub": usuario.email})
    reset_link = f"http://localhost:8000/reset-password?token={token}"

    # En vez de enviar correo, mostramos el link en consola
    print(f"\n[DEBUG] Enlace de restablecimiento de contraseña para {usuario.email}:")
    print(reset_link, "\n")

    return {"mensaje": "Si el correo existe, se enviará un enlace para restablecer la contraseña."}


# -----------------------
# RESTABLECER CONTRASEÑA
# -----------------------
@router.post("/reset-password")
def reset_password(token: str, nueva_contrasena: str, db: Session = Depends(get_db)):
    email = verify_reset_token(token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Token inválido o expirado"
        )

    usuario = db.query(Usuario).filter(Usuario.email == email).first()
    if not usuario:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Usuario no encontrado"
        )

    usuario.password = hash_password(nueva_contrasena)
    db.commit()

    return {"mensaje": "Contraseña actualizada correctamente"}
