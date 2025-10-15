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
