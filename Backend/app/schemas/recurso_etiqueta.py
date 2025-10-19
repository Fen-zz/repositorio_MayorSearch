from pydantic import BaseModel

class RecursoEtiquetaBase(BaseModel):
    idrecurso: int
    idetiqueta: int

class RecursoEtiquetaCreate(RecursoEtiquetaBase):
    pass

class RecursoEtiquetaOut(RecursoEtiquetaBase):
    class Config:
        orm_mode = True
