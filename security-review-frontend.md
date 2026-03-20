# Security Review - Alertas Payroll Frontend

**Fecha:** 2026-03-20
**Revisor:** Security Reviewer (automated)
**Alcance:** `frontend/` (React + Vite + TypeScript)
**Severidad:** CRITICA / ALTA / MEDIA / BAJA / OK

---

## 1. Credenciales, tokens, API keys o secrets hardcodeados

**Severidad: OK**

Se realizo una busqueda exhaustiva en todos los archivos fuente (`src/**`) buscando patrones de: `password`, `secret`, `token`, `api_key`, `api-key`, `Bearer`, `authorization`.

**Resultado:** No se encontraron credenciales, tokens ni API keys hardcodeados en el codigo fuente.

Los datos mock en `src/services/api.ts` contienen emails ficticios (`@empresa.com`) que no representan un riesgo de seguridad.

---

## 2. Llamadas al API - URLs hardcodeadas

**Severidad: MEDIA**

En `src/services/api.ts` linea 3:

```typescript
const API_BASE = 'http://localhost:8080/api';
```

**Hallazgos:**
- La URL esta hardcodeada con `http://localhost:8080`
- Actualmente NO se usa en produccion (las llamadas fetch estan comentadas, se usan mock data)
- No contiene credenciales en la URL
- El `nginx.conf` ya configura un proxy inverso en `/api/` hacia `http://backend:8080/api/`

**Recomendacion:** Cuando se conecte al backend real, reemplazar con:

```typescript
const API_BASE = import.meta.env.VITE_API_BASE || '/api';
```

Esto usara la ruta relativa `/api` por defecto (que nginx proxeara al backend), y permitira override via variable de entorno para desarrollo local.

---

## 3. Vulnerabilidades XSS

**Severidad: OK**

Se busco en todo el codigo fuente:
- `dangerouslySetInnerHTML` - **No encontrado**
- `innerHTML` / `outerHTML` - **No encontrado**
- `document.write` - **No encontrado**
- `insertAdjacentHTML` - **No encontrado**
- `eval()` / `new Function()` - **No encontrado**

Todos los componentes usan JSX estandar de React, que escapa automaticamente el contenido renderizado. No hay vectores XSS detectados.

---

## 4. Sanitizacion de datos de usuario

**Severidad: OK**

Analisis de componentes que renderizan datos:

| Componente | Metodo de renderizado | Seguro |
|---|---|---|
| `DataTable.tsx` | `String(value)` dentro de JSX `{...}` | Si - React escapa automaticamente |
| `Card.tsx` | `{value}` en JSX | Si |
| `StatusBadge.tsx` | `{status}` en JSX | Si |
| `PageHeader.tsx` | `{title}` en JSX | Si |
| `Dashboard.tsx` | Render via componentes tipados | Si |
| `Usuarios.tsx` | Render via DataTable | Si |

React escapa todo el contenido renderizado via JSX por defecto. No hay uso de APIs DOM directas ni de `dangerouslySetInnerHTML`. Los datos estan correctamente tipados con TypeScript.

---

## 5. Dependencias con vulnerabilidades conocidas (npm audit)

**Severidad: MEDIA**

```
npm audit report:

esbuild  <=0.24.2
  Severity: moderate
  esbuild enables any website to send any requests to the development
  server and read the response
  https://github.com/advisories/GHSA-67mh-4wv8-2f99

  vite  0.11.0 - 6.1.6
  Depends on vulnerable versions of esbuild

2 moderate severity vulnerabilities
```

**Hallazgos:**
- 2 vulnerabilidades de severidad **moderada**
- Afectan a `esbuild` y `vite` (herramientas de desarrollo/build)
- La vulnerabilidad permite que sitios web envien requests al servidor de desarrollo de esbuild
- **No afecta a produccion** - esbuild/vite solo se usan en desarrollo y build, no se incluyen en el bundle final
- Fix disponible: `npm audit fix --force` (actualiza a vite@6.x, breaking change)

**Recomendacion:** Actualizar `vite` a la version `^6.4.1` cuando sea conveniente. Aunque el riesgo en produccion es nulo, es buena practica mantener las dependencias actualizadas. Planificar la migracion ya que es un breaking change (vite 5 -> 6).

---

## 6. nginx.conf - Headers de seguridad

**Severidad: ALTA**

