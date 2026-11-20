from pydantic import BaseModel, Field, ConfigDict

class CursoBase(BaseModel):
    id: str = Field(..., description="Código del curso", json_schema_extra={"example": "CS101"})
    nombre: str = Field(..., description="Nombre de la asignatura", json_schema_extra={"example": "Algoritmos y Estructuras de Datos"})
    creditos: int = Field(default=4, ge=1, le=10, description="Créditos académicos")

class CursoCreate(CursoBase):
    pass

class CursoResponse(CursoBase):
    model_config = ConfigDict(from_attributes=True)
