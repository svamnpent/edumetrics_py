from typing import List, Optional
from pydantic import BaseModel

class KPISummary(BaseModel):
    total_estudiantes: int
    total_cursos: int
    promedio_general: float
    tasa_aprobacion_global: float
    correlacion_asistencia_nota: float

class ScatterPoint(BaseModel):
    estudiante_id: str
    estudiante_nombre: str
    curso_nombre: str
    asistencia: float
    nota_final: float

class CorrelacionResponse(BaseModel):
    coeficiente_pearson: float
    interpretacion: str
    puntos: List[ScatterPoint]
    linea_tendencia: dict  # pendiente, intercepto para graficar línea en Angular

class DesaprobadosPorCurso(BaseModel):
    curso_id: str
    curso_nombre: str
    total_alumnos: int
    total_desaprobados: int
    tasa_reprobacion_pct: float
    promedio_curso: float

class StudentRankingItem(BaseModel):
    puesto: int
    estudiante_id: str
    nombre: str
    carrera: str
    promedio_ponderado: float
    categoria_rendimiento: str  # 'Décimo Superior', 'Quinto Superior', 'Tercio Superior', 'Regular'

class RiskStudentItem(BaseModel):
    estudiante_id: str
    nombre: str
    curso_nombre: str
    asistencia: float
    nota_final: float
    z_score: float
    nivel_riesgo: str  # 'ALTO RIESGO', 'RIESGO MEDIO'
    motivo: str
