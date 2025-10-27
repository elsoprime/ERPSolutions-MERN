# 🚀 **GUÍA DE MIGRACIÓN: Legacy → Enhanced Enterprise**

## 📋 **Introducción**

Esta guía te ayudará a migrar tu sistema ERP desde el **modelo Company básico** al **modelo EnhancedCompany enterprise** sin pérdida de datos.

---

## 🎯 **¿Por qué migrar?**

### **📦 Sistema Legacy (Company)**

- ✅ Gestión básica de empresas
- ✅ Usuarios por empresa
- ❌ Sin límites configurables
- ❌ Sin planes de suscripción
- ❌ Sin personalización de marca
- ❌ Sin métricas en tiempo real

### **🚀 Sistema Enhanced (EnhancedCompany)**

- ✅ Gestión avanzada multi-tenant
- ✅ **Planes de suscripción** (free, basic, professional, enterprise)
- ✅ **Límites configurables** por empresa
- ✅ **Personalización de marca** (colores, logos)
- ✅ **Control de características** por plan
- ✅ **Métricas y estadísticas** en tiempo real
- ✅ **Escalabilidad enterprise**

---

## 🗺️ **PROCESO DE MIGRACIÓN**

### **Fase 1: Preparación** 📋

```bash
# 1. Hacer backup del estado actual
npm run verify-db > backup_before_migration_$(date +%Y%m%d).txt

# 2. Verificar estado actual
npm run verify-db
```

### **Fase 2: Migración de Datos** 🔄

```bash
# 3. Ejecutar migración principal
npm run migrate-to-enhanced

# 4. Actualizar referencias de usuarios
npm run update-company-refs
```

### **Fase 3: Verificación** ✅

```bash
# 5. Verificar migración exitosa
npm run verify-enhanced-db

# 6. Comparar con backup para confirmar integridad
```

---

## 📊 **MAPEO DE DATOS**

### **Empresas: Company → EnhancedCompany**

| Campo Legacy        | Campo Enhanced          | Transformación                        |
| ------------------- | ----------------------- | ------------------------------------- |
| `companyName`       | `name`                  | Directo                               |
| `rutOrDni`          | `settings.taxId`        | Directo                               |
| `email`             | `email`                 | Directo                               |
| `phoneNumber`       | `phone`                 | Directo                               |
| `address`           | `address`               | Parse string → objeto estructurado    |
| `industry`          | `settings.industry`     | Directo                               |
| `industry`          | `settings.businessType` | Mapeo automático por industria        |
| `companyName`       | `slug`                  | Generación automática URL-friendly    |
| `incorporationDate` | `createdAt`             | Conserva fecha original               |
| -                   | `plan`                  | Asignación automática: 'professional' |
| -                   | `status`                | Valor por defecto: 'active'           |

### **Configuraciones Automáticas**

```typescript
// Límites por plan asignado (professional)
limits: {
  maxUsers: 25,
  maxProducts: 5000,
  maxTransactions: 25000,
  storageGB: 10
}

// Características habilitadas
features: {
  inventory: true,
  accounting: true,
  hrm: false,
  crm: true,
  projects: false
}

// Branding por industria
branding: {
  primaryColor: industryColors[industry].primary,
  secondaryColor: industryColors[industry].secondary
}
```

---

## 🎨 **MAPEO DE INDUSTRIAS**

### **Tipos de Negocio**

| Industria Legacy        | BusinessType Enhanced |
| ----------------------- | --------------------- |
| "Tecnología y Software" | `service`             |
| "Comercio y Retail"     | `retail`              |
| "Manufactura"           | `manufacturing`       |
| "Servicios"             | `service`             |
| Cualquier otro          | `other`               |

### **Colores por Industria**

| Industria             | Color Primario | Color Secundario |
| --------------------- | -------------- | ---------------- |
| Tecnología y Software | `#3B82F6`      | `#64748B`        |
| Comercio y Retail     | `#10B981`      | `#6B7280`        |
| Manufactura           | `#F59E0B`      | `#9CA3AF`        |
| Servicios             | `#8B5CF6`      | `#6B7280`        |

---

