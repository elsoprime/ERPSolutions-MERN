# Health Check System

## 📊 Sistema de Monitoreo de Salud

Sistema completo de verificación de estado de servicios críticos del backend.

---

## 🏗️ Estructura de Archivos

```
backend/src/
├── types/
│   └── healthCheck.ts                 # Tipos TypeScript
│
├── utils/healthChecks/
│   ├── index.ts                       # Exportador
│   ├── databaseHealth.ts              # Verificador MongoDB
│   ├── apiHealth.ts                   # Verificador API Server
│   ├── storageHealth.ts               # Verificador Cloudinary
│   └── emailHealth.ts                 # Verificador Resend
│
├── services/
│   └── healthCheckService.ts          # Servicio principal
│
├── controllers/
│   └── HealthCheckController.ts       # Controlador HTTP
│
└── routes/
    └── healthRoutes.ts                # Definición de rutas
```

---

## 🚀 Endpoints Disponibles

### Público (Sin autenticación)

#### `GET /api/health`
Estado general de todos los servicios

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "timestamp": "2025-11-07T...",
    "services": {
      "database": { "status": "healthy", "message": "...", ... },
      "api": { "status": "healthy", "message": "...", ... },
      "storage": { "status": "healthy", "message": "...", ... },
      "email": { "status": "degraded", "message": "...", ... }
    },
    "overall": {
      "healthy": 3,
      "degraded": 1,
      "unhealthy": 0
    }
  }
}
```

---

### Protegidos (Requieren autenticación de Admin)

#### `GET /api/health/database`
Estado de MongoDB con detalles

**Headers:**
```
Authorization: Bearer <token>
```

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Base de datos operativa",
    "timestamp": "2025-11-07T...",
    "responseTime": 45,
    "details": {
      "connected": true,
      "responseTime": 45,
      "connections": {
        "current": 1,
        "available": 100
      },
      "collections": 12
    }
  }
}
```

#### `GET /api/health/api`
Estado del servidor API

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "API servidor operativo",
    "timestamp": "2025-11-07T...",
    "responseTime": 2,
    "details": {
      "uptime": 3600,
      "memory": {
        "used": 128,
        "total": 2048,
        "percentage": 6.25
      },
      "cpu": {
        "usage": 15.5
      }
    }
  }
}
```

#### `GET /api/health/storage`
Estado de Cloudinary

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "healthy",
    "message": "Servicio de almacenamiento operativo",
    "timestamp": "2025-11-07T...",
    "responseTime": 120,
    "details": {
      "connected": true,
      "responseTime": 120,
      "provider": "cloudinary"
    }
  }
}
```

#### `GET /api/health/email`
Estado de Resend

**Response:**
```json
{
  "success": true,
  "data": {
    "status": "degraded",
    "message": "Servicio de email en modo de prueba",
    "timestamp": "2025-11-07T...",
    "responseTime": 5,
    "details": {
      "connected": true,
      "provider": "resend"
    }
  }
}
```

---

## 📈 Estados Posibles

### `healthy` (200)
✅ Servicio operativo y con buen rendimiento

### `degraded` (200)
⚠️ Servicio operativo pero con problemas menores:
- Alta latencia
- Alto uso de recursos
- Modo de prueba

### `unhealthy` (503)
❌ Servicio no disponible o con errores críticos

---

## ⚙️ Características

### 🔄 Caché Inteligente
- **Duración:** 30 segundos
- **Beneficio:** Evita verificaciones muy frecuentes
- **Actualización:** Automática después de expirar

### 🔒 Seguridad
- Endpoint público (`/api/health`) para monitoreo externo
- Endpoints detallados requieren autenticación de administrador
- Rate limiting aplicado (heredado de middleware global)

### ⚡ Performance
- Verificaciones en paralelo con `Promise.all()`
- Respuestas rápidas gracias al caché
- TypeScript strict mode (sin `any`)

---

## 🧪 Uso en Desarrollo

### Verificar estado general
```bash
curl http://localhost:4000/api/health
```

### Verificar servicio específico (con auth)
```bash
curl -H "Authorization: Bearer <token>" \
  http://localhost:4000/api/health/database
```

---

## 🎯 Próximas Mejoras Opcionales

- [ ] Historial de incidents
- [ ] Alertas por email cuando un servicio falla
- [ ] Métricas de tiempo de respuesta promedio
- [ ] Dashboard de monitoreo en tiempo real
- [ ] Integración con servicios externos de monitoreo

---

## 👨‍💻 Autor

**Esteban Soto Ojeda** (@elsoprimeDev)

---

## 📝 Notas

- Los health checks NO alteran ninguna funcionalidad existente
- Se ejecutan de forma independiente
- Compatible con todos los módulos actuales
- Sigue las convenciones de código del proyecto