Configuracion actual (`nginx.conf`):

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }
}
```

**Headers de seguridad FALTANTES:**

| Header | Estado | Riesgo |
|---|---|---|
| `X-Frame-Options` | FALTANTE | Clickjacking |
| `X-Content-Type-Options` | FALTANTE | MIME sniffing |
| `Content-Security-Policy` | FALTANTE | XSS, inyeccion de recursos |
| `X-XSS-Protection` | FALTANTE | XSS (legacy browsers) |
| `Referrer-Policy` | FALTANTE | Filtrado de informacion |
| `Permissions-Policy` | FALTANTE | Acceso a APIs del navegador |
| `Strict-Transport-Security` | FALTANTE | Downgrade a HTTP |
| `X-Forwarded-For` (proxy) | FALTANTE | IP real del cliente |
| `X-Forwarded-Proto` (proxy) | FALTANTE | Deteccion de protocolo |

**Recomendacion - nginx.conf con headers de seguridad:**

```nginx
server {
    listen 80;
    server_name localhost;
    root /usr/share/nginx/html;
    index index.html;

    # Security headers
    add_header X-Frame-Options "DENY" always;
    add_header X-Content-Type-Options "nosniff" always;
    add_header X-XSS-Protection "1; mode=block" always;
    add_header Referrer-Policy "strict-origin-when-cross-origin" always;
    add_header Permissions-Policy "camera=(), microphone=(), geolocation=()" always;
    add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data:; connect-src 'self';" always;

    # Si se usa HTTPS (detras de un load balancer/reverse proxy):
    # add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;

    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://backend:8080/api/;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

---

## 7. Archivos sensibles en dist/

**Severidad: OK**

Contenido del directorio `dist/`:

```
dist/
  index.html
  vite.svg
  assets/
    index-RT_0_Dlg.css
    index-D7mFbPki.js
```

**Verificaciones realizadas:**
- No hay archivos `.env`, `.env.local`, o de configuracion sensible
- No hay source maps (`.map`) expuestos - correcto para produccion
- No hay archivos de credenciales
- Se busco `localhost` en el bundle JS compilado - **No encontrado** (la URL hardcodeada de api.ts no llega al bundle porque las llamadas fetch estan comentadas)
- Las coincidencias de `token`/`password` en el bundle son del codigo React interno (no datos sensibles)

**Nota:** El Dockerfile NO copia `dist/` al contenedor (solo copia `nginx.conf`). Los archivos estaticos deben copiarse en un step de build. Verificar que el pipeline de CI/CD copie correctamente los assets.

---

## 8. .gitignore del frontend

**Severidad: MEDIA**

Contenido actual:

```
node_modules     ✅
dist             ✅
dist-ssr         ✅
*.local          ✅
```

**Faltantes:**

| Patron | Razon |
|---|---|
| `.env` | Variables de entorno con posibles secrets |
| `.env.*` | Variantes (.env.local, .env.production) |
| `!.env.example` | Permitir el ejemplo sin secrets |
| `.env*.local` | Archivos locales de Vite |

**Nota:** El patron `*.local` ya cubre `.env.local` y `.env.production.local`, pero no cubre `.env` ni `.env.production` directamente. Se recomienda ser explicito.

**Recomendacion - agregar al .gitignore:**

```
# Environment variables
.env
.env.*
!.env.example
```

---

## Hallazgos adicionales

### 9. Dockerfile incompleto

**Severidad: MEDIA**

El `Dockerfile` actual:

```dockerfile
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

Solo copia la configuracion de nginx pero **no copia los archivos del build** (`dist/`). Deberia ser un multi-stage build:

```dockerfile
# Stage 1: Build
FROM node:20-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY . .
RUN npm run build

# Stage 2: Serve
FROM nginx:alpine
COPY nginx.conf /etc/nginx/conf.d/default.conf
COPY --from=build /app/dist /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

### 10. Swagger/API expuesto sin autenticacion

**Severidad: BAJA**

El proxy `/api/` en nginx no tiene rate limiting ni autenticacion. Cuando se conecte al backend real, considerar:
- Rate limiting con `limit_req_zone`
- Autenticacion JWT u OAuth2
- CORS headers apropiados

### 11. HTTP en lugar de HTTPS

**Severidad: BAJA (contexto de desarrollo)**

Nginx escucha en puerto 80 (HTTP). En produccion, asegurar que el trafico este cifrado, ya sea con:
- TLS terminado en un load balancer (Azure Application Gateway, ALB, etc.)
- O certificado TLS directo en nginx

---

## Resumen de acciones requeridas

| Prioridad | Hallazgo | Accion |
|-----------|----------|--------|
| ALTA | nginx.conf sin headers de seguridad | Agregar X-Frame-Options, X-Content-Type-Options, CSP, etc. |
| MEDIA | URL hardcodeada `http://localhost:8080` en api.ts | Cambiar a ruta relativa `/api` o usar `import.meta.env.VITE_API_BASE` |
| MEDIA | .gitignore no excluye `.env` explicitamente | Agregar `.env` y `.env.*` al .gitignore |
| MEDIA | 2 vulnerabilidades moderadas en npm audit | Planificar actualizacion de vite a v6.x |
| MEDIA | Dockerfile no incluye build de la aplicacion | Convertir a multi-stage build |
| BAJA | Proxy /api/ sin rate limiting | Configurar `limit_req_zone` en nginx |
| BAJA | Nginx en HTTP (puerto 80) | Asegurar TLS en produccion via LB o certificado |
| OK | Sin credenciales hardcodeadas | - |
| OK | Sin XSS (no usa dangerouslySetInnerHTML) | - |
| OK | Datos sanitizados via JSX de React | - |
| OK | Sin archivos sensibles en dist/ | - |

---

*Reporte generado automaticamente como parte de la revision de seguridad del equipo Alertas Payroll.*
