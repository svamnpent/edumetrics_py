# 📊 EduMetrics Frontend (Angular 21)

Panel de visualización interactivo y reactivo para la plataforma de **Analítica de Rendimiento Académico y Alerta Temprana Universitaria**.

Consume los endpoints del backend en **FastAPI** (`http://localhost:8000/api/v1`) y renderiza métricas procesadas con **Pandas y NumPy**.

---

## 🚀 Características Principales

1. **Dashboard Analítico:**
   * **Tarjetas de KPIs:** Indicadores en tiempo real (total de estudiantes, promedio general, % de aprobación y coeficiente de correlación $r$).
   * **Gráfico de Dispersión (Scatter Plot con Chart.js):** Relación directa entre porcentaje de asistencia y calificación final, con línea de regresión calculada por NumPy ($y = mx + b$).
   * **Gráfico de Barras:** Identificación de asignaturas cuello de botella según tasa de desaprobados.

2. **Cuadro de Honor (Ranking Estudiantil):**
   * Tabla interactiva de posiciones ponderadas por créditos.
   * Filtros dinámicos por percentiles: **🏆 Décimo Superior**, **🥈 Quinto Superior**, **🥉 Tercio Superior** y **Regular**.
   * Búsqueda instantánea por nombre, código o carrera.

3. **Sistema de Alerta Temprana:**
   * Detección de estudiantes en situación crítica mediante cálculo de **Z-Score** e inasistencia.
   * Clasificación por severidad (**Alto Riesgo** y **Riesgo Medio**) con motivos automáticos de intervención académica.

4. **Ingesta y Carga Masiva:**
   * Interfaz de arrastrar y soltar (*Drag & Drop*) para subir archivos `.csv`.
   * Botón para poblar la base de datos con datos sintéticos realistas en 1 clic (*Seed*).

---

## 🛠️ Estructura de Componentes

```text
src/app/
├── models/
│   └── analytics.models.ts            # Interfaces TypeScript sincronizadas con FastAPI
├── services/
│   └── analytics.service.ts           # Servicio HTTP reactivo (RxJS)
├── components/
│   ├── kpi-cards/                     # Tarjetas métricas ejecutivas
│   ├── correlation-chart/             # Scatter plot Asistencia vs Nota (Chart.js)
│   ├── course-failure-chart/          # Barras de reprobación por asignatura (Chart.js)
│   ├── ranking-table/                 # Cuadro de honor y percentiles
│   ├── risk-table/                    # Tabla de alerta temprana y deserción
│   └── csv-uploader/                  # Subida de actas CSV y sembrado de BD
├── app.ts                             # Componente raíz orquestador
├── app.html                           # Maquetación por pestañas
├── app.css                            # Estilos de navegación y layout
└── app.config.ts                      # Configuración global y provideHttpClient()
```

---

## 💻 Instalación y Ejecución

### Prerrequisitos
* Node.js v18 o superior instalado.
* Backend de FastAPI corriendo en `http://localhost:8000`.

### 1. Instalar dependencias
```bash
cd edumetrics-frontend
npm install
```

### 2. Iniciar el servidor de desarrollo
```bash
npm start
```
O directamente con Angular CLI:
```bash
ng serve --port 4200 --open
```

La aplicación se abrirá automáticamente en tu navegador en:
👉 **`http://localhost:4200`**

---

## 🔄 Conexión con el Backend

El frontend se conecta de manera predeterminada al backend en:
* URL base: `http://localhost:8000/api/v1`
* Cuando el backend no esté en ejecución, el frontend mostrará automáticamente un banner de alerta indicando los pasos para iniciar FastAPI.
