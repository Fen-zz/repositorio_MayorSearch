from sqlalchemy import create_engine, MetaData
from sqlalchemy.orm import sessionmaker, declarative_base

# Configuración de la conexión
DATABASE_URL = "postgresql://postgres:admin@localhost/repositoriomayorsearch"

# Crear el motor de conexión
engine = create_engine(DATABASE_URL)

# Crea una sesión para interactuar con la base de datos
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

# Base para los modelos (tablas)
Base = declarative_base()

# Metadatos (útiles para crear o eliminar tablas desde el código)
metadata = MetaData()

def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
