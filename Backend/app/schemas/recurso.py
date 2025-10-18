from pydantic import BaseModel, Field
from typing import Optional
from datetime import date, datetime
from typing import Optional
from app.schemas.archivo import ArchivoOut


# Esquema base: campos comunes
class RecursoBase(BaseModel):
    titulo: str = Field(..., max_length=200)
    tiporecurso: str = Field(..., max_length=50)
    descripcion: Optional[str] = None
    fechapublicacion: Optional[date] = None
    idioma: Optional[str] = Field(None, max_length=50)
    ubicacion: Optional[str] = Field(None, max_length=200)
    verificado: Optional[bool] = False


# Crear recurso (entrada)
class RecursoCreate(RecursoBase):
    pass


# Actualizar recurso (entrada)
class RecursoUpdate(BaseModel):
    titulo: Optional[str] = Field(None, max_length=200)
    tiporecurso: Optional[str] = Field(None, max_length=50)
    descripcion: Optional[str] = None
    fechapublicacion: Optional[date] = None
    idioma: Optional[str] = Field(None, max_length=50)
    ubicacion: Optional[str] = Field(None, max_length=200)
    verificado: Optional[bool] = None


class RecursoOut(RecursoBase):
    idrecurso: int
    creadofecha: datetime
    archivo: Optional[ArchivoOut] = None
    contenidotexto: Optional[str] = None

    class Config:
        orm_mode = True

