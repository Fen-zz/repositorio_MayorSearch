from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.schemas import tema as tema_schema
from app.models import tema as tema_model

router = APIRouter(
    prefix="/temas",
    tags=["Temas"]
)

# Crear tema
@router.post("/", response_model=schemas.tema.TemaOut)
def crear_tema(tema: schemas.tema.TemaCreate, db: Session = Depends(get_db)):
    nuevo_tema = models.tema.Tema(**tema.dict())
    db.add(nuevo_tema)
    db.commit()
    db.refresh(nuevo_tema)
    return nuevo_tema


# Listar todos los temas
@router.get("/", response_model=List[schemas.tema.TemaOut])
def listar_temas(db: Session = Depends(get_db)):
    return db.query(models.tema.Tema).all()


# Obtener tema por ID
@router.get("/{idtema}", response_model=schemas.tema.TemaOut)
def obtener_tema(idtema: int, db: Session = Depends(get_db)):
    tema = db.query(models.tema.Tema).filter(models.tema.Tema.idtema == idtema).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")
    return tema


# Actualizar tema
@router.put("/{idtema}", response_model=schemas.tema.TemaOut)
def actualizar_tema(idtema: int, tema_update: schemas.tema.TemaUpdate, db: Session = Depends(get_db)):
    tema = db.query(models.tema.Tema).filter(models.tema.Tema.idtema == idtema).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")

    for key, value in tema_update.dict(exclude_unset=True).items():
        setattr(tema, key, value)

    db.commit()
    db.refresh(tema)
    return tema


# Eliminar tema
@router.delete("/{idtema}")
def eliminar_tema(idtema: int, db: Session = Depends(get_db)):
    tema = db.query(models.tema.Tema).filter(models.tema.Tema.idtema == idtema).first()
    if not tema:
        raise HTTPException(status_code=404, detail="Tema no encontrado")

    db.delete(tema)
    db.commit()
    return {"mensaje": f"Tema con ID {idtema} eliminado correctamente."}
