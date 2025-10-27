# 🔄 Sistema de Token Refresh Automático

## Descripción

Sistema completo de renovación automática de tokens JWT que funciona en background para mantener las sesiones de usuario activas sin interrupciones.

## Componentes del Sistema

### 🔧 Backend

#### 1. AuthControllers.refreshToken

- **Endpoint:** `POST /auth/refresh-token`
- **Middleware:** `authMiddleware.authenticate` (requiere token válido)
- **Función:** Genera un nuevo token con datos actualizados del usuario
- **Respuesta:** Nuevo token + datos del usuario actualizados

#### 2. Ruta de refresh

```typescript
router.post(
  '/refresh-token',
  authMiddleware.authenticate,
  AuthControllers.refreshToken
)
```

### 🎨 Frontend

#### 1. TokenRefreshManager (`utils/tokenRefreshManager.ts`)

**Clase Singleton que maneja:**

- ✅ Verificación automática cada 60 segundos
- ✅ Renovación cuando faltan 5 minutos para expirar
- ✅ Máximo 3 reintentos con delay de 5 segundos
- ✅ Logout automático si falla la renovación
- ✅ Callbacks para notificar estado

**Configuración:**

```typescript
const REFRESH_CONFIG = {
  REFRESH_THRESHOLD_SECONDS: 300, // 5 minutos
  CHECK_INTERVAL_MS: 60000, // 60 segundos
  MAX_RETRY_ATTEMPTS: 3, // 3 reintentos
  RETRY_DELAY_MS: 5000 // 5 segundos entre reintentos
}
```

#### 2. useTokenRefresh (`hooks/useTokenRefresh.ts`)

**Hook React que proporciona:**

- 🔍 Estado del token en tiempo real
- 🔄 Función de refresh manual
- ⏰ Tiempo restante formateado
- 🎨 Color del estado según urgencia
- 📱 Callbacks para eventos

#### 3. TokenRefreshProvider (`components/Auth/TokenRefreshProvider.tsx`)

**Componente que proporciona:**

- 🔔 Notificaciones automáticas (toast)
- 🛠️ Panel de debug en desarrollo
- ⚠️ Alertas de sesión próxima a expirar
- 🔄 Indicador visual de renovación activa

#### 4. AuthAPI.refreshAuthToken (`api/AuthAPI.ts`)

**Función que maneja:**

- 📡 Llamada al endpoint de refresh
- 💾 Actualización de localStorage y cookies
- 🚫 Limpieza en caso de fallo
- ⚠️ Manejo de errores específicos

## Flujo de Funcionamiento

### 🔄 Renovación Automática

1. **Timer verifica cada 60 segundos** el estado del token
2. **Si faltan ≤ 5 minutos** para expirar → inicia renovación
3. **Llama al endpoint** `/auth/refresh-token` con token actual
4. **Backend valida** el token y genera uno nuevo
5. **Frontend actualiza** localStorage y cookies
6. **Notifica éxito** con toast discreto

### ⚠️ Manejo de Errores

1. **Primer fallo** → Reintenta automáticamente (máx. 3 veces)
2. **Fallo persistente** → Logout automático
3. **Token expirado** → Redirección al login
4. **Error de red** → Reintento con delay

### 🎛️ Controles de Debug (Solo Desarrollo)

#### Atajos de Teclado:

- **Ctrl + Shift + T** → Mostrar/ocultar panel de debug
- **Ctrl + Shift + R** → Forzar refresh manual

#### Panel de Debug muestra:

- ✅ Estado actual del token
- ⏰ Tiempo restante hasta expiración
- 🔄 Si necesita renovación
- 🔄 Si está renovando actualmente
- 🔘 Botón de refresh manual

## Integración

### En Layout Principal:

```tsx
<AuthGuard requireAuth={true}>
  <TokenRefreshProvider>{/* Tu aplicación aquí */}</TokenRefreshProvider>
</AuthGuard>
```

### En Componentes:

```tsx
const {tokenStatus, refreshToken, isTokenValid} = useTokenRefresh({
  onRefreshSuccess: () => console.log('Token renovado'),
  onSessionExpired: () => router.push('/auth')
})
```

## Configuración de Producción

### Variables de Entorno:

```env
# Backend
JWT_SECRET=tu_secret_key_aqui

# Frontend (opcional - para personalizar)
NEXT_PUBLIC_TOKEN_REFRESH_THRESHOLD=300
NEXT_PUBLIC_TOKEN_CHECK_INTERVAL=60000
```

### Seguridad:

- ✅ Token almacenado en localStorage + cookies httpOnly
- ✅ Validación de expiración en cliente y servidor
- ✅ Limpieza automática en caso de fallo
- ✅ No exposición de secrets en frontend

## Beneficios

### 👤 Para el Usuario:

- 🔄 Sesión continua sin interrupciones
- 🚫 No necesita hacer login repetidamente
- ⚡ Experiencia fluida y transparente

### 👨‍💻 Para el Desarrollador:

- 🛠️ Sistema automático y robusto
- 🔍 Debug fácil en desarrollo
- 📱 Notificaciones claras de estado
- ⚙️ Configurable y extensible

### 🏢 Para la Aplicación:

- 🔒 Seguridad mejorada con tokens actualizados
- 📊 Menor carga en el servidor de auth
- 🚀 Mejor performance general
- 📈 Métricas claras de uso

## Monitoring

### Logs del Sistema:

```
🔄 Token Refresh Manager iniciado
⏰ Tiempo hasta expiración: 250 segundos
🔄 Iniciando renovación de token...
✅ Token renovado exitosamente
❌ Error al renovar token: Network error
🔄 Reintentando renovación (1/3)
```

### Métricas Recomendadas:

- ⏱️ Tiempo promedio de renovación
- 📊 Tasa de éxito/fallo
- 🔢 Número de reintentos
- 👤 Sesiones activas vs expiradas
