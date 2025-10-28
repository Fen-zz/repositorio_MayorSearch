from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from typing import List, Optional, Any
from sqlalchemy.sql import text
from app.database import get_db
from app import models
from app.schemas import autor as autor_schema
from pydantic import BaseModel

router = APIRouter(
    prefix="/autores",
    tags=["Autores"]
)

# Crear autor
@router.post("/", response_model=autor_schema.AutorOut)
def crear_autor(autor: autor_schema.AutorCreate, db: Session = Depends(get_db)):
    nuevo_autor = models.autor.Autor(**autor.dict())
    db.add(nuevo_autor)
    db.commit()
    db.refresh(nuevo_autor)
    return nuevo_autor


# Listar todos los autores
@router.get("/", response_model=List[autor_schema.AutorOut])
def listar_autores(db: Session = Depends(get_db)):
    return db.query(models.autor.Autor).all()


# Obtener autor por ID
@router.get("/{idautor}", response_model=autor_schema.AutorOut)
def obtener_autor(idautor: int, db: Session = Depends(get_db)):
    autor = db.query(models.autor.Autor).filter(models.autor.Autor.idautor == idautor).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")
    return autor


# Actualizar autor
@router.put("/{idautor}", response_model=autor_schema.AutorOut)
def actualizar_autor(idautor: int, autor_update: autor_schema.AutorUpdate, db: Session = Depends(get_db)):
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


# 🧩 Esquema extendido (flexible para tipos raros)
class RecursoExtendido(BaseModel):
    idrecurso: int
    titulo: str
    descripcion: Optional[str]
    tiporecurso: Optional[str]
    idioma: Optional[str]
    ubicacion: Optional[str]
    verificado: Optional[bool]
    fechapublicacion: Optional[Any]  # 🪄 acepta cualquier tipo
    creadofecha: Optional[Any]
    autores: Optional[str]
    temas: Optional[str]
    etiquetas: Optional[str]

    class Config:
        orm_mode = True


# 📚 Obtener los recursos asociados a un autor (versión extendida)
@router.get("/{idautor}/recursos", response_model=List[RecursoExtendido])
def obtener_recursos_por_autor(idautor: int, db: Session = Depends(get_db)):
    """
    Devuelve todos los recursos escritos por un autor,
    incluyendo autores, temas y etiquetas (idéntico formato a favoritos y buscador).
    """
    autor = db.query(models.autor.Autor).filter(models.autor.Autor.idautor == idautor).first()
    if not autor:
        raise HTTPException(status_code=404, detail="Autor no encontrado")

    # 1️⃣ Obtener los IDs de los recursos escritos por el autor
    relaciones = (
        db.query(models.recurso_autor.RecursoAutor)
        .filter(models.recurso_autor.RecursoAutor.idautor == idautor)
        .all()
    )
    ids_recurso = [rel.idrecurso for rel in relaciones]
    if not ids_recurso:
        return []

    # 2️⃣ Query tipo “favoritos” (trae autores, temas y etiquetas)
    base_query = """
        SELECT r.*,
            COALESCE(string_agg(DISTINCT a.nombreautor, ', '), '') AS autores,
            COALESCE(string_agg(DISTINCT t.nombretema, ', '), '') AS temas,
            COALESCE(string_agg(DISTINCT e.nombreetiqueta, ', '), '') AS etiquetas
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

    # 3️⃣ Convertimos fechas raras en strings decentes
    resultados = []
    for row in rows:
        r = dict(row._mapping)
        if r.get("fechapublicacion"):
            r["fechapublicacion"] = str(r["fechapublicacion"])
        if r.get("creadofecha"):
            r["creadofecha"] = str(r["creadofecha"])
        resultados.append(r)

    return resultados
