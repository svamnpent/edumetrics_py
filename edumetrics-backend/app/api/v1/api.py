from fastapi import APIRouter
from app.api.v1.endpoints import analytics, estudiantes, cursos, matriculas

api_router = APIRouter()

api_router.include_router(analytics.router, prefix="/analytics", tags=["Analítica y Gráficos (Pandas/NumPy)"])
api_router.include_router(estudiantes.router, prefix="/estudiantes", tags=["Gestión de Estudiantes"])
api_router.include_router(cursos.router, prefix="/cursos", tags=["Gestión de Cursos"])
api_router.include_router(matriculas.router, prefix="/matriculas", tags=["Matrículas, Notas y Carga CSV"])
