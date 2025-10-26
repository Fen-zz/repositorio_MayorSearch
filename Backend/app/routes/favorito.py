# app/routes/favorito.py
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List, Dict, Any

from app.database import get_db
from app.models.favorito import Favorito
from app.models.recurso import Recurso
from app.schemas.recurso import RecursoBase
from app.schemas.favorito import FavoritoBase, FavoritoCreate
from app.utils.auth import get_current_user_id  # ✅ usamos el helper central
from app.schemas.recurso import RecursoOut
from sqlalchemy.orm import joinedload
from sqlalchemy.sql import text
from app.schemas.recurso import RecursoOut

from app.models.recurso_autor import RecursoAutor
from app.models.recurso_tema import RecursoTema
from app.models.recurso_etiqueta import RecursoEtiqueta
from app.models.autor import Autor
from app.models.tema import Tema
from app.models.etiqueta import Etiqueta

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
@router.get("/", response_model=Dict[str, Any])
def obtener_favoritos(db: Session = Depends(get_db), idusuario: int = Depends(get_current_user_id)):
    """
    Devuelve los recursos completos (con autores, temas, etiquetas) que el usuario ha marcado como favorito.
    Usa la misma estrategia SQL que tu endpoint de búsqueda para garantizar formato idéntico.
    """
    # 1) IDs de recursos que son favoritos del usuario
    fav_rows = db.query(Favorito.idrecurso).filter(Favorito.idusuario == idusuario).all()
    ids_recurso = [r.idrecurso for r in fav_rows]
    print("🎯 IDs de recursos favoritos:", ids_recurso)
    if not ids_recurso:
        return {"total": 0, "limit": 0, "offset": 0, "resultados": []}

    print("🧠 Usuario actual:", idusuario)

    # 2) Query tipo "buscar_recursos" pero filtrando solo por los ids seleccionados
    base_query = """
        SELECT r.*,
            COALESCE(string_agg(DISTINCT a.nombreautor, ', '), '') AS autores,
            COALESCE(string_agg(DISTINCT t.nombretema, ', '), '') AS temas,
            COALESCE(string_agg(DISTINCT e.nombreetiqueta, ', '), '') AS etiquetas,
            0 AS rank
        FROM recurso r
        LEFT JOIN recurso_autor ra ON r.idrecurso = ra.idrecurso
        LEFT JOIN autor a ON ra.idautor = a.idautor
        LEFT JOIN recurso_tema rt ON r.idrecurso = rt.idrecurso
        LEFT JOIN tema t ON rt.idtema = t.idtema
        LEFT JOIN recurso_etiqueta re ON r.idrecurso = re.idrecurso
        LEFT JOIN etiqueta e ON re.idetiqueta = e.idetiqueta
        WHERE r.idrecurso = ANY(:ids)
        GROUP BY r.idrecurso
        ORDER BY r.creadofecha DESC
    """

    params = {"ids": ids_recurso}
    rows = db.execute(text(base_query), params).fetchall()
    resultados = [dict(row._mapping) for row in rows]

    return {
        "total": len(resultados),
        "limit": len(resultados),
        "offset": 0,
        "resultados": resultados
    }


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
