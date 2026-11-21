# EduMetrics Analytics
### Plataforma Integral de Analítica de Rendimiento Académico y Alerta Temprana Universitaria

[![Python](https://img.shields.io/badge/Python-3.11%2B-blue.svg?logo=python&logoColor=white)](https://www.python.org/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.110%2B-009688.svg?logo=fastapi&logoColor=white)](https://fastapi.tiangolo.com/)
[![Angular](https://img.shields.io/badge/Angular-17%2B-DD0031.svg?logo=angular&logoColor=white)](https://angular.io/)
[![SQLite](https://img.shields.io/badge/SQLite-3-003B57.svg?logo=sqlite&logoColor=white)](https://www.sqlite.org/)
[![Pandas](https://img.shields.io/badge/Pandas-2.2%2B-150458.svg?logo=pandas&logoColor=white)](https://pandas.pydata.org/)
[![NumPy](https://img.shields.io/badge/NumPy-1.26%2B-013243.svg?logo=numpy&logoColor=white)](https://numpy.org/)
[![pytest](https://img.shields.io/badge/Tests-pytest-0A9EDC.svg?logo=pytest&logoColor=white)](https://pytest.org/)

---

## 1. Introducción y Propósito

**EduMetrics** es una solución de software de arquitectura desacoplada (*Full-Stack*) diseñada para responder a uno de los mayores desafíos en la educación superior: **la detección oportuna de estudiantes en riesgo de deserción y el análisis multifactorial del rendimiento académico**.

A diferencia de los sistemas tradicionales basados únicamente en consultas SQL estáticas, EduMetrics combina un **motor de análisis de datos vectorizado (Pandas y NumPy)** con un diseño **multiparadigma (POO + Programación Funcional)**. La plataforma procesa actas de calificaciones y registros de asistencia, analiza correlaciones estadísticas y proyecta visualizaciones dinámicas e interactivas en un panel desarrollado en **Angular**.

---

## 2. Flujo General del Sistema (End-to-End)

El sistema opera bajo un ciclo de vida continuo dividido en 4 fases sincronizadas entre **Frontend**, **Backend**, **Base de Datos** y el **Motor Analítico**:

```
 ┌────────────────────────────────────────────────────────────────────────┐
 │                      1. FRONTEND (Angular 17+)                         │
 │                                                                        │
 │   [ Panel de KPIs ]    [ Gráfico Scatter ]     [ Cuadro de Honor ]     │
 │   [ Carga CSV Acta ]   [ Gráfico de Barras ]   [ Alertas de Riesgo ]   │
 └───────────────────▲────────────────────────────────────┬───────────────┘
                     │ (JSON con Métricas y Gráficos)     │ (HTTP POST / GET)
                     │                                    ▼
 ┌───────────────────┴────────────────────────────────────────────────────┐
 │                   2. BACKEND API (FastAPI en Python)                   │
 │                                                                        │
 │   • Controladores REST (`/api/v1/analytics`, `/matriculas`, etc.)      │
 │   • Validación estricta con Pydantic V2                                │
 │   • Inyección de dependencias y CORS para localhost:4200               │
 └───────┬────────────────────────────────────────────▲───────────────────┘
         │                                            │
         │ (1. Carga masiva / Persistencia)           │ (3. Ingesta a DataFrames)
         ▼                                            │    `pd.read_sql()`
 ┌───────────────────────────────────┐    ┌───────────┴───────────────────┐
 │    3. BASE DE DATOS (SQLite)      │    │    4. MOTOR DE ANALÍTICA      │
 │                                   │    │       (Pandas + NumPy)        │
 │  • Tabla `estudiantes`            │───▶│                               │
 │  • Tabla `cursos`                 │    │  • Limpieza funcional (.pipe) │
 │  • Tabla `matriculas` (asistencia │    │  • Coeficiente de Pearson (r) │
 │    y calificaciones)              │    │  • Vectorización Z-Score      │
 │                                   │    │  • Percentiles y Ponderados   │
 └───────────────────────────────────┘    └───────────────────────────────┘
```

### Detalle del Ciclo de Datos:

1. **Ingesta y Validación de Datos:**
   * El usuario en **Angular** puede registrar calificaciones individuales o subir un archivo masivo (`.csv`).
   * **FastAPI** recibe el archivo, **Pandas** valida tipos de datos, elimina duplicados y filtra notas/asistencias fuera de rango mediante una función pura de limpieza.
   * Los registros válidos se persisten relacionalmente en **SQLite** utilizando el ORM **SQLAlchemy**.

2. **Persistencia Relacional:**
   * **SQLite** almacena de manera estructurada las entidades `Estudiante`, `Curso` y la asociación transaccional `Matricula`. Esto garantiza que los datos perduren entre reinicios del servidor y permite operaciones CRUD en tiempo real.

3. **Extracción y Procesamiento Analítico:**
   * Cuando el dashboard de Angular solicita métricas, el servicio del backend extrae la información consolidada con `pd.read_sql()`.
   * El orquestador **POO** (`AnalizadorAcademico`) delega el cálculo matemático en un pipeline **Funcional puro** (`functional_pipeline.py`):
     * **NumPy (`np.corrcoef` y `np.polyfit`):** Determina si existe correlación estadística entre asistencia y notas, calculando la recta de regresión.
     * **NumPy (`np.std` y Z-Score):** Detecta calificaciones atípicas y anomalías de desempeño.
     * **Pandas (`groupby`, percentiles):** Genera tasas de reprobación por curso y rangos de mérito (Tercio, Quinto y Décimo Superior).
     * **Funcional (`functools.reduce` y `map`):** Calcula promedios ponderados por créditos e inyecta categorías de riesgo.

4. **Visualización Reactiva:**
   * **FastAPI** serializa las estructuras en DTOs JSON normalizados.
   * **Angular** consume estos datos mediante servicios HTTP reactivos (`HttpClient`, `RxJS`) y los renderiza en componentes interactivos con gráficos de dispersión, barras y tablas de alerta.

---

## 3. Alineación con la Rúbrica de Evaluación

| Criterio | Peso | Requisito para 20 Puntos | Implementación en EduMetrics |
| :--- | :---: | :--- | :--- |
| **1. Paradigmas de Programación** | **25%** | Integración eficiente de Paradigma Funcional y Multiparadigma (POO). | **POO:** Clases de dominio con SQLAlchemy (`Estudiante`, `Curso`, `Matricula`) y clase orquestadora `AnalizadorAcademico`.<br>**Funcional:** Funciones puras e idempotentes, closures/fábricas (`make_risk_classifier`), `map`, `filter`, `functools.reduce` para promedios ponderados e inmutabilidad (`df.pipe`). |
| **2. Diseño y Modularidad** | **20%** | Código estructurado, reutilizable, modular y con separación de capas. | Arquitectura Limpia por capas: `core/`, `models/`, `schemas/`, `analytics/`, `services/`, `api/`. Código fuertemente tipado (*Type Hinting*) y reutilizable. |
| **3. Tratamiento de Datos** | **20%** | Uso correcto de `pandas` y `numpy` para limpieza, transformación y análisis. | Limpieza de inconsistencias con Pandas, lectura SQL directa con `pd.read_sql`, correlación de Pearson con `np.corrcoef`, regresión lineal con `np.polyfit`, Z-Scores normalizados y percentiles. |
| **4. Resultados y Pruebas** | **15%** | Pruebas documentadas y visualizaciones claras y pertinentes. | Suite completa de pruebas con `pytest` (`tests/test_analytics.py`) validando casos borde. Gráficos de dispersión, barras y tablas para el Frontend Angular. |
| **5. Documentación del Proyecto** | **10%** | Informe completo, objetivos, diseño, pruebas, código comentado y fuentes. | Documentación interactiva Swagger UI (`/docs`), OpenAPI ReDoc (`/redoc`), comentarios de estándar Google/Sphinx y este README exhaustivo. |
| **6. Exposición y Preguntas** | **10%** | Presentación clara, dominio técnico del código y arquitectura. | Arquitectura sólida y justificada: separación cliente-servidor profesional fácil de exponer y defender ante el jurado. |

---

## 4. Stack Tecnológico

### Backend (Python)
* **FastAPI (v0.110+):** Framework web asíncrono de alto rendimiento con generación automática de especificaciones OpenAPI.
* **SQLAlchemy (v2.0+):** ORM para modelado de objetos y persistencia relacional.
* **Pandas (v2.2+) & NumPy (v1.26+):** Motor de cálculo matricial, transformaciones de series temporales y análisis estadístico.
* **Pydantic V2:** Validación de esquemas y serialización de datos con tipado estricto.
* **Pytest (v8.1+):** Entorno de pruebas unitarias y de integración.

### Base de Datos
* **SQLite 3:** Motor relacional embebido *zero-configuration*, gestionado de forma transaccional mediante `academico.db`.

### Frontend (Angular)
* **Angular 17+:** Arquitectura basada en componentes independientes (*Standalone Components*).
* **TypeScript & RxJS:** Tipado estático sincronizado con los esquemas del Backend y manejo reactivo de flujos HTTP.
* **ApexCharts / Chart.js:** Renderizado de gráficos estadísticos (Scatter Plot, Bar Charts, Donut Charts).

---

## 5. Estructura del Proyecto (Backend y Frontend)

El proyecto adopta una arquitectura **Full-Stack desacoplada** organizada en dos carpetas independientes: **`edumetrics-backend`** (servidor API en Python, persistencia SQLite y motor analítico con Pandas/NumPy) y **`edumetrics-frontend`** (interfaz interactiva desarrollada en Angular 21 con Chart.js).

```text
proyecto-edumetrics/
│
├── edumetrics-backend/                  # CAPA DEL SERVIDOR (Python & FastAPI)
│   ├── app/
│   │   ├── main.py                         # Entrypoint FastAPI, CORS para Angular y Swagger UI
│   │   ├── core/
│   │   │   ├── config.py                   # Configuraciones globales, rutas y variables
│   │   │   └── database.py                 # Conexión SQLAlchemy y sesión SQLite
│   │   ├── models/                         # [POO] Modelos de Dominio y Tablas ORM
│   │   │   ├── estudiante.py               # Entidad Estudiante
│   │   │   ├── curso.py                    # Entidad Curso
│   │   │   └── matricula.py                # Entidad Matricula (calificaciones y asistencia)
│   │   ├── schemas/                        # [DTOs] Validación y serialización con Pydantic V2
│   │   │   ├── estudiante.py
│   │   │   ├── curso.py
│   │   │   ├── matricula.py
│   │   │   └── analytics.py                # Esquemas tipados para los gráficos de Angular
│   │   ├── analytics/                      # [MOTOR ANALÍTICO MULTIPARADIGMA]
│   │   │   ├── functional_pipeline.py      # Funciones puras, lambdas, reduce, Z-Score y NumPy
│   │   │   └── engine.py                   # [POO] Clase orquestadora AnalizadorAcademico
│   │   ├── services/                       # Capa de Lógica de Negocio
│   │   │   ├── academic_service.py         # Extracción con pd.read_sql e importador de CSVs
│   │   │   └── seeder.py                   # Generador de datos sintéticos con correlación realista
│   │   └── api/v1/                         # Controladores REST
│   │       ├── api.py                      # Aglutinador de rutas
│   │       └── endpoints/
│   │           ├── analytics.py            # Endpoints analíticos (KPIs, correlación, ranking, riesgo)
│   │           ├── matriculas.py           # Ingesta masiva CSV y registro de notas
│   │           ├── estudiantes.py          # CRUD de Estudiantes
│   │           └── cursos.py               # CRUD de Cursos
│   ├── data/
│   │   └── sample_actas.csv                # Dataset CSV de prueba para importación
│   ├── tests/                              # Suite de Pruebas Unitarias (Criterio 4)
│   │   ├── conftest.py                     # Fixtures para pruebas estadísticas
│   │   └── test_analytics.py               # Tests automatizados con pytest (100% pasando)
│   ├── academico.db                        # Base de datos relacional SQLite
│   ├── requirements.txt                    # Dependencias fijadas del backend
│   └── README.md                           # Documentación técnica principal
│
└── edumetrics-frontend/                 # CAPA DEL CLIENTE (Angular 21)
    ├── src/
    │   ├── app/
    │   │   ├── models/
    │   │   │   └── analytics.models.ts     # Interfaces TypeScript sincronizadas con los DTOs de FastAPI
    │   │   ├── services/
    │   │   │   └── analytics.service.ts    # Servicio HTTP reactivo (RxJS forkJoin y notificaciones)
    │   │   ├── components/                 # Componentes Standalone interactivos
    │   │   │   ├── kpi-cards/              # Tarjetas métricas (Total alumnos, promedio, tasa de aprobación)
    │   │   │   ├── correlation-chart/      # Scatter Plot Asistencia vs Nota con línea de tendencia (Chart.js)
    │   │   │   ├── course-failure-chart/   # Gráfico de barras de reprobados por asignatura (Chart.js)
    │   │   │   ├── ranking-table/          # Cuadro de honor con percentiles (Décimo, Quinto, Tercio)
    │   │   │   ├── risk-table/             # Sistema de alerta temprana por Z-Score e inasistencia
    │   │   │   └── csv-uploader/           # Subida Drag & Drop de actas CSV y botón de Demo Seed
    │   │   ├── app.ts                      # Controlador principal con navegación por pestañas y Zoneless
    │   │   ├── app.html                    # Maquetación del layout y vistas
    │   │   ├── app.css                     # Estilos de navegación, header y dashboard
    │   │   └── app.config.ts               # Proveedores de la aplicación (provideHttpClient)
    │   ├── styles.css                      # Sistema de diseño global (variables CSS, tarjetas, tablas)
    │   └── index.html                      # Punto de entrada HTML
    ├── package.json                        # Dependencias de npm (Angular 21, Chart.js)
    ├── angular.json                        # Configuración del compilador y bundles de Angular
    └── README.md                           # Guía de ejecución del frontend
```

### Descripción de Responsabilidades por Capa:

* **Backend (`edumetrics-backend`):** Centraliza la persistencia relacional en **SQLite (`academico.db`)**, valida los datos entrantes mediante **Pydantic V2** y expone una API REST asíncrona documentada en tiempo real con **Swagger UI**. Aloja el **motor analítico** que combina programación orientada a objetos (`AnalizadorAcademico`) con funciones puras y vectorización matricial (`Pandas` + `NumPy`) para calcular correlaciones de Pearson, Z-Scores de alerta temprana y promedios ponderados.
* **Frontend (`edumetrics-frontend`):** Aplicación de página única (*SPA*) desarrollada en **Angular 21** bajo arquitectura de componentes independientes (*Standalone*). Consume los endpoints del backend de manera reactiva mediante **RxJS (`forkJoin`)**, cuenta con sincronización para renderizado inmediato (*Zoneless Change Detection*) y proyecta las métricas estadísticas en paneles visuales interactivos con **Chart.js** y tablas con filtrado dinámico.

---

## 6. Puesta en Marcha (Instalación Rápida)

### Prerrequisitos
* Python 3.10 o superior instalado.
* Git.

### Paso 1: Clonar y preparar entorno
```bash
# Clonar el proyecto
git clone <URL_DEL_REPOSITORIO>
cd edumetrics-backend

# Crear entorno virtual
python -m venv venv

# Activar entorno virtual
# En Windows (PowerShell):
.\venv\Scripts\Activate.ps1
# En Linux / macOS:
source venv/bin/activate
```

### Paso 2: Instalar dependencias
```bash
pip install -r requirements.txt
```

### Paso 3: Inicializar la Base de Datos y Servidor
```bash
# Iniciar el backend con recarga automática
uvicorn app.main:app --reload --port 8000
```

> **Nota:** Al arrancar por primera vez, el sistema creará automáticamente la base de datos `academico.db`. Puedes poblarla de inmediato enviando una petición `POST` al endpoint `/api/v1/matriculas/seed` desde Swagger UI o usar el CSV de muestra.

### Paso 4: Ejecutar Pruebas Automatizadas
```bash
pytest -v
```
*(Todas las pruebas deben finalizar en estado `PASSED`).*

---

## 7. Catálogo de Endpoints de la API

| Método | Ruta | Descripción | Consumo en Frontend |
| :---: | :--- | :--- | :--- |
| `GET` | `/api/v1/analytics/kpis` | Resumen ejecutivo: Total estudiantes, cursos, promedio global, % aprobación y r de Pearson. | Tarjetas de Indicadores Clave |
| `GET` | `/api/v1/analytics/correlacion` | Coeficiente Pearson, línea de tendencia $y = mx + b$ y puntos $(x, y)$ de asistencia vs. nota. | **Scatter Plot Interactivo** |
| `GET` | `/api/v1/analytics/desaprobados-por-curso` | Tasa porcentual y total de reprobados agrupados por asignatura. | **Gráfico de Barras (Cuellos de botella)** |
| `GET` | `/api/v1/analytics/ranking` | Lista de mérito ponderada por créditos con percentiles (Tercio, Quinto y Décimo Superior). | **Tabla del Cuadro de Honor** |
| `GET` | `/api/v1/analytics/estudiantes-riesgo` | Lista de alumnos con Z-Score negativo o inasistencia crítica para intervención temprana. | **Tabla de Alertas de Riesgo** |
| `POST` | `/api/v1/matriculas/upload-csv` | Carga multipart de archivo `.csv`, validado y limpiado por Pandas antes de insertar en SQLite. | **Modal de Carga Masiva** |
| `POST` | `/api/v1/matriculas/seed` | Generación automática de datos sintéticos con correlaciones realistas. | Botón de Demo Rápida |
| `GET` | `/docs` | Documentación interactiva Swagger UI con cliente de pruebas integrado. | Explorador para evaluadores |

---

## 8. Ejemplos de Implementación de Paradigmas

### Integración Funcional + Vectorizada (`app/analytics/functional_pipeline.py`)
```python
# Función pura para correlación vectorizada con NumPy
def calculate_pearson_correlation(x: np.ndarray, y: np.ndarray) -> float:
    if len(x) < 2 or len(y) < 2:
        return 0.0
    return float(np.round(np.corrcoef(x, y)[0, 1], 4))

# Closure / Higher-Order Function para clasificación de riesgo
def make_risk_classifier(nota_min: float = 10.5, asist_min: float = 70.0):
    def classifier(nota: float, asistencia: float) -> Tuple[str, str]:
        if nota < nota_min and asistencia < asist_min:
            return ("ALTO RIESGO", "Desaprobado con inasistencia crítica")
        elif nota < nota_min:
            return ("RIESGO MEDIO", "Desaprobado en rendimiento")
        return ("REGULAR", "Satisfactorio")
    return classifier
```

### Integración POO Encapsulada (`app/analytics/engine.py`)
```python
class AnalizadorAcademico:
    """Clase orientada a objetos que encapsula el estado del DataFrame procesado."""
    def __init__(self, raw_df: pd.DataFrame):
        # Inmutabilidad: garantiza datos limpios y consistentes
        self._df = clean_academic_dataframe(raw_df)

    def obtener_desaprobados_por_curso(self) -> List[DesaprobadosPorCurso]:
        # Agrupación y transformación con Pandas
        agrupado = self._df.groupby(['curso_id', 'curso_nombre']).agg(
            total_alumnos=('nota_final', 'count'),
            total_desaprobados=('nota_final', lambda s: int(np.sum(s < 10.5)))
        ).reset_index()
        # Retorno de DTOs mediante programación funcional (map)
        return list(map(lambda r: DesaprobadosPorCurso(**r), agrupado.to_dict(orient='records')))
```

---

## Contribución y Buenas Prácticas
* **Convención de Commits:** Commits semánticos (`feat:`, `fix:`, `docs:`, `test:`, `refactor:`).
* **Guía de Estilo:** Cumplimiento de **PEP 8** y tipado estático con `mypy` / Type Annotations.
* **Separación de Responsabilidades:** Ningún controlador de FastAPI ejecuta consultas SQL directas ni lógica analítica pesada; todo se delega a la capa de servicios y motores analíticos.
