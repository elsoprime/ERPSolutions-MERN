# Guía Rápida - EnhancedUser API

## 🚀 Uso Básico

### Autenticación

```typescript
// Login
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "password123"
}

// Respuesta
{
  "token": "jwt_token_here",
  "user": {
    "id": "user_id",
    "role": "admin_empresa",
    "roleType": "company",
    "companyId": "company_id",
    "hasGlobalRole": false
  }
}
```

### Middleware de Autenticación

```typescript
import {authMiddleware} from '@/modules/userManagement/middleware/authMiddleware'

// Usar en rutas
router.get('/protected', authMiddleware.authenticate, controller)

// Acceder al usuario autenticado
req.authUser // AuthenticatedUser interface
```

### Verificación de Roles

```typescript
// En controladores
const user = req.authUser

// Verificar rol específico
if (user.role === 'super_admin') {
  // Lógica para super admin
}

// Verificar tipo de rol
if (user.roleType === 'global') {
  // Lógica para roles globales
}

// Verificar si tiene rol global
if (user.hasGlobalRole) {
  // Acceso a todas las empresas
}
```

## 🏢 Multi-Empresa

### Middleware de Empresa

```typescript
import MultiCompanyMiddleware from '@/modules/companiesManagement/middleware/multiCompanyMiddleware'

// Establecer contexto de empresa
router.use(MultiCompanyMiddleware.setCompanyContext())

// Verificar permisos de empresa
router.get(
  '/company-data',
  authMiddleware.authenticate,
  MultiCompanyMiddleware.requireCompanyPermission('users.view'),
  controller
)
```

### Gestión de Usuarios por Empresa

```typescript
import MultiCompanyUserController from '@/modules/userManagement/controllers/MultiCompanyUserController'

// Obtener usuarios de la empresa actual
GET /api/users/company

// Crear usuario en empresa
POST /api/users/company
{
  "name": "Usuario Nuevo",
  "email": "nuevo@empresa.com",
  "role": "employee"
}
```

## 🔐 Roles y Permisos

### Jerarquía de Roles

```
super_admin (global)      → Acceso total al sistema
├── admin_empresa (company) → Gestión completa de su empresa
    ├── manager (company)     → Gestión de equipos y proyectos
        ├── employee (company)  → Acceso a funciones básicas
            └── viewer (company)  → Solo lectura
```

### Verificación de Permisos

```typescript
// Verificar permisos globales
MultiCompanyMiddleware.requireGlobalPermission('companies.list_all')

// Verificar permisos de empresa
MultiCompanyMiddleware.requireCompanyPermission('users.create')

// Permisos disponibles
const globalPermissions = [
  'companies.list_all',
  'companies.create',
  'companies.delete',
  'system.admin'
]

const companyPermissions = [
  'users.view',
  'users.create',
  'users.edit',
  'users.delete',
  'projects.manage',
  'reports.view'
]
```

## 🛠️ Modelo EnhancedUser

### Métodos Útiles

```typescript
import EnhancedUser from '@/modules/userManagement/models/EnhancedUser'

// Buscar usuario
const user = await EnhancedUser.findOne({email})

// Verificar rol
const hasRole = user.hasRole('admin_empresa', companyId)

// Verificar rol global
const hasGlobalRole = user.hasGlobalRole()

// Obtener acceso a empresa
const companyAccess = user.hasCompanyAccess(companyId)

// Obtener rol en empresa específica
const companyRole = user.getCompanyRole(companyId)
```

### Crear Usuario

```typescript
const newUser = new EnhancedUser({
  name: 'Nuevo Usuario',
  email: 'usuario@example.com',
  password: await bcrypt.hash('password123', 12),
  roles: [
    {
      role: 'employee',
      roleType: 'company',
      companyId: companyId,
      assignedAt: new Date(),
      assignedBy: currentUser._id,
      isActive: true
    }
  ],
  primaryCompanyId: companyId,
  status: 'active',
  confirmed: true
})

await newUser.save()
```

## 📊 Scripts de Utilidad

### Verificar Base de Datos

```bash
npm run verify-db
```

### Limpiar Base de Datos

```bash
npm run clean-db
```

### Migrar Datos Legacy

```bash
npm run migrate-users
```

### Inicializar Datos

```bash
npm run init-enhanced
```

## 🔄 Migración de Código Legacy

### Antes (User.ts legacy)

```typescript
import User from '@/modules/userManagement/models/User'

const user = await User.findById(userId)
if (user.role === 'admin') {
  // lógica admin
}
```

### Después (EnhancedUser.ts)

```typescript
import EnhancedUser from '@/modules/userManagement/models/EnhancedUser'

const user = await EnhancedUser.findById(userId)
if (user.hasRole('admin_empresa')) {
  // lógica admin empresa
}
```

## 🚨 Importantes a Recordar

1. **Usar `req.authUser`** en lugar de `req.user`
2. **Roles son arrays** en EnhancedUser
3. **Verificar empresa** antes de operaciones sensibles
4. **No importar User.ts legacy** en código nuevo
5. **Usar middleware apropiado** para cada tipo de operación

## 📞 Soporte

Si encuentras problemas:

1. Revisa los logs del servidor
2. Verifica que el usuario tenga los permisos correctos
3. Comprueba que el contexto de empresa esté establecido
4. Consulta la documentación completa en `MIGRACION_ENHANCED_USER.md`

---

_Actualizado: 29 de octubre de 2025_
_Autor: Esteban Soto Ojeda @elsoprimeDev_  
_Proyecto: ERPSolutions-MERN_
