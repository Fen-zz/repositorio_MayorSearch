from pydantic import BaseModel


class RecursoTemaBase(BaseModel):
    idrecurso: int
    idtema: int


class RecursoTemaCreate(RecursoTemaBase):
    pass


class RecursoTemaOut(RecursoTemaBase):
    class Config:
        orm_mode = True
