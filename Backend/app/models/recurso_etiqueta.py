from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RecursoEtiqueta(Base):
    __tablename__ = "recurso_etiqueta"

    idrecurso = Column(Integer, ForeignKey("recurso.idrecurso", ondelete="CASCADE"), primary_key=True)
    idetiqueta = Column(Integer, ForeignKey("etiqueta.idetiqueta", ondelete="CASCADE"), primary_key=True)

    recurso = relationship("Recurso", back_populates="recurso_etiquetas")
    etiqueta = relationship("Etiqueta", back_populates="recursos")
