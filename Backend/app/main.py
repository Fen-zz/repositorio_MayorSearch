from fastapi import FastAPI
from app.database import Base, engine
from app.models import usuario, autor, recurso  
from app.routes import usuario as usuario_routes  
from app.routes import recurso as recurso_routes
from app.routes import autor as autor_routes
Base.metadata.create_all(bind=engine)

app = FastAPI()

app.include_router(usuario_routes.router)  
app.include_router(recurso_routes.router)
app.include_router(autor_routes.router)

@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido al repositorio académico Mayorsearch"}
