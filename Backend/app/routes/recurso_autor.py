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

@router.get("/", response_model=list[RecursoAutorOut])
def listar_vinculos(db: Session = Depends(get_db)):
    return db.query(RecursoAutor).all()


@router.get("/{id}", response_model=RecursoAutorOut)
def obtener_vinculo(id: int, db: Session = Depends(get_db)):
    vinculo = db.query(RecursoAutor).filter_by(id=id).first()
    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo no encontrado")
    return vinculo

@router.delete("/{id}", status_code=204)
def eliminar_vinculo(id: int, db: Session = Depends(get_db)):
    vinculo = db.query(RecursoAutor).filter_by(id=id).first()
    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo no encontrado")

    db.delete(vinculo)
    db.commit()
    return

@router.delete("/{idrecurso}/{idautor}")
def eliminar_vinculo_por_ids(idrecurso: int, idautor: int, db: Session = Depends(get_db)):
    """
    Elimina la relación entre un recurso y un autor
    usando ambos IDs (idrecurso e idautor).
    """
    vinculo = db.query(RecursoAutor).filter_by(idrecurso=idrecurso, idautor=idautor).first()
    if not vinculo:
        raise HTTPException(status_code=404, detail="Vínculo no encontrado")

    db.delete(vinculo)
    db.commit()
    return {"mensaje": "Vínculo eliminado correctamente"}