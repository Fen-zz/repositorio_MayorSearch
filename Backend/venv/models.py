from sqlalchemy import Column, Integer, String, TIMESTAMP, CheckConstraint
from database import Base

class Usuario(Base):
    __tablename__ = "usuario"  # nombre exacto en PostgreSQL (minúsculas)

    idusuario = Column(Integer, primary_key=True, index=True)
    nombreusuario = Column(String(100), nullable=False)
    telefono = Column(String(20))
    email = Column(String(150), unique=True, nullable=False)
    password = Column(String(200), nullable=False)
    proveedor = Column(String(50))
    idproveedor = Column(String(100))
    codigoestudiantil = Column(String(50))
    rol = Column(String(20))
    fechacreacion = Column(TIMESTAMP)

    __table_args__ = (
        CheckConstraint("Rol IN ('normal','docente','admin')", name="rol_check"),
    )
