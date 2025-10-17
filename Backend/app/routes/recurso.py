import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recurso import Recurso
from app.models.archivo import Archivo
from app.schemas.recurso import RecursoCreate, RecursoOut, RecursoUpdate
from app.schemas.archivo import ArchivoOut

UPLOAD_DIR = "uploads/recursos"
os.makedirs(UPLOAD_DIR, exist_ok=True)

# ---- Helpers ----
def save_upload_file(upload_file: UploadFile, destino_dir: str) -> dict:
    ext = os.path.splitext(upload_file.filename)[1]
    filename = f"{uuid4().hex}{ext}"
    path = os.path.join(destino_dir, filename)
    with open(path, "wb") as buffer:
        shutil.copyfileobj(upload_file.file, buffer)
    size = os.path.getsize(path)
    return {"ruta": path, "nombre": upload_file.filename, "tamano": size, "tipo": upload_file.content_type}

def remove_file_safely(path: str):
    try:
        if path and os.path.exists(path):
            os.remove(path)
    except Exception:
        pass

# ---- Router ----
router = APIRouter(prefix="/recursos", tags=["recursos"])

@router.post("/", response_model=RecursoOut, status_code=201)
async def create_recurso(
    titulo: str = Form(...),
    tiporecurso: str = Form(...),
    descripcion: str = Form(None),
    fechapublicacion: str = Form(None),
    idioma: str = Form(None),
    file: UploadFile = File(...),
    db: Session = Depends(get_db)
):
    # Validaciones básicas
    if file.content_type not in ("application/pdf",):
        raise HTTPException(status_code=400, detail="Solo PDFs permitidos por ahora.")

    # Guardar archivo en disco
    meta = save_upload_file(file, UPLOAD_DIR)

    # Crear registro Archivo
    nuevo_archivo = Archivo(
        nombreoriginal=meta["nombre"],
        rutaarchivo=meta["ruta"],
        tipoarchivo=meta["tipo"],
        tamano=meta["tamano"]
    )
    db.add(nuevo_archivo)
    db.commit()
    db.refresh(nuevo_archivo)

    # Crear recurso y vincular IdArchivo
    nuevo_recurso = Recurso(
        titulo=titulo,
        tiporecurso=tiporecurso,
        descripcion=descripcion,
        fechapublicacion=fechapublicacion or None,
        idioma=idioma,
        ubicacion=meta["ruta"],  # opcional duplicado para compatibilidad
        idarchivo=nuevo_archivo.idarchivo
    )
    db.add(nuevo_recurso)
    db.commit()
    db.refresh(nuevo_recurso)
    return nuevo_recurso

@router.put("/{recurso_id}", response_model=RecursoOut)
async def update_recurso(
    recurso_id: int,
    titulo: str = Form(None),
    tiporecurso: str = Form(None),
    descripcion: str = Form(None),
    fechapublicacion: str = Form(None),
    idioma: str = Form(None),
    file: UploadFile = File(None),
    db: Session = Depends(get_db)
):
    recurso = db.query(Recurso).filter_by(idrecurso=recurso_id).first()
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")

    # Si suben nuevo archivo, guardarlo y crear registro Archivo. Borrar el anterior (físico) si existe.
    if file:
        if file.content_type not in ("application/pdf",):
            raise HTTPException(status_code=400, detail="Solo PDFs permitidos por ahora.")
        meta = save_upload_file(file, UPLOAD_DIR)
        nuevo_archivo = Archivo(
            nombreoriginal=meta["nombre"],
            rutaarchivo=meta["ruta"],
            tipoarchivo=meta["tipo"],
            tamano=meta["tamano"]
        )
        db.add(nuevo_archivo)
        db.commit()
        db.refresh(nuevo_archivo)

        # borrar archivo anterior del FS y dejarlo nullable en la tabla archivo (o eliminar fila)
        if recurso.archivo and recurso.archivo.rutaarchivo:
            remove_file_safely(recurso.archivo.rutaarchivo)
            # opcional: eliminar la fila antigua de Archivo
            try:
                db.delete(recurso.archivo)
                db.commit()
            except Exception:
                db.rollback()

        recurso.idarchivo = nuevo_archivo.idarchivo
        recurso.ubicacion = meta["ruta"]

    # actualizar campos si vienen
    if titulo is not None: recurso.titulo = titulo
    if tiporecurso is not None: recurso.tiporecurso = tiporecurso
    if descripcion is not None: recurso.descripcion = descripcion
    if fechapublicacion is not None: recurso.fechapublicacion = fechapublicacion
    if idioma is not None: recurso.idioma = idioma

    db.add(recurso)
    db.commit()
    db.refresh(recurso)
    return recurso

@router.delete("/{recurso_id}", status_code=204)
async def delete_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso = db.query(Recurso).filter_by(idrecurso=recurso_id).first()
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")

    # Borrar archivo físico si existe
    if recurso.archivo and recurso.archivo.rutaarchivo:
        remove_file_safely(recurso.archivo.rutaarchivo)

    # Borrar registros de la BD
    db.delete(recurso)
    db.commit()
    return {"mensaje": "Recurso eliminado correctamente"}

@router.get("/", response_model=list[RecursoOut])
async def listar_recursos(db: Session = Depends(get_db)):
    return db.query(Recurso).all()


@router.get("/{recurso_id}", response_model=RecursoOut)
async def obtener_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso = db.query(Recurso).filter_by(idrecurso=recurso_id).first()
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    return recurso
