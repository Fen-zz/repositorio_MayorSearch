# app/models/favorito.py
from sqlalchemy import Column, Integer, ForeignKey, DateTime, func
from sqlalchemy.orm import relationship
from app.database import Base

class Favorito(Base):
    __tablename__ = "favorito"

    idusuario = Column(Integer, ForeignKey("usuario.idusuario", ondelete="CASCADE"), primary_key=True)
    idrecurso = Column(Integer, ForeignKey("recurso.idrecurso", ondelete="CASCADE"), primary_key=True)
    agregadofecha = Column(DateTime(timezone=False), server_default=func.now())

    # Opcional: relaciones para navegar desde Favorito a Recurso / Usuario
    recurso = relationship("Recurso", back_populates="favoritos")
    usuario = relationship("Usuario", back_populates="favoritos_usuario")