from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app import models, schemas
from app.schemas import autor as autor_schema
from app.models import autor as autor_model

router = APIRouter(
    prefix="/autores",
    tags=["Autores"]
)

# Crear autor
@router.post("/", response_model=schemas.autor.AutorOut)
def crear_autor(autor: schemas.autor.AutorCreate, db: Session = Depends(get_db)):
    nuevo_autor = models.autor.Autor(**autor.dict())
    db.add(nuevo_autor)
    db.commit()
    db.refresh(nuevo_autor)
    return nuevo_autor


# Listar todos los autores
@router.get("/", response_model=List[schemas.autor.AutorOut])
def listar_autores(db: Session = Depends(get_db)):
    return db.query(models.autor.Autor).all()


# Obtener autor por ID
@router.get("/{idautor}", response_model=schemas.autor.AutorOut)
def obtener_autor(idautor: int, db: Session = Depends(get_db)):
    autor = db.query(models.autor.Autor).filter(models.autor.Autor.idautor == idautor).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return autor


# Actualizar autor
@router.put("/{idautor}", response_model=schemas.autor.AutorOut)
def actualizar_autor(idautor: int, autor_update: schemas.autor.AutorUpdate, db: Session = Depends(get_db)):
    autor = db.query(models.autor.Autor).filter(models.autor.Autor.idautor == idautor).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    
    for key, value in autor_update.dict(exclude_unset=True).items():
        setattr(autor, key, value)

    db.commit()
    db.refresh(autor)
    return autor


# Eliminar autor
@router.delete("/{idautor}")
def eliminar_autor(idautor: int, db: Session = Depends(get_db)):
    autor = db.query(models.autor.Autor).filter(models.autor.Autor.idautor == idautor).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    
    db.delete(autor)
    db.commit()
    return {"mensaje": f"Autor con ID {idautor} eliminado correctamente."}
