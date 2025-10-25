# app/schemas/favorito.py
from pydantic import BaseModel
from datetime import datetime

class FavoritoBase(BaseModel):
    idusuario: int 
    idrecurso: int 
    agregadofecha: datetime

    class Config:
        orm_mode = True

class FavoritoCreate(BaseModel):
    idrecurso: int
    idusuario: int | None = None
