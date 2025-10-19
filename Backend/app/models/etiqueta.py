from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base

class Etiqueta(Base):
    __tablename__ = "etiqueta"

    idetiqueta = Column(Integer, primary_key=True, index=True)
    nombreetiqueta = Column(String(100), nullable=False, unique=True)

    # Relación con recurso_etiqueta
    recursos = relationship("RecursoEtiqueta", back_populates="etiqueta")
