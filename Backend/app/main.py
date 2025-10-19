from fastapi import FastAPI
from app.database import Base, engine
from app.models import usuario, autor, recurso_autor, recurso, tema, recurso_tema
from app.routes import usuario as usuario_routes  
from app.routes import recurso as recurso_routes
from app.routes import autor as autor_routes
from app.routes import recurso_autor as recurso_autor_routes
from app.routes import tema as tema_routes
from app.routes import recurso_tema as recurso_tema_routes

Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(usuario_routes.router)  
app.include_router(recurso_routes.router)
app.include_router(autor_routes.router)
app.include_router(recurso_autor_routes.router)
app.include_router(tema_routes.router)
app.include_router(recurso_tema_routes.router)

@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido al repositorio académico Mayorsearch"}
