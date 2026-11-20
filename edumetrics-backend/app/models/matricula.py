from sqlalchemy import Column, Integer, String, Float, ForeignKey
from sqlalchemy.orm import relationship
from app.core.database import Base

class Matricula(Base):
    """
    Entidad que asocia Estudiante y Curso con sus evaluaciones y asistencia.
    Base de datos transaccional que luego es procesada por el motor analítico.
    """
    __tablename__ = "matriculas"

    id = Column(Integer, primary_key=True, autoincrement=True)
    estudiante_id = Column(String(20), ForeignKey("estudiantes.id"), nullable=False, index=True)
    curso_id = Column(String(20), ForeignKey("cursos.id"), nullable=False, index=True)
    semestre = Column(String(10), nullable=False, default="2025-1") # Ej: 2025-1
    porcentaje_asistencia = Column(Float, nullable=False) # 0.0 a 100.0
    nota_parcial = Column(Float, nullable=False)           # 0.0 a 20.0
    nota_final = Column(Float, nullable=False)             # 0.0 a 20.0

    # Relaciones
    estudiante = relationship("Estudiante", back_populates="matriculas")
    curso = relationship("Curso", back_populates="matriculas")

    def __repr__(self) -> str:
        return (
            f"<Matricula(id={self.id}, estudiante='{self.estudiante_id}', "
            f"curso='{self.curso_id}', nota_final={self.nota_final})>"
        )
