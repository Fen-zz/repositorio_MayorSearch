from sqlalchemy import Column, Integer, String, TIMESTAMP, CheckConstraint, DateTime
from app.database import Base
from datetime import datetime
from sqlalchemy.orm import relationship

class Usuario(Base):
    __tablename__ = "usuario"  # nombre exacto en PostgreSQL (minúsculas)

    idusuario = Column(Integer, primary_key=True, index=True)
    nombreusuario = Column(String(100), nullable=False)
    telefono = Column(String(20))
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(200), nullable=True)
    proveedor = Column(String(50))
    idproveedor = Column(String(100))
    codigoestudiantil = Column(String(50))
    rol = Column(String(50), nullable=False, default="normal")
    fechacreacion = Column(DateTime, default=datetime.utcnow) 

    __table_args__ = (
        CheckConstraint("rol IN ('normal','docente','admin')", name="rol_check"),
    )
    
    favoritos_usuario = relationship("Favorito", back_populates="usuario")
