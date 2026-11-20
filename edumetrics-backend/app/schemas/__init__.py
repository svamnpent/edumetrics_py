from app.schemas.estudiante import EstudianteBase, EstudianteCreate, EstudianteResponse
from app.schemas.curso import CursoBase, CursoCreate, CursoResponse
from app.schemas.matricula import MatriculaBase, MatriculaCreate, MatriculaResponse
from app.schemas.analytics import (
    KPISummary,
    CorrelacionResponse,
    DesaprobadosPorCurso,
    StudentRankingItem,
    RiskStudentItem,
    ScatterPoint,
)

__all__ = [
    "EstudianteBase", "EstudianteCreate", "EstudianteResponse",
    "CursoBase", "CursoCreate", "CursoResponse",
    "MatriculaBase", "MatriculaCreate", "MatriculaResponse",
    "KPISummary", "CorrelacionResponse", "DesaprobadosPorCurso",
    "StudentRankingItem", "RiskStudentItem", "ScatterPoint"
]
