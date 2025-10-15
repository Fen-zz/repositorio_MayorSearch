from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from models import Usuario
from database import get_db
from schemas import UsuarioCreate, UsuarioOut
from utils.utils import hash_password

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
        codigoestudiantil=usuario.codigoestudiantil
    )

    db.add(nuevo_usuario)
    db.commit()
    db.refresh(nuevo_usuario)
    return nuevo_usuario
