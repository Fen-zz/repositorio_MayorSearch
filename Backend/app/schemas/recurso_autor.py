from pydantic import BaseModel
from typing import Optional

class RecursoAutorBase(BaseModel):
    idrecurso: int
    idautor: int
    orden: Optional[int] = None

class RecursoAutorCreate(RecursoAutorBase):
    pass

class RecursoAutorOut(RecursoAutorBase):
    class Config:
        orm_mode = True
