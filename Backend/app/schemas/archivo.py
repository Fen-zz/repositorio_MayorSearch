from pydantic import BaseModel
from datetime import datetime
from typing import Optional


class ArchivoOut(BaseModel):
    idarchivo: int
    nombreoriginal: Optional[str]
    rutaarchivo: str
    tipoarchivo: Optional[str]
    tamano: Optional[int]
    fechasubida: Optional[datetime]

    class Config:
        orm_mode = True
