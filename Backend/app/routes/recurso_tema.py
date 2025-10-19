from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recurso_tema import RecursoTema
from app.schemas.recurso_tema import RecursoTemaCreate, RecursoTemaOut

router = APIRouter(prefix="/recurso_tema", tags=["RecursoTema"])

@router.post("/", response_model=RecursoTemaOut)
def vincular_tema_recurso(vinculo: RecursoTemaCreate, db: Session = Depends(get_db)):
    existente = db.query(RecursoTema).filter_by(
        idrecurso=vinculo.idrecurso, idtema=vinculo.idtema
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe esta relación")

    nuevo = RecursoTema(**vinculo.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo


@router.get("/", response_model=list[RecursoTemaOut])
def listar_vinculos(db: Session = Depends(get_db)):
    return db.query(RecursoTema).all()


@router.delete("/", status_code=204)
def eliminar_vinculo(idrecurso: int, idtema: int, db: Session = Depends(get_db)):
    vinculo = db.query(RecursoTema).filter_by(idrecurso=idrecurso, idtema=idtema).first()
    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo no encontrado")

    db.delete(vinculo)
    db.commit()
    return
