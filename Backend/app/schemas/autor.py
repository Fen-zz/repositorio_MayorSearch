from pydantic import BaseModel, Field
from typing import Optional


# Base común (para lectura y escritura)
class AutorBase(BaseModel):
    nombreautor: str = Field(..., max_length=150)
    profileurl: Optional[str] = Field(None, max_length=250)
    orcid: Optional[str] = Field(None, max_length=50)


# Crear autor
class AutorCreate(AutorBase):
    pass


# Actualizar autor
class AutorUpdate(BaseModel):
    nombreautor: Optional[str] = Field(None, max_length=150)
    profileurl: Optional[str] = Field(None, max_length=250)
    orcid: Optional[str] = Field(None, max_length=50)


# Respuesta
class AutorOut(AutorBase):
    idautor: int

    class Config:
        orm_mode = True
