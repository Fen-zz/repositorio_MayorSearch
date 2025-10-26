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
from datetime import date, datetime, timedelta


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
    recursos = db.query(Recurso).all()

    # Ajustar las rutas de cada recurso
    for recurso in recursos:
        if recurso.archivo and recurso.archivo.rutaarchivo:
            ruta = recurso.archivo.rutaarchivo.replace("\\", "/")
            ruta_normalizada = ruta.replace("uploads/", "").lstrip("/")
            recurso.archivo.rutaarchivo = f"http://localhost:8000/uploads/{ruta_normalizada}"

    return recursos

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

    params = {}
    search_parts = []
    filter_parts = []

    # --- 🔍 Búsqueda general ---
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
                OR EXISTS (
                    SELECT 1 FROM recurso_autor ra2
                    JOIN autor a2 ON ra2.idautor = a2.idautor
                    WHERE ra2.idrecurso = r.idrecurso
                    AND unaccent(lower(a2.nombreautor)) ILIKE unaccent(lower(:q_ilike))
                )
            )
        """)
        params.update({
            "q": q_normal,
            "q_ilike": f"%{q_normal}%",
            "q_ts": q_ts,
        })

    # --- 🎯 Filtros adicionales ---
    if tiporecurso:
        filter_parts.append("r.tiporecurso ILIKE :tiporecurso")
        params["tiporecurso"] = f"%{tiporecurso}%"

    if idioma:
        filter_parts.append("r.idioma ILIKE :idioma")
        params["idioma"] = f"%{idioma}%"

    if verificado is not None:
        filter_parts.append("r.verificado = :verificado")
        params["verificado"] = verificado

    if ubicacion:
        filter_parts.append("r.ubicacion ILIKE :ubicacion")
        params["ubicacion"] = f"%{ubicacion}%"

    # --- 🏷️ Filtro por etiquetas ---
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

    # --- 📅 Filtro por rango de fechas ---
    if fecha_inicio and fecha_fin:
        try:
            # Aseguramos formato DATE
            fecha_inicio_date = datetime.strptime(fecha_inicio, "%Y-%m-%d").date()
            fecha_fin_date = datetime.strptime(fecha_fin, "%Y-%m-%d").date()

            # Forzamos conversión explícita a DATE en SQL (clave del error anterior)
            filter_parts.append("DATE(r.fechapublicacion) >= :fecha_inicio AND DATE(r.fechapublicacion) <= :fecha_fin")
            params["fecha_inicio"] = fecha_inicio_date
            params["fecha_fin"] = fecha_fin_date
            print(" Fechas recibidas correctamente:", fecha_inicio_date, fecha_fin_date)
        except ValueError:
            print(" Error de formato en fecha:", fecha_inicio, fecha_fin)
            pass

    elif fecha:
        hoy = date.today()
        fecha_inicio_calc = None
        if "reciente" in fecha.lower():
            fecha_inicio_calc = hoy - timedelta(days=7)
        elif "mes" in fecha.lower():
            fecha_inicio_calc = hoy - timedelta(days=30)
        elif "año" in fecha.lower() or "anio" in fecha.lower():
            fecha_inicio_calc = hoy - timedelta(days=365)

        if fecha_inicio_calc:
            filter_parts.append("DATE(r.fechapublicacion) >= :fecha_inicio AND DATE(r.fechapublicacion) <= :fecha_fin")
            params["fecha_inicio"] = fecha_inicio_calc
            params["fecha_fin"] = hoy

    # --- 💡 Combinar condiciones ---
    conditions = []
    if search_parts:
        conditions.append("(" + " OR ".join(search_parts) + ")")
    if filter_parts:
        conditions.append("(" + " AND ".join(filter_parts) + ")")

    if conditions:
        base_query += " AND " + " AND ".join(conditions)

    # --- 🚀 Consulta final ---
    final_query = base_query + """
        GROUP BY r.idrecurso
        ORDER BY r.creadofecha DESC
        LIMIT :limit OFFSET :offset
    """
    params["limit"] = limit
    params["offset"] = offset

    rows = db.execute(text(final_query), params).fetchall()
    resultados = [dict(row._mapping) for row in rows]

    total_count = db.execute(text(
        f"SELECT COUNT(DISTINCT r.idrecurso) FROM recurso r WHERE 1=1 {' AND ' + ' AND '.join(conditions) if conditions else ''}"
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

    # 🧠 Si tiene archivo asociado, construimos la URL pública
    if recurso.archivo and recurso.archivo.rutaarchivo:
        ruta = recurso.archivo.rutaarchivo.replace("\\", "/")
        ruta_normalizada = ruta.replace("uploads/", "").lstrip("/")
        recurso.archivo.rutaarchivo = f"http://localhost:8000/uploads/{ruta_normalizada}"

    return recurso

@router.get("/{recurso_id}/detalle", response_model=dict)
def obtener_recurso_detalle(recurso_id: int, db: Session = Depends(get_db)):
    query = """
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
        WHERE r.idrecurso = :recurso_id
        GROUP BY r.idrecurso
    """
    row = db.execute(text(query), {"recurso_id": recurso_id}).fetchone()
    if not row:
        raise HTTPException(status_code=404, detail="Recurso no encontrado")
    return dict(row._mapping)
