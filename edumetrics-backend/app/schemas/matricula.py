from pydantic import BaseModel, Field, ConfigDict

class MatriculaBase(BaseModel):
    estudiante_id: str
    curso_id: str
    semestre: str = "2025-1"
    porcentaje_asistencia: float = Field(..., ge=0.0, le=100.0)
    nota_parcial: float = Field(..., ge=0.0, le=20.0)
    nota_final: float = Field(..., ge=0.0, le=20.0)

class MatriculaCreate(MatriculaBase):
    pass

class MatriculaResponse(MatriculaBase):
    id: int
    model_config = ConfigDict(from_attributes=True)
