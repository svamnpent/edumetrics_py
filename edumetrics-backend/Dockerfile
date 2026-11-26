# ==============================================================================
# Dockerfile para EduMetrics Backend (FastAPI + Pandas + SQLite)
# ==============================================================================
FROM python:3.11-slim

# Evitar escritura de archivos .pyc y activar salida sin buffer para logs limpios
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

# Instalar dependencias del sistema mínimas
RUN apt-get update && apt-get install -y --no-install-recommends \
    curl \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependencias de Python en capas separadas para aprovechar caché
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copiar el código fuente del proyecto
COPY . .

# Exponer el puerto de FastAPI
EXPOSE 8000

# Verificación de salud del contenedor
HEALTHCHECK --interval=30s --timeout=5s --start-period=10s --retries=3 \
  CMD curl -f http://localhost:8000/ || exit 1

# Comando de inicio del servidor Uvicorn en modo producción
CMD ["uvicorn", "app.main:app", "--host", "0.0.0.0", "--port", "8000"]
