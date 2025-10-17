from sqlalchemy import Column, Integer, String, DateTime, func
from app.database import Base

class Archivo(Base):
    __tablename__ = "archivo"

    idarchivo = Column("idarchivo", Integer, primary_key=True, index=True)
    nombreoriginal = Column("nombreoriginal", String(255))
    rutaarchivo = Column("rutaarchivo", String(500), nullable=False)
    tipoarchivo = Column("tipoarchivo", String(100))
    tamano = Column("tamano", Integer)
    fechasubida = Column("fechasubida", DateTime, server_default=func.now())
