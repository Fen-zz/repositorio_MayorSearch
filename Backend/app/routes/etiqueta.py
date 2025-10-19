from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List
from app.database import get_db
from app import models, schemas

from app.schemas import etiqueta as etiqueta_schema
from app.models import etiqueta as etiqueta_model

router = APIRouter(
    prefix="/etiquetas",
    tags=["Etiquetas"]
)

@router.post("/", response_model=schemas.etiqueta.EtiquetaOut)
def crear_etiqueta(etiqueta: schemas.etiqueta.EtiquetaCreate, db: Session = Depends(get_db)):
    existente = db.query(models.etiqueta.Etiqueta).filter(models.etiqueta.Etiqueta.nombreetiqueta == etiqueta.nombreetiqueta).first()
    if existente:
        raise HTTPException(status_code=400, detail="Ya existe una etiqueta con ese nombre")
    nueva = models.etiqueta.Etiqueta(**etiqueta.dict())
    db.add(nueva)
    db.commit()
    db.refresh(nueva)
    return nueva

@router.get("/", response_model=List[schemas.etiqueta.EtiquetaOut])
def listar_etiquetas(db: Session = Depends(get_db)):
    return db.query(models.etiqueta.Etiqueta).all()

@router.get("/{idetiqueta}", response_model=schemas.etiqueta.EtiquetaOut)
def obtener_etiqueta(idetiqueta: int, db: Session = Depends(get_db)):
    etiqueta = db.query(models.etiqueta.Etiqueta).filter(models.etiqueta.Etiqueta.idetiqueta == idetiqueta).first()
    if not etiqueta:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    return etiqueta

@router.put("/{idetiqueta}", response_model=schemas.etiqueta.EtiquetaOut)
def actualizar_etiqueta(idetiqueta: int, etiqueta_update: schemas.etiqueta.EtiquetaUpdate, db: Session = Depends(get_db)):
    etiqueta = db.query(models.etiqueta.Etiqueta).filter(models.etiqueta.Etiqueta.idetiqueta == idetiqueta).first()
    if not etiqueta:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    for key, value in etiqueta_update.dict(exclude_unset=True).items():
        setattr(etiqueta, key, value)
    db.commit()
    db.refresh(etiqueta)
    return etiqueta

@router.delete("/{idetiqueta}")
def eliminar_etiqueta(idetiqueta: int, db: Session = Depends(get_db)):
    etiqueta = db.query(models.etiqueta.Etiqueta).filter(models.etiqueta.Etiqueta.idetiqueta == idetiqueta).first()
    if not etiqueta:
        raise HTTPException(status_code=404, detail="Etiqueta no encontrada")
    db.delete(etiqueta)
    db.commit()
    return {"mensaje": f"Etiqueta con ID {idetiqueta} eliminada correctamente."}