## 🔄 **COMANDOS DE MIGRACIÓN DETALLADOS**

### **1. Migración Principal**

```bash
npm run migrate-to-enhanced
```

**Proceso interno:**

1. 🔍 Detecta empresas existentes en modelo Company
2. 🆕 Crea colección EnhancedCompany si no existe
3. 🧹 Limpia datos duplicados si existen
4. 🔄 Convierte cada empresa Company → EnhancedCompany
5. 📊 Calcula estadísticas iniciales
6. 🎨 Aplica branding por industria
7. ⚙️ Configura límites y características
8. 📝 Genera informe de migración

**Salida esperada:**

```
🔄 Iniciando migración de Company a EnhancedCompany
============================================================
📊 Encontradas 3 empresas para migrar
🔄 Migrando empresa: ERP Solutions SPA
✅ Empresa migrada: ERP Solutions SPA → erp-solutions-spa
🔄 Migrando empresa: Demo Company SPA
✅ Empresa migrada: Demo Company SPA → demo-company-spa
🔄 Migrando empresa: Test Industries LTDA
✅ Empresa migrada: Test Industries LTDA → test-industries-ltda

============================================================
🎉 Migración completada exitosamente

📊 RESUMEN DE MIGRACIÓN:
  ✅ ERP Solutions SPA
     Slug: erp-solutions-spa
     Usuarios: 1
     Plan: professional
  ✅ Demo Company SPA
     Slug: demo-company-spa
     Usuarios: 2
     Plan: professional
```

### **2. Actualización de Referencias**

```bash
npm run update-company-refs
```

**Proceso interno:**

1. 🔍 Busca usuarios con `companyId` del modelo legacy
2. 🗺️ Mapea IDs antiguos → IDs nuevos basado en `taxId`
3. 🔄 Actualiza `User.companyId` para apuntar a EnhancedCompany
4. 📊 Actualiza estadísticas de usuarios por empresa
5. ✅ Verifica integridad referencial

---

## 🔍 **VERIFICACIÓN POST-MIGRACIÓN**

### **Comando de Verificación**

```bash
npm run verify-enhanced-db
```

### **Puntos de Verificación**

#### **✅ Integridad de Datos**

- Todas las empresas migradas
- Usuarios correctamente asociados
- No hay datos huérfanos
- Referencias válidas

#### **✅ Configuraciones Correctas**

- Planes asignados adecuadamente
- Límites configurados por plan
- Características habilitadas según plan
- Branding aplicado por industria

#### **✅ Estadísticas Precisas**

- Conteo de usuarios correcto
- Métricas inicializadas
- Porcentajes de uso calculados
- Fechas de actividad actualizadas

---

## 🚨 **PROBLEMAS COMUNES Y SOLUCIONES**

### **❌ Error: Duplicate key taxId**

**Causa:** Ya existe una empresa Enhanced con el mismo RUT

**Solución:**

```bash
# Limpiar datos Enhanced anteriores
npm run init-enhanced-db:clean

# Ejecutar migración limpia
npm run migrate-to-enhanced
```

### **❌ Error: Cannot find SuperAdmin**

**Causa:** No existe usuario super_admin para asignar como creador

**Solución:**

```bash
# Crear usuario super admin si no existe
npm run init-db
npm run migrate-to-enhanced
```

### **⚠️ Warning: Usuarios sin empresa**

**Causa:** Referencias no actualizadas correctamente

**Solución:**

```bash
# Actualizar referencias manualmente
npm run update-company-refs

# Verificar resultado
npm run verify-enhanced-db
```

### **📊 Estadísticas incorrectas**

**Causa:** Conteos no sincronizados

**Solución:**

```bash
# Las estadísticas se actualizan automáticamente
# Si persiste el problema, re-ejecutar migración
npm run migrate-to-enhanced
```

---

## 🔄 **ROLLBACK (Si es necesario)**

### **Opción 1: Rollback Completo**

```bash
# 1. Eliminar datos Enhanced
db.enhancedcompanies.drop()

# 2. Restaurar referencias a Company original
# (ejecutar script de restauración manual)

# 3. Verificar estado legacy
npm run verify-db
```

