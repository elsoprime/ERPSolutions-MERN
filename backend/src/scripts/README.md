# 📜 Scripts del Backend - Guía Actualizada

## 🎯 **Estructura Organizada**

Los scripts han sido reorganizados para facilitar el mantenimiento y uso:

```
scripts/
├── deprecated/          ❌ Scripts legacy (no usar)
├── migration/          🔄 Scripts de migración
├── initialization/     🚀 Scripts de inicialización
├── utilities/          🛠️ Herramientas de utilidad
└── README.md           📖 Esta guía
```

---

## 🚀 **Comandos Principales**

### **✅ Para uso diario:**

```bash
npm run dev                    # Iniciar servidor de desarrollo
npm run verify:db              # Verificar estado de la base de datos
npm run test:quick            # Test rápido del sistema
```

### **🔧 Para mantenimiento:**

```bash
npm run clean:db              # Limpiar base de datos
npm run init:enhanced         # Inicializar con datos base
npm run init:clean            # Limpiar + Inicializar
npm run fix:indexes           # Reparar índices de MongoDB
```

### **🔄 Para migración (solo una vez):**

```bash
npm run migrate:enhanced-user     # Migrar usuarios a EnhancedUser
npm run migrate:enhanced-company  # Migrar empresas
npm run migrate:verify           # Verificar migración
npm run migrate:rollback         # Rollback si es necesario
```

---

## 📋 **Flujos de Trabajo Comunes**

### **🆕 Configuración inicial (nuevo proyecto):**

```bash
npm run clean:db
npm run init:enhanced
npm run verify:db
npm run dev
```

### **🔄 Reset completo (desarrollo):**

```bash
npm run init:clean
npm run verify:db
```

### **📊 Verificación de estado:**

```bash
npm run verify:db
npm run verify:enhanced
```

### **🚨 En caso de problemas:**

```bash
npm run fix:indexes      # Si hay problemas de DB
npm run test:quick       # Verificar autenticación
npm run clean:db         # En último caso
```

---

## 🎭 **Scripts por Categoría**

### **🛠️ Utilities (Herramientas)**

| Comando           | Descripción               | Frecuencia                |
| ----------------- | ------------------------- | ------------------------- |
| `verify:db`       | Verificar base de datos   | Diario                    |
| `verify:enhanced` | Verificar modelo enhanced | Semanal                   |
| `clean:db`        | Limpiar base de datos     | Solo cuando sea necesario |
| `fix:indexes`     | Reparar índices           | Mensual                   |
| `test:quick`      | Test rápido de sistema    | Diario                    |

### **🚀 Initialization (Inicialización)**

| Comando         | Descripción            | Uso                  |
| --------------- | ---------------------- | -------------------- |
| `init:enhanced` | Inicializar datos base | Setup inicial        |
| `init:settings` | Solo configuraciones   | Después de migración |
| `init:run`      | Ejecutor principal     | Automatización       |
| `init:clean`    | Limpiar + Inicializar  | Reset completo       |

### **🔄 Migration (Migración)**

| Comando                    | Descripción         | Uso               |
| -------------------------- | ------------------- | ----------------- |
| `migrate:enhanced-user`    | Migrar usuarios     | Solo una vez      |
| `migrate:enhanced-company` | Migrar empresas     | Solo una vez      |
| `migrate:users-legacy`     | Migrar roles legacy | Condicional       |
| `migrate:verify`           | Verificar migración | Después de migrar |
| `migrate:rollback`         | Deshacer migración  | En caso de error  |

---

## ⚠️ **Precauciones Importantes**

### **🚨 Scripts Peligrosos:**

- `clean:db` - **ELIMINA TODOS LOS DATOS**
- `migrate:rollback` - Puede causar pérdida de datos
- `init:clean` - Combinación de limpieza + inicialización

### **✅ Scripts Seguros:**

- `verify:db` - Solo lectura
- `verify:enhanced` - Solo lectura
- `test:quick` - Solo testing
- `fix:indexes` - Solo reparación

### **🔒 Scripts de Una Sola Vez:**

- `migrate:enhanced-user` - Solo ejecutar una vez
- `migrate:enhanced-company` - Solo ejecutar una vez

---

## 📊 **Datos que se Crean (init:enhanced)**

### **🏢 Empresas:**

1. **ERP Solutions SPA** (77.123.456-7) - Plan Enterprise
2. **Demo Company SPA** (76.987.654-3) - Plan Professional
3. **Test Industries LTDA** (75.555.444-9) - Plan Basic

### **👥 Usuarios:**

1. `superadmin@erpsolutions.cl` - Super Admin (global)
2. `admin@erpsolutions.cl` - Admin Empresa
3. `manager@democompany.cl` - Manager
4. `empleado@testindustries.cl` - Employee
5. `viewer@democompany.cl` - Viewer

**🔑 Contraseña por defecto:** `Admin123!`

---

## 🎯 **Para Desarrolladores Nuevos**

### **🚀 Setup rápido:**

```bash
git clone <repo>
cd backend
npm install
npm run init:clean
npm run dev
```

### **📝 Testing de login:**

```bash
# En otra terminal
npm run test:quick
# O usar Postman con superadmin@erpsolutions.cl / Admin123!
```

### **🔍 Verificar que todo funciona:**

```bash
npm run verify:db
```

---

## 📞 **Soporte**

Si tienes problemas:

1. **Verificar logs:** Revisar salida de comandos
2. **Estado de DB:** `npm run verify:db`
3. **Reset completo:** `npm run init:clean`
4. **Consultar docs:** Revisar READMEs en cada carpeta

---

_📅 Actualizado: 29 de octubre de 2025_
_🔄 Versión: EnhancedUser v2.0_
