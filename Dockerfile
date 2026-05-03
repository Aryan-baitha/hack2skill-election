# ============================================================
# Matdaan Mitra - Production Dockerfile
# Multi-stage build: Serve static PWA via hardened nginx:alpine
# ============================================================
# Stage 1: Build / collect static assets
FROM nginx:1.27-alpine AS builder

# Set non-root working directory for the app shell
WORKDIR /app

# Copy only required static assets (not test/dev files)
COPY index.html ./
COPY app.js ./
COPY style.css ./
COPY manifest.json ./
COPY sw.js ./

# ============================================================
# Stage 2: Secure production server
# ============================================================
FROM nginx:1.27-alpine

# Security: run nginx as a non-root user
RUN addgroup -S matdaan && adduser -S matdaan -G matdaan

# Copy hardened nginx config and static files
COPY --from=builder /app /usr/share/nginx/html

# Apply Cloud Run port mapping (listens on 8080, not 80)
RUN sed -i 's/listen\s*80;/listen 8080;/g' /etc/nginx/conf.d/default.conf && \
    sed -i 's/listen\s*\[::\]:80;/listen [::]:8080;/g' /etc/nginx/conf.d/default.conf

EXPOSE 8080

# Health check so orchestrators can detect unhealthy containers
HEALTHCHECK --interval=30s --timeout=5s --start-period=5s --retries=3 \
    CMD wget --no-verbose --tries=1 --spider http://localhost:8080/ || exit 1

CMD ["nginx", "-g", "daemon off;"]
