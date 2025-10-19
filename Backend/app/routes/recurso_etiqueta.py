from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recurso_etiqueta import RecursoEtiqueta
from app.schemas.recurso_etiqueta import RecursoEtiquetaCreate, RecursoEtiquetaOut

router = APIRouter(prefix="/recurso_etiqueta", tags=["RecursoEtiqueta"])

@router.post("/", response_model=RecursoEtiquetaOut)
def vincular_etiqueta_recurso(vinculo: RecursoEtiquetaCreate, db: Session = Depends(get_db)):
    existente = db.query(RecursoEtiqueta).filter_by(
        idrecurso=vinculo.idrecurso,
        idetiqueta=vinculo.idetiqueta
    ).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe esta relación")
    nuevo = RecursoEtiqueta(**vinculo.dict())
    db.add(nuevo)
    db.commit()
    db.refresh(nuevo)
    return nuevo

@router.get("/", response_model=list[RecursoEtiquetaOut])
def listar_vinculos(db: Session = Depends(get_db)):
    return db.query(RecursoEtiqueta).all()

@router.delete("/", status_code=204)
def eliminar_vinculo(vinculo: RecursoEtiquetaCreate, db: Session = Depends(get_db)):
    existente = db.query(RecursoEtiqueta).filter_by(
        idrecurso=vinculo.idrecurso,
        idetiqueta=vinculo.idetiqueta
    ).first()
    if not existente:
        raise HTTPException(status_code=404, detail="Vínculo no encontrado")
    db.delete(existente)
    db.commit()
    return
