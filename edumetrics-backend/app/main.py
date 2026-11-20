"""
Punto de Entrada de la Aplicación FastAPI (Backend EduMetrics).
Inicializa la base de datos SQLite, configura CORS para Angular
y expone la documentación interactiva Swagger/OpenAPI.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.core.database import Base, engine
from app.api.v1.api import api_router

# 1. Crear las tablas en la Base de Datos SQLite al iniciar
Base.metadata.create_all(bind=engine)

# 2. Inicializar FastAPI con metadatos para la documentación (Criterio 5 de la rúbrica)
app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="""
    ## API de Analítica de Rendimiento Académico y Alerta Temprana (EduMetrics)
    
    Backend multiparadigma desarrollado en Python que combina:
    * **Paradigma Orientado a Objetos**: Modelado de dominio con SQLAlchemy y servicios encapsulados.
    * **Paradigma Funcional**: Pipelines puros, lambdas, map, filter, functools.reduce e inmutabilidad.
    * **Análisis de Datos con Pandas & NumPy**: Limpieza de datos, Z-Score, percentiles y correlación de Pearson.
    * **Persistencia Relacional**: SQLite vía SQLAlchemy ORM y lectura analítica mediante `pd.read_sql`.
    * **Preparado para Frontend Angular**: Endpoints estructurados para gráficos interactivos.
    """,
    openapi_tags=[
        {"name": "Analítica y Gráficos (Pandas/NumPy)", "description": "Endpoints de análisis estadístico para el Dashboard en Angular"},
        {"name": "Matrículas, Notas y Carga CSV", "description": "Endpoints transaccionales y carga masiva de archivos CSV"},
        {"name": "Gestión de Estudiantes", "description": "Operaciones sobre la entidad Estudiante"},
        {"name": "Gestión de Cursos", "description": "Operaciones sobre la entidad Curso"}
    ]
)

# 3. Configuración de CORS para permitir peticiones desde Angular
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# 4. Incluir Rutas
app.include_router(api_router, prefix=settings.API_V1_STR)

@app.get("/", tags=["Health"])
def health_check():
    return {
        "status": "online",
        "app": settings.PROJECT_NAME,
        "docs": "/docs",
        "version": settings.VERSION
    }
