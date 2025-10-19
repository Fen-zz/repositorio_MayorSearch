from sqlalchemy import Column, Integer, String, Text, Date, Boolean, DateTime, ForeignKey, func
from sqlalchemy.orm import relationship
from app.database import Base

class Recurso(Base):
    __tablename__ = "recurso"

    idrecurso = Column(Integer, primary_key=True, index=True)
    titulo = Column(String(200), nullable=False)
    tiporecurso = Column(String(50), nullable=False)
    descripcion = Column(Text)
    contenidotexto = Column(Text)
    fechapublicacion = Column(Date)
    idioma = Column(String(50))
    ubicacion = Column(String(200))
    creadofecha = Column(DateTime, server_default=func.now())
    verificado = Column(Boolean, default=False)

    idarchivo = Column(Integer, ForeignKey("archivo.idarchivo", ondelete="SET NULL"), nullable=True)
    archivo = relationship("Archivo", backref="recursos", foreign_keys=[idarchivo])

    recurso_autores = relationship("RecursoAutor", back_populates="recurso")
