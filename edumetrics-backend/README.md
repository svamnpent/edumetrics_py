# EduMetrics Analytics - Backend API

Plataforma multiparadigma en **Python** para el **Análisis de Rendimiento Académico, Correlación Asistencia vs. Calificaciones y Alerta Temprana de Deserción Universitaria**.

Diseñado para integrarse con un frontend en **Angular** y una base de datos relacional **SQLite**.

---

## 📋 Alineación con la Rúbrica de Evaluación

| Criterio de la Rúbrica | Implementación en este Repositorio | Ubicación en el Código |
| :--- | :--- | :--- |
| **1. Paradigmas de Programación (25%)** | • **POO:** Clases de dominio (`Estudiante`, `Curso`, `Matricula`), encapsulamiento y orquestador `AnalizadorAcademico`.<br>• **Funcional:** Funciones puras, lambdas, closures (`make_risk_classifier`), `map`, `filter`, `functools.reduce` e inmutabilidad (`pandas.pipe`). | `app/analytics/engine.py`<br>`app/analytics/functional_pipeline.py`<br>`app/models/` |
| **2. Diseño y Modularidad (20%)** | Arquitectura Limpia por capas: Modelos (ORM), Schemas (DTOs Pydantic), Servicios de Negocio, Motor Analítico y Controladores REST (FastAPI). | Estructura modular en `app/` |
| **3. Tratamiento de Datos (20%)** | • **Pandas:** Limpieza de registros nulos, rangos inválidos, deduplicación, resampleo y lectura desde BD con `pd.read_sql`.<br>• **NumPy:** Vectorización de Z-Scores, percentiles para rankings y coeficiente de correlación de Pearson (`np.corrcoef`). | `app/analytics/functional_pipeline.py`<br>`app/services/academic_service.py` |
| **4. Resultados y Pruebas (15%)** | Suite completa de pruebas unitarias con `pytest` que validan cálculos estadísticos y casos borde. Endpoints estructurados para gráficos de Angular. | `tests/test_analytics.py`<br>`app/api/v1/endpoints/analytics.py` |
| **5. Documentación (10%)** | Swagger UI autogenerado, documentación OpenAPI detallada, tipos con Type Hinting y README con diagramas. | `http://localhost:8000/docs` |

---

## 🏛️ Arquitectura del Sistema

```
[ Frontend: Angular Dashboard ]
          │ (HTTP / JSON)
          ▼
[ FastAPI Controllers (app/api/v1/) ]
          │
          ├──▶ [ SQLAlchemy ORM (app/models/) ] ──▶ [ Base de Datos: SQLite (academico.db) ]
          │                                                       │
          │                                                       │ (pd.read_sql)
          ▼                                                       ▼
[ Servicios Académicos (app/services/) ] ◀────────────────────────┘
          │
          ├──▶ [ POO: AnalizadorAcademico (app/analytics/engine.py) ]
          │            │
          │            ▼ (composición funcional)
          └──▶ [ Funcional: Pipelines Puros & NumPy (app/analytics/functional_pipeline.py) ]
```

---

## 🚀 Requisitos e Instalación

### 1. Clonar o descargar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO>
cd edumetrics-backend
```

### 2. Crear y activar entorno virtual
En Windows (PowerShell):
```powershell
python -m venv venv
.\venv\Scripts\Activate.ps1
```

### 3. Instalar dependencias
```bash
pip install -r requirements.txt
```

---

## 🖥️ Ejecución del Servidor

Inicia el servidor backend en modo desarrollo:
```bash
uvicorn app.main:app --reload --port 8000
```

* **API Principal:** `http://localhost:8000`
* **Documentación Interactiva (Swagger UI):** `http://localhost:8000/docs`
* **Especificación OpenAPI (ReDoc):** `http://localhost:8000/redoc`

---

## 🧪 Ejecución de Pruebas Unitarias

Para ejecutar la suite de pruebas con `pytest`:
```bash
pytest -v
```

---

## 📊 Endpoints Clave para el Frontend en Angular

| Método | Endpoint | Descripción | Gráfico / Componente Angular |
| :--- | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/kpis` | Métricas globales (promedio, tasa de aprobación, r de Pearson). | Tarjetas de KPIs |
| `GET` | `/api/v1/analytics/correlacion` | Puntos individuales y línea de regresión (asistencia vs nota). | **Scatter Plot** con línea de tendencia |
| `GET` | `/api/v1/analytics/desaprobados-por-curso` | Tasa de reprobación por asignatura. | **Gráfico de Barras** |
| `GET` | `/api/v1/analytics/ranking` | Cuadro de honor ordenado con percentiles (Tercio, Quinto, Décimo). | **Tabla de Posiciones** con insignias |
| `GET` | `/api/v1/analytics/estudiantes-riesgo` | Lista de alumnos con alertas tempranas y Z-Score. | **Tabla de Alertas Críticas** |
| `POST` | `/api/v1/matriculas/upload-csv` | Carga masiva de actas en CSV con validación en Pandas. | **Modal de Carga de Archivos** |
| `POST` | `/api/v1/matriculas/seed` | Genera datos sintéticos iniciales con correlación real. | Botón de demostración rápida |