### **Opción 2: Coexistencia Temporal**

Los modelos Company y EnhancedCompany pueden coexistir temporalmente:

- Legacy: `companies` collection
- Enhanced: `enhancedcompanies` collection
- Usuarios pueden apuntar a cualquiera de los dos

---

## 📊 **COMPARACIÓN PRE/POST MIGRACIÓN**

### **Antes (Legacy)**

```yaml
Companies Collection:
  - name: 'ERP Solutions SPA'
    rutOrDni: '77.123.456-7'
    industry: 'Tecnología y Software'
    # Campos básicos solamente

Users Collection:
  - companyId: ObjectId("company_legacy_id")
    # Referencias simples
```

### **Después (Enhanced)**

```yaml
EnhancedCompanies Collection:
  - name: 'ERP Solutions SPA'
    slug: 'erp-solutions-spa'
    plan: 'professional'
    settings:
      taxId: '77.123.456-7'
      industry: 'Tecnología y Software'
      businessType: 'service'
      limits:
        maxUsers: 25
        maxProducts: 5000
      features:
        inventory: true
        accounting: true
      branding:
        primaryColor: '#3B82F6'
    stats:
      totalUsers: 1
      lastActivity: '2025-10-26T...'

Users Collection:
  - companyId: ObjectId("enhanced_company_id")
    # Referencias actualizadas
```

---

## 🎯 **POST-MIGRACIÓN: PRÓXIMOS PASOS**

### **1. Actualizar Frontend**

```typescript
// Actualizar calls API para usar Enhanced endpoints
// GET /api/enhanced-companies en lugar de /api/companies

// Aprovechar nuevas características
const company = await getEnhancedCompany(id)
const canAddUser = company.canAddUser()
const usage = company.getUsagePercentage()
```

### **2. Implementar Nuevas Características**

- 🎨 **Branding dinámico** basado en configuraciones de empresa
- 📊 **Dashboard de métricas** con límites y uso
- ⚙️ **Configuración de planes** y upgrade/downgrade
- 🚨 **Alertas de límites** cuando se acerquen al máximo

### **3. Monitoreo Continuo**

```bash
# Verificación periódica del sistema
npm run verify-enhanced-db

# Análisis de uso y rendimiento
# (implementar scripts de monitoreo personalizados)
```

---

## 📚 **RECURSOS ADICIONALES**

### **Documentación Relacionada**

- `ENHANCED_COMPANY_GUIDE.md` - Guía técnica del modelo
- `ENHANCED_SCRIPTS_GUIDE.md` - Comandos y scripts
- `PROJECT_ENTERPRISE_SUMMARY.md` - Resumen ejecutivo

### **Archivos de Migración**

- `src/scripts/migrateToEnhancedCompany.ts` - Script principal
- `src/models/EnhancedCompany.ts` - Modelo destino
- `src/controllers/EnhancedCompanyController.ts` - API enhanced

---

## ✅ **CHECKLIST DE MIGRACIÓN**

### **Pre-Migración**

- [ ] Backup de datos actuales creado
- [ ] Sistema legacy verificado y funcionando
- [ ] Dependencias actualizadas
- [ ] Espacio en disco suficiente

### **Durante Migración**

- [ ] `npm run migrate-to-enhanced` ejecutado exitosamente
- [ ] `npm run update-company-refs` completado sin errores
- [ ] Logs de migración revisados
- [ ] No hay errores de duplicación

### **Post-Migración**

- [ ] `npm run verify-enhanced-db` muestra datos correctos
- [ ] Todas las empresas migradas
- [ ] Usuarios correctamente asociados
- [ ] Estadísticas precisas
- [ ] Frontend funciona con nuevos endpoints
- [ ] Performance del sistema verificada

---

**¡Migración completada exitosamente!** 🎉

Tu sistema ERP ahora cuenta con capacidades enterprise avanzadas incluyendo planes de suscripción, límites configurables, personalización de marca y métricas en tiempo real.

---

**Desarrollado por Esteban Soto Ojeda** (@elsoprimeDev)  
_Especialista en Migraciones Enterprise - ERP Solutions_
