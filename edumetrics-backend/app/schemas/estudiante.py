from pydantic import BaseModel, Field, ConfigDict

class EstudianteBase(BaseModel):
    id: str = Field(..., description="Código del estudiante", json_schema_extra={"example": "U2021001"})
    nombre: str = Field(..., description="Nombre completo", json_schema_extra={"example": "Juan Pérez"})
    carrera: str = Field(..., description="Carrera profesional", json_schema_extra={"example": "Ingeniería de Sistemas"})

class EstudianteCreate(EstudianteBase):
    pass

class EstudianteResponse(EstudianteBase):
    model_config = ConfigDict(from_attributes=True)
