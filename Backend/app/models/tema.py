from sqlalchemy import Column, Integer, String, ForeignKey
from sqlalchemy.orm import relationship
from app.database import Base

class Tema(Base):
    __tablename__ = "tema"

    idtema = Column(Integer, primary_key=True, index=True)
    nombretema = Column(String(100), nullable=False)
    idtemapadre = Column(Integer, ForeignKey("tema.idtema", ondelete="SET NULL"))

    # Relación con sí misma (para subtemas)
    subtemas = relationship("Tema", backref="tema_padre", remote_side=[idtema])

    # Relación con la tabla intermedia recurso_tema
    recurso_temas = relationship("RecursoTema", back_populates="tema", cascade="all, delete, delete-orphan")
