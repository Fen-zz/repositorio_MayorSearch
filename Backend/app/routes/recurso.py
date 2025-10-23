import os
import shutil
from uuid import uuid4
from fastapi import APIRouter, Depends, UploadFile, File, HTTPException, status, Form, Query
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.recurso import Recurso
from app.models.archivo import Archivo
from app.schemas.recurso import RecursoCreate, RecursoOut, RecursoUpdate
from app.schemas.archivo import ArchivoOut
from PyPDF2 import PdfReader
from sqlalchemy.sql import text
from datetime import date
from sqlalchemy.orm import Session
from app.database import get_db
import re

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

    # intentar extraer el texto del PDF
    contenido_texto = None
    if nuevo_archivo.tipoarchivo == "application/pdf":
        try:
            with open(nuevo_archivo.rutaarchivo, "rb") as f:
                lector = PdfReader(f)
                texto = ""
                for pagina in lector.pages:
                    texto += pagina.extract_text() or ""
                contenido_texto = texto.strip()
        except Exception as e:
            print(f" Error extrayendo texto del PDF: {e}")

    # Crear recurso y vincular IdArchivo
    nuevo_recurso = Recurso(
        titulo=titulo,
        tiporecurso=tiporecurso,
        descripcion=descripcion,
        fechapublicacion=fechapublicacion or None,
        idioma=idioma,
        ubicacion=meta["ruta"],  
        idarchivo=nuevo_archivo.idarchivo,
        contenidotexto=contenido_texto  
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

@router.get("/recursos/buscar", response_model=dict)
def buscar_recursos(
    q: str = Query(None),
    tiporecurso: str = Query(None),
    idioma: str = Query(None),
    verificado: bool = Query(None),
    fecha_inicio: str = Query(None),
    fecha_fin: str = Query(None),
    ubicacion: str = Query(None),
    etiquetas: str = Query(None),
    fecha: str = Query(None),
    limit: int = Query(10),
    offset: int = Query(0),
    db: Session = Depends(get_db)
):
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
        WHERE 1=1
    """

    base_conditions = ""

    # --- 🔍 Búsqueda general avanzada + Filtros combinados correctamente ---
    search_parts = []
    params = {}

    if q:
        q_normal = q.strip()
        q_normal = re.sub(r'(?<!\s)([A-Z])', r' \1', q_normal).strip()
        q_nospaces = q_normal.replace(" ", "")
        tokens = re.findall(r'\w+', q_normal.lower())
        q_ts = " & ".join([f"{t}:*" for t in tokens]) if tokens else ""

        search_parts.append("""
            (
                r.tsv @@ plainto_tsquery('spanish', :q)
                OR (:q_ts <> '' AND r.tsv @@ to_tsquery('spanish', :q_ts))
                OR unaccent(lower(r.titulo)) ILIKE unaccent(lower(:q_ilike))
                OR unaccent(lower(r.descripcion)) ILIKE unaccent(lower(:q_ilike))
                OR unaccent(lower(r.contenidotexto)) ILIKE unaccent(lower(:q_ilike))
                OR unaccent(lower(replace(r.titulo, ' ', ''))) ILIKE unaccent(lower(:q_nospaces_ilike))
                OR unaccent(lower(replace(r.descripcion, ' ', ''))) ILIKE unaccent(lower(:q_nospaces_ilike))
                OR unaccent(lower(replace(r.contenidotexto, ' ', ''))) ILIKE unaccent(lower(:q_nospaces_ilike))
                OR EXISTS (
                    SELECT 1 FROM recurso_autor ra2
                    JOIN autor a2 ON ra2.idautor = a2.idautor
                    WHERE ra2.idrecurso = r.idrecurso
                    AND (
                        unaccent(lower(a2.nombreautor)) ILIKE unaccent(lower(:q_ilike))
                        OR unaccent(lower(replace(a2.nombreautor, ' ', ''))) ILIKE unaccent(lower(:q_nospaces_ilike))
                    )
                )
            )
        """)

        params.update({
            "q": q_normal,
            "q_ilike": f"%{q_normal}%",
            "q_nospaces_ilike": f"%{q_nospaces}%",
            "q_ts": q_ts,
        })

    filter_parts = []

    if tiporecurso:
        filter_parts.append("r.tiporecurso ILIKE :tiporecurso")
        params["tiporecurso"] = f"%{tiporecurso}%"

    if idioma:
        filter_parts.append("r.idioma ILIKE :idioma")
        params["idioma"] = f"%{idioma}%"

    if etiquetas:
        etiquetas_list = [e.strip() for e in etiquetas.split(",") if e.strip()]
        if etiquetas_list:
            subquery = f"""
                r.idrecurso IN (
                    SELECT re_sub.idrecurso
                    FROM recurso_etiqueta re_sub
                    JOIN etiqueta e_sub ON re_sub.idetiqueta = e_sub.idetiqueta
                    WHERE unaccent(lower(e_sub.nombreetiqueta)) IN ({', '.join([f':etq{i}' for i in range(len(etiquetas_list))])})
                    GROUP BY re_sub.idrecurso
                    HAVING COUNT(DISTINCT unaccent(lower(e_sub.nombreetiqueta))) = {len(etiquetas_list)}
                )
            """
            filter_parts.append(subquery)
            for i, etq in enumerate(etiquetas_list):
                params[f"etq{i}"] = etq.lower()

    if verificado is not None:
        filter_parts.append("r.verificado = :verificado")
        params["verificado"] = verificado

    if ubicacion:
        filter_parts.append("r.ubicacion ILIKE :ubicacion")
        params["ubicacion"] = f"%{ubicacion}%"

    if fecha:
        hoy = date.today()
        if "reciente" in fecha:
            fecha_inicio_calc = hoy.replace(day=max(hoy.day - 7, 1))
        elif "mes" in fecha:
            mes = hoy.month - 1 if hoy.month > 1 else 12
            fecha_inicio_calc = date(hoy.year if hoy.month > 1 else hoy.year - 1, mes, hoy.day)
        elif "año" in fecha or "anio" in fecha:
            fecha_inicio_calc = date(hoy.year - 1, hoy.month, hoy.day)
        else:
            fecha_inicio_calc = None

        if fecha_inicio_calc:
            filter_parts.append("r.fechapublicacion BETWEEN :fecha_inicio AND :fecha_fin")
            params["fecha_inicio"] = fecha_inicio_calc
            params["fecha_fin"] = hoy

    # --- 💡 Aquí la clave: agrupar correctamente búsqueda + filtros ---
    conditions = []
    if search_parts:
        conditions.append("(" + " OR ".join(search_parts) + ")")
    if filter_parts:
        conditions.append("(" + " AND ".join(filter_parts) + ")")

    if conditions:
        base_conditions += " AND " + " AND ".join(conditions)

    # ---------------- Consulta final ----------------
    final_query = base_query + base_conditions + """
        GROUP BY r.idrecurso
        ORDER BY r.creadofecha DESC
        LIMIT :limit OFFSET :offset
    """
    params["limit"] = limit
    params["offset"] = offset

    rows = db.execute(text(final_query), params).fetchall()
    resultados = [dict(row._mapping) for row in rows]

    # Para mantener compatibilidad con tu antiguo response shape
    # y con swagger que espera { total, limit, offset, resultados }
    total_count = db.execute(text(
        f"SELECT COUNT(DISTINCT r.idrecurso) FROM recurso r LEFT JOIN recurso_etiqueta re ON r.idrecurso = re.idrecurso LEFT JOIN etiqueta e ON re.idetiqueta = e.idetiqueta WHERE 1=1 {base_conditions}"
    ), params).scalar()

    return {
        "total": total_count,
        "limit": limit,
        "offset": offset,
        "resultados": resultados
    }

@router.get("/{recurso_id}", response_model=RecursoOut)
async def obtener_recurso(recurso_id: int, db: Session = Depends(get_db)):
    recurso = db.query(Recurso).filter_by(idrecurso=recurso_id).first()
    if not recurso:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    return recurso

