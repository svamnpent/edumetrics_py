from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session

from app.api.deps import get_db
from app.services.academic_service import AcademicService
from app.schemas.analytics import (
    KPISummary,
    CorrelacionResponse,
    DesaprobadosPorCurso,
    StudentRankingItem,
    RiskStudentItem
)

router = APIRouter()

@router.get("/kpis", response_model=KPISummary, summary="Obtener KPIs Ejecutivos")
def get_kpis(db: Session = Depends(get_db)):
    """
    Retorna métricas globales calculadas con Pandas y NumPy:
    total alumnos, cursos, promedio general, tasa de aprobación y correlación global.
    """
    service = AcademicService(db)
    analizador = service.get_analizador()
    return analizador.generar_kpis()


@router.get("/correlacion", response_model=CorrelacionResponse, summary="Datos de Correlación Asistencia vs Nota")
def get_correlacion(db: Session = Depends(get_db)):
    """
    Retorna coeficiente de Pearson, línea de regresión y puntos individuales
    para graficar el Scatter Plot en Angular.
    """
    service = AcademicService(db)
    analizador = service.get_analizador()
    return analizador.analizar_correlacion_asistencia()


@router.get("/desaprobados-por-curso", response_model=List[DesaprobadosPorCurso], summary="Desaprobados por Asignatura")
def get_desaprobados_por_curso(db: Session = Depends(get_db)):
    """
    Retorna el porcentaje y total de alumnos desaprobados por cada curso
    para alimentar gráficos de barras en el frontend.
    """
    service = AcademicService(db)
    analizador = service.get_analizador()
    return analizador.obtener_desaprobados_por_curso()


@router.get("/ranking", response_model=List[StudentRankingItem], summary="Cuadro de Honor y Ranking Estudiantil")
def get_ranking(db: Session = Depends(get_db)):
    """
    Retorna ranking ordenado por promedio ponderado de créditos,
    calculando décimo, quinto y tercio superior mediante percentiles.
    """
    service = AcademicService(db)
    analizador = service.get_analizador()
    return analizador.generar_ranking()


@router.get("/estudiantes-riesgo", response_model=List[RiskStudentItem], summary="Alerta Temprana de Alumnos en Riesgo")
def get_estudiantes_en_riesgo(db: Session = Depends(get_db)):
    """
    Detecta estudiantes con riesgo de desaprobación o inhabilitación por inasistencias,
    calculando Z-Scores y alertas de intervención temprana.
    """
    service = AcademicService(db)
    analizador = service.get_analizador()
    return analizador.detectar_estudiantes_en_riesgo()
