from dotenv import load_dotenv
load_dotenv()

import os
print("GOOGLE_CLIENT_ID cargado:", os.getenv("GOOGLE_CLIENT_ID"))

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import Base, engine
from app.models import usuario, autor, recurso_autor, recurso, tema, recurso_tema, etiqueta, recurso_etiqueta
from app.routes import usuario as usuario_routes  
from app.routes import recurso as recurso_routes
from app.routes import autor as autor_routes
from app.routes import recurso_autor as recurso_autor_routes
from app.routes import tema as tema_routes
from app.routes import recurso_tema as recurso_tema_routes
from app.routes import etiqueta as etiqueta_routes
from app.routes import recurso_etiqueta as recurso_etiqueta_routes
from app.routes import favorito as favorito_routes
from app.routes import debug_token as debug_token_routes
from fastapi.staticfiles import StaticFiles

# Crea las tablas
Base.metadata.create_all(bind=engine)

# Instancia principal de FastAPI
app = FastAPI()

# 🔥 Configura los orígenes permitidos
origins = [
    "http://localhost:5173",
    "http://127.0.0.1:5173"
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Incluye los routers
app.include_router(usuario_routes.router)  
app.include_router(recurso_routes.router)
app.include_router(autor_routes.router)
app.include_router(recurso_autor_routes.router)
app.include_router(tema_routes.router)
app.include_router(recurso_tema_routes.router)
app.include_router(etiqueta_routes.router)
app.include_router(recurso_etiqueta_routes.router)
app.include_router(favorito_routes.router)
app.include_router(debug_token_routes.router)

@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido al repositorio académico Mayorsearch"}

from fastapi.security import OAuth2PasswordBearer
from fastapi.openapi.utils import get_openapi

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

def custom_openapi():
    if app.openapi_schema:
        return app.openapi_schema
    openapi_schema = get_openapi(
        title="MayorSearch API",
        version="1.0.0",
        description="Documentación interactiva de la API de MayorSearch",
        routes=app.routes,
    )
    openapi_schema["components"]["securitySchemes"] = {
        "BearerAuth": {
            "type": "http",
            "scheme": "bearer",
            "bearerFormat": "JWT"
        }
    }
    for path in openapi_schema["paths"]:
        for method in openapi_schema["paths"][path]:
            openapi_schema["paths"][path][method]["security"] = [{"BearerAuth": []}]
    app.openapi_schema = openapi_schema
    return app.openapi_schema

app.openapi = custom_openapi

from fastapi.responses import FileResponse, Response
from fastapi import HTTPException, Request
import os

# ✅ Ruta única y controlada para servir PDFs con CORS permitido
@app.get("/uploads/recursos/{filename}")
async def serve_pdf(filename: str, request: Request):
    file_path = os.path.join("uploads/recursos", filename)

    if not os.path.exists(file_path):
        raise HTTPException(status_code=404, detail="Archivo no encontrado")

    response = FileResponse(file_path, media_type="application/pdf")

    # CORS manual (flexible y sin bloqueos)
    origin = request.headers.get("origin")
    if origin in ["http://localhost:5173", "http://127.0.0.1:5173"]:
        response.headers["Access-Control-Allow-Origin"] = origin
    else:
        response.headers["Access-Control-Allow-Origin"] = "*"

    response.headers["Access-Control-Allow-Methods"] = "GET, OPTIONS"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Expose-Headers"] = "Content-Disposition"

    return response


# ✅ Preflight OPTIONS (para que el navegador no se ponga intenso)
@app.options("/uploads/recursos/{filename}")
async def options_pdf(filename: str):
    return Response(status_code=200, headers={
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type",
    })

