from fastapi import FastAPI
from models import Base
from database import engine
from routes import usuario  # Importa el nuevo archivo de rutas

# Crear las tablas si no existen
Base.metadata.create_all(bind=engine)

# Instancia principal de FastAPI
app = FastAPI()

# Incluir las rutas del módulo usuario
app.include_router(usuario.router)

# Ruta base
@app.get("/")
def read_root():
    return {"mensaje": "Bienvenido al repositorio académico Operación Calabaza"}

