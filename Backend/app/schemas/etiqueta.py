from pydantic import BaseModel, Field
from typing import Optional

class EtiquetaBase(BaseModel):
    nombreetiqueta: str = Field(..., max_length=100)

class EtiquetaCreate(EtiquetaBase):
    pass

class EtiquetaUpdate(BaseModel):
    nombreetiqueta: Optional[str] = Field(None, max_length=100)

class EtiquetaOut(EtiquetaBase):
    idetiqueta: int

    class Config:
        orm_mode = True
