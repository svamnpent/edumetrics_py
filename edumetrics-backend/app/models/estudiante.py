from sqlalchemy import Column, String
from sqlalchemy.orm import relationship
from app.core.database import Base

class Estudiante(Base):
    """
    Modelo de Dominio (POO) y Entidad ORM para Estudiantes.
    """
    __tablename__ = "estudiantes"

    id = Column(String(20), primary_key=True, index=True) # Ej: U2021001
    nombre = Column(String(100), nullable=False)
    carrera = Column(String(100), nullable=False)

    # Relación uno a muchos con Matrícula
    matriculas = relationship("Matricula", back_populates="estudiante", cascade="all, delete-orphan")

    def __repr__(self) -> str:
        return f"<Estudiante(id='{self.id}', nombre='{self.nombre}', carrera='{self.carrera}')>"
