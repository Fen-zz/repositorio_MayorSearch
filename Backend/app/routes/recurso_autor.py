from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recurso_autor import RecursoAutor
from app.schemas.recurso_autor import RecursoAutorCreate, RecursoAutorOut

router = APIRouter(prefix="/recurso_autor", tags=["RecursoAutor"])

@router.post("/", response_model=RecursoAutorOut)
def vincular_autor_recurso(vinculo: RecursoAutorCreate, db: Session = Depends(get_db)):
    existente = db.query(RecursoAutor).filter_by(
        idrecurso=vinculo.idrecurso, idautor=vinculo.idautor
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe esta relación")

    nuevo = RecursoAutor(**vinculo.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo
