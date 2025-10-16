from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Usuario
from database import get_db
from schemas import UsuarioCreate, UsuarioOut, UsuarioBase
from utils.utils import hash_password
from fastapi import status
from utils.utils import verify_password
from fastapi import BackgroundTasks
from utils.jwt_handler import create_reset_token
# from utils.email_utils import send_reset_email
import models


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
    usuario_actualizado: UsuarioBase,
    db: Session = Depends(get_db)
):
    usuario_db = db.query(Usuario).filter(Usuario.idusuario == idusuario).first()
    if not usuario_db:
        raise HTTPException(status_code=404, detail="Usuario no encontrado")

    usuario_db.nombreusuario = usuario_actualizado.nombreusuario
    usuario_db.telefono = usuario_actualizado.telefono
    usuario_db.email = usuario_actualizado.email
    usuario_db.rol = usuario_actualizado.rol

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

