from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from app.database import Base


class Autor(Base):
    __tablename__ = "autor"

    idautor = Column(Integer, primary_key=True, index=True)
    nombreautor = Column(String(150), nullable=False)
    profileurl = Column(String(250))
    orcid = Column(String(50))

    recursos = relationship("RecursoAutor", back_populates="autor", cascade="all, delete, delete-orphan")
