from sqlalchemy import Column, Integer, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class RecursoAutor(Base):
    __tablename__ = "recurso_autor"

    idrecurso = Column(Integer, ForeignKey("recurso.idrecurso", ondelete="CASCADE"), primary_key=True)
    idautor = Column(Integer, ForeignKey("autor.idautor", ondelete="CASCADE"), primary_key=True)
    orden = Column(Integer)

    recurso = relationship("Recurso", back_populates="recurso_autores")
    autor = relationship("Autor", back_populates="recursos")
