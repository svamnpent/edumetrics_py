# ==============================================================================
# Dockerfile Multi-Stage para EduMetrics Frontend (Angular 21 + Nginx)
# ==============================================================================

# ------------------------------------------------------------------------------
# Etapa 1: Compilación de la Aplicación Angular
# ------------------------------------------------------------------------------
FROM node:20-alpine AS builder

WORKDIR /app

# Copiar manifiestos de dependencias
COPY package*.json ./

# Instalar dependencias limpias de producción/construcción
RUN npm ci

# Copiar el código fuente completo del frontend
COPY . .

# Compilar la aplicación para producción (genera dist/edumetrics-frontend/browser)
RUN npm run build -- --configuration production

# ------------------------------------------------------------------------------
# Etapa 2: Servidor Web Ligero con Nginx
# ------------------------------------------------------------------------------
FROM nginx:alpine

# Reemplazar la configuración por defecto de Nginx con soporte SPA y Proxy
COPY nginx.conf /etc/nginx/conf.d/default.conf

# Copiar los archivos estáticos generados en la etapa de compilación
COPY --from=builder /app/dist/edumetrics-frontend/browser /usr/share/nginx/html

# Exponer el puerto estándar HTTP
EXPOSE 80

# Verificación de salud del servidor Nginx
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
  CMD wget --quiet --tries=1 --spider http://localhost/ || exit 1

# Iniciar Nginx en primer plano
CMD ["nginx", "-g", "daemon off;"]
