from sqlalchemy import Column, String, Integer
from sqlalchemy.orm import relationship
from app.core.database import Base

class Curso(Base):
    """
    Modelo de Dominio (POO) y Entidad ORM para Cursos.
    """
    __tablename__ = "cursos"

    id = Column(String(20), primary_key=True, index=True) # Ej: CS101
    nombre = Column(String(100), nullable=False)
    creditos = Column(Integer, nullable=False, default=4)

    matriculas = relationship("Matricula", back_populates="curso", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Curso(id='{self.id}', nombre='{self.nombre}', creditos={self.creditos})>"
