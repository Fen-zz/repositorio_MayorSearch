from fastapi import FastAPI
from app.database import Base, engine
from app.models import usuario  # ✅ (puede quedarse si lo necesitas para crear tablas)
from app.routes import usuario as usuario_routes  # ✅ importa el archivo correcto

Base.metadata.create_all(bind=engine)

app = FastAPI()

# 👇 Cambia esta línea:
app.include_router(usuario_routes.router)  # ✅ usa usuario_routes, no usuario

@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido al repositorio académico Mayorsearch"}
