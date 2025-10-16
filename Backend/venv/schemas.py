# schemas.py
from pydantic import BaseModel, EmailStr
from typing import Optional
from datetime import datetime

# ----- Esquema base -----
class UsuarioBase(BaseModel):
    nombreusuario: str
    telefono: Optional[str] = None
    email: EmailStr
    rol: str = "normal"

# ----- Esquema para creación -----
class UsuarioCreate(UsuarioBase):
    password: str
    proveedor: Optional[str] = None
    idproveedor: Optional[str] = None
    codigoestudiantil: Optional[str] = None

# ----- Esquema para lectura/salida -----
class UsuarioOut(UsuarioBase):
    idusuario: int
    fechacreacion: datetime | None = None

    class Config:
        orm_mode = True

# ----- Esquema para actualización parcial -----
class UsuarioUpdate(BaseModel):
    nombreusuario: Optional[str] = None
    telefono: Optional[str] = None
    email: Optional[EmailStr] = None
    rol: Optional[str] = None

