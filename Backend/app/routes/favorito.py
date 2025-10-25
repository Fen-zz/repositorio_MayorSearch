# app/routes/favorito.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List

from app.database import get_db
from app.models.favorito import Favorito
from app.models.recurso import Recurso
from app.schemas.favorito import FavoritoBase, FavoritoCreate
from app.utils.auth import get_current_user_id  # ✅ usamos el helper central

router = APIRouter(
    prefix="/favoritos",
    tags=["Favoritos"]
)

# ============================================================
# Agregar un recurso a favoritos
# ============================================================
@router.post("/", response_model=FavoritoBase)
def agregar_favorito(
    data: FavoritoCreate,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    # Verifica que el recurso exista
    recurso = db.query(Recurso).filter(Recurso.idrecurso == data.idrecurso).first()
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")

    # Verifica si ya está en favoritos
    favorito_existente = db.query(Favorito).filter(
        Favorito.idusuario == user_id,
        Favorito.idrecurso == data.idrecurso
    ).first()
    if favorito_existente:
        raise HTTPException(status_code=400, detail="Este recurso ya está en tus favoritos")

    # Crear el nuevo favorito
    nuevo_favorito = Favorito(idusuario=user_id, idrecurso=data.idrecurso)
    db.add(nuevo_favorito)
    db.commit()
    db.refresh(nuevo_favorito)
    return nuevo_favorito


# ============================================================
# Eliminar de favoritos
# ============================================================
@router.delete("/{idrecurso}")
def eliminar_favorito(
    idrecurso: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    favorito = db.query(Favorito).filter(
        Favorito.idusuario == user_id,
        Favorito.idrecurso == idrecurso
    ).first()

    if not favorito:
        raise HTTPException(status_code=404, detail="No tienes este recurso en favoritos")

    db.delete(favorito)
    db.commit()
    return {"mensaje": "Recurso eliminado de favoritos"}


# ============================================================
# Listar favoritos del usuario
# ============================================================
@router.get("/", response_model=List[FavoritoBase])
def listar_favoritos(
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    favoritos = db.query(Favorito).filter(Favorito.idusuario == user_id).all()
    return favoritos


# ============================================================
# Verificar si un recurso está en favoritos
# ============================================================
@router.get("/check/{idrecurso}")
def verificar_favorito(
    idrecurso: int,
    db: Session = Depends(get_db),
    user_id: int = Depends(get_current_user_id)
):
    favorito = db.query(Favorito).filter(
        Favorito.idusuario == user_id,
        Favorito.idrecurso == idrecurso
    ).first()
    return {"favorito": bool(favorito)}
