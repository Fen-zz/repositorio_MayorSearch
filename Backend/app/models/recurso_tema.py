from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RecursoTema(Base):
    __tablename__ = "recurso_tema"

    idrecurso = Column(Integer, ForeignKey("recurso.idrecurso", ondelete="CASCADE"), primary_key=True)
    idtema = Column(Integer, ForeignKey("tema.idtema", ondelete="CASCADE"), primary_key=True)

    recurso = relationship("Recurso", back_populates="recurso_temas")
    tema = relationship("Tema", back_populates="recurso_temas")
