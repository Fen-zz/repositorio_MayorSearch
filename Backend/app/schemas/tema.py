from pydantic import BaseModel, Field
from typing import Optional


# Base común (lectura y escritura)
class TemaBase(BaseModel):
    nombretema: str = Field(..., max_length=100)
    idtemapadre: Optional[int] = None


# Crear tema
class TemaCreate(TemaBase):
    pass


# Actualizar tema
class TemaUpdate(BaseModel):
    nombretema: Optional[str] = Field(None, max_length=100)
    idtemapadre: Optional[int] = None


# Respuesta
class TemaOut(TemaBase):
    idtema: int

    class Config:
        orm_mode = True
