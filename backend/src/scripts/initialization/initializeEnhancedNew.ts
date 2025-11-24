/**
 * Enhanced Database Initialization Script
 * @description: Script para inicializar la base de datos con el nuevo modelo EnhancedUser
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 3.0.0 Enhanced User Migration
 */

import { config } from "dotenv";
import bcrypt from "bcrypt";
import colors from "colors";
import mongoose from "mongoose";
import { connectDB } from "@/config/database";
import EnhancedCompany from "@/modules/companiesManagement/models/EnhancedCompany";
import EnhancedUser, {
  IUserRole,
  GlobalRole,
  CompanyRole,
} from "@/modules/userManagement/models/EnhancedUser";
import {
  CompanyStatus,
  BusinessType,
  Currency,
  type ICreateCompanyRequest,
  DEFAULT_COMPANY_SETTINGS,
} from "@/modules/companiesManagement/types/EnhandedCompanyTypes";
import {
  mapPlanFeaturesToCompanyFeatures,
  mapPlanLimitsToCompanyLimits,
} from "@/modules/companiesManagement/utils/planMapper";
import { seedPlans, getPlanByType } from "./seedPlans";
import { PlanType } from "@/interfaces/IPlan";

// Cargar variables de entorno
config();

// ====== CONFIGURACIÓN Y CONSTANTES ======
const SALT_ROUNDS = 12;

// Datos de empresas
const COMPANIES_DATA = [
  {
    companyName: "ERP Solutions SPA",
    rutOrDni: "77.123.456-7",
    industry: "Technology",
    email: "admin@erpsolutions.cl",
    planType: PlanType.ENTERPRISE,
    businessType: BusinessType.TECHNOLOGY,
  },
  {
    companyName: "Demo Company SPA",
    rutOrDni: "76.987.654-3",
    industry: "Comercio y Retail",
    email: "demo@democompany.cl",
    planType: PlanType.PROFESSIONAL,
    businessType: BusinessType.RETAIL,
  },
  {
    companyName: "Test Industries LTDA",
    rutOrDni: "75.555.444-9",
    industry: "Manufactura",
    email: "admin@testindustries.cl",
    planType: PlanType.BASIC,
    businessType: BusinessType.MANUFACTURING,
  },
] as const;

// Datos de usuarios con roles mejorados
const USERS_DATA = [
  {
    name: "Super Administrador",
    email: "superadmin@erpsolutions.cl",
    password: process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin2024!",
    roleType: "global" as const,
    role: "super_admin" as GlobalRole,
    companyRut: null, // Global role sin empresa específica
  },
  {
    name: "Admin ERP Solutions",
    email: "admin@erpsolutions.cl",
    password: process.env.ADMIN_PASSWORD || "AdminERP2024!",
    roleType: "company" as const,
    role: "admin_empresa" as CompanyRole,
    companyRut: "77.123.456-7",
  },
  {
    name: "Manager Demo",
    email: "manager@democompany.cl",
    password: process.env.MANAGER_PASSWORD || "Manager2024!",
    roleType: "company" as const,
    role: "manager" as CompanyRole,
    companyRut: "76.987.654-3",
  },
  {
    name: "Empleado Test",
    email: "empleado@testindustries.cl",
    password: process.env.EMPLOYEE_PASSWORD || "Employee2024!",
    roleType: "company" as const,
    role: "employee" as CompanyRole,
    companyRut: "75.555.444-9",
  },
  {
    name: "Viewer Demo",
    email: "viewer@democompany.cl",
    password: process.env.VIEWER_PASSWORD || "Viewer2024!",
    roleType: "company" as const,
    role: "viewer" as CompanyRole,
    companyRut: "76.987.654-3",
  },
] as const;

// ====== UTILIDADES DE LOGGING ======
const logInfo = (message: string) => console.log(colors.green(`✅ ${message}`));
const logWarning = (message: string) =>
  console.log(colors.yellow(`⚠️  ${message}`));
const logError = (message: string) => console.log(colors.red(`❌ ${message}`));
const logProcess = (message: string) =>
  console.log(colors.cyan(`ℹ️  ${message}`));

// ====== FUNCIONES DE INICIALIZACIÓN ======

/**
 * Inicializar empresas
 */
async function initializeEnhancedCompanies(): Promise<
  Map<string, mongoose.Types.ObjectId>
> {
  logProcess("Inicializando empresas...");
  const companyMap = new Map<string, mongoose.Types.ObjectId>();

  // PASO 1: Crear/Verificar planes en la BD
  logProcess("Verificando planes en base de datos...");
  const planMap = await seedPlans();
  logInfo(`Planes disponibles: ${planMap.size}`);

  // Crear un usuario temporal para asignar como creador/propietario inicial
  const systemUserId = new mongoose.Types.ObjectId();

  for (const companyData of COMPANIES_DATA) {
    try {
      const existingCompany = await EnhancedCompany.findOne({
        "settings.taxId": companyData.rutOrDni,
      });

      if (existingCompany) {
        logWarning(
          `Empresa ${companyData.companyName} (${companyData.rutOrDni}) ya existe`
        );
        companyMap.set(
          companyData.rutOrDni,
          existingCompany._id as mongoose.Types.ObjectId
        );
        continue;
      }

      // PASO 2: Obtener el ObjectId del plan desde la BD
      const planDoc = await getPlanByType(companyData.planType);

      if (!planDoc) {
        logError(
          `Plan ${companyData.planType} no encontrado para ${companyData.companyName}`
        );
        continue;
      }

      logInfo(`Usando plan "${planDoc.name}" para ${companyData.companyName}`);

      // Crear slug desde el nombre
      const slug = companyData.companyName
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/[^a-z0-9\s-]/g, "")
        .replace(/\s+/g, "-")
        .replace(/-+/g, "-")
        .trim()
        .substring(0, 50);

      // ============ MAPEAR FEATURES Y LIMITS DESDE EL PLAN ============

      // ✅ Usar mappers centralizados para asegurar que TODAS las features/limits se copien
      const planFeatures = mapPlanFeaturesToCompanyFeatures(planDoc.features);
      const planLimits = mapPlanLimitsToCompanyLimits(planDoc.limits);

      // PASO 3: Crear empresa con plan como ObjectId y settings completos
      const newCompanyData = {
        name: companyData.companyName,
        slug: slug,
        email: companyData.email,
        phone: "+56 2 1234 5678",
        address: {
          street: "Av. Providencia 1234",
          city: "Santiago",
          state: "Región Metropolitana",
          country: "Chile",
          postalCode: "7500000",
        },
        status:
          planDoc.type === "trial" ? CompanyStatus.TRIAL : CompanyStatus.ACTIVE,
        plan: planDoc._id, // ✅ ObjectId en lugar de string enum
        settings: {
          businessType: companyData.businessType,
          industry: companyData.industry,
          taxId: companyData.rutOrDni,
          currency: Currency.CLP,
          fiscalYear: DEFAULT_COMPANY_SETTINGS.fiscalYear,
          // ✅ TODAS las features (14 propiedades) mapeadas correctamente
          features: planFeatures,
          // ✅ TODOS los limits (6 propiedades) mapeados correctamente
          limits: planLimits,
          branding: DEFAULT_COMPANY_SETTINGS.branding,
          notifications: DEFAULT_COMPANY_SETTINGS.notifications,
        },
        createdBy: systemUserId, // Temporal, se actualizará cuando se cree el admin
        ownerId: systemUserId, // Temporal, se actualizará cuando se cree el admin
        stats: {
          totalUsers: 0,
          totalProducts: 0,
          lastActivity: new Date(),
          storageUsed: 0,
        },
        trialEndsAt:
          planDoc.type === "trial"
            ? new Date(Date.now() + 30 * 24 * 60 * 60 * 1000) // 30 días
            : undefined,
        subscriptionEndsAt:
          planDoc.type !== "trial" && planDoc.type !== "free"
            ? new Date(Date.now() + 365 * 24 * 60 * 60 * 1000) // 1 año
            : undefined,
      };

      const newCompany = await EnhancedCompany.create(newCompanyData);
      companyMap.set(
        companyData.rutOrDni,
        newCompany._id as mongoose.Types.ObjectId
      );
      logInfo(
        `✅ Empresa ${companyData.companyName} creada con plan ${planDoc.name}`
      );
      logInfo(
        `   Features habilitadas: ${
          Object.values(planFeatures).filter(Boolean).length
        }/14`
      );
      logInfo(
        `   Límites: ${planLimits.maxUsers} usuarios, ${planLimits.maxProducts} productos`
      );
    } catch (error) {
      logError(`Error creando empresa ${companyData.companyName}: ${error}`);
    }
  }

  logInfo("✨ Inicialización de empresas completada");
  return companyMap;
}

/**
 * Inicializar usuarios con modelo EnhancedUser
 */
async function initializeEnhancedUsers(
  companyMap: Map<string, mongoose.Types.ObjectId>,
  includeTestUsers = false
): Promise<void> {
  logProcess("Inicializando usuarios...");

  for (const userData of USERS_DATA) {
    try {
      const existingUser = await EnhancedUser.findOne({
        email: userData.email.toLowerCase(),
      });

      if (existingUser) {
        logWarning(`Usuario ${userData.name} (${userData.email}) ya existe`);
        continue;
      }

      // Obtener company ID si es rol de empresa
      let companyId: mongoose.Types.ObjectId | undefined;
      if (userData.roleType === "company" && userData.companyRut) {
        companyId = companyMap.get(userData.companyRut);
        if (!companyId) {
          logError(
            `Empresa con RUT ${userData.companyRut} no encontrada para usuario ${userData.name}`
          );
          continue;
        }
      }

      // Crear ID único para el usuario
      const userId = new mongoose.Types.ObjectId();

      // Crear estructura de rol
      const userRole: IUserRole = {
        roleType: userData.roleType,
        role: userData.role,
        companyId: companyId,
        permissions: [],
        isActive: true,
        assignedAt: new Date(),
        assignedBy: userId, // Se asigna a sí mismo
      };

      // Crear usuario con estructura EnhancedUser
      const newUserData = {
        _id: userId,
        name: userData.name,
        email: userData.email.toLowerCase(),
        password: await bcrypt.hash(userData.password, SALT_ROUNDS),
        status: "active" as const,
        confirmed: true,
        emailVerified: true,
        roles: [userRole],
        primaryCompanyId: companyId || null,
        lastLogin: null,
        loginCount: 0,
        createdBy: null,
        preferences: {
          theme: "light" as const,
          language: "es",
          timezone: "America/Santiago",
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
      };

      const newUser = await EnhancedUser.create(newUserData);
      logInfo(`Usuario ${newUser.name} (${userData.role}) creado exitosamente`);

      // ✅ Si es admin_empresa, actualizar ownerId y createdBy de la empresa
      if (userData.role === "admin_empresa" && companyId) {
        try {
          await EnhancedCompany.findByIdAndUpdate(companyId, {
            ownerId: newUser._id,
            createdBy: newUser._id,
          });
          logInfo(
            `   ownerId actualizado en empresa para admin ${newUser.email}`
          );
        } catch (error) {
          logError(`Error actualizando ownerId de empresa: ${error}`);
        }
      }
    } catch (error) {
      logError(`Error creando usuario ${userData.name}: ${error}`);
    }
  }

  // Crear usuarios de prueba si se solicita
  if (includeTestUsers) {
    await createTestUsers(companyMap);
  }

  logInfo("✨ Inicialización de usuarios completada");

  // ✅ Actualizar estadísticas de todas las empresas
  logProcess("Actualizando estadísticas de empresas...");
  for (const [rut, companyId] of companyMap.entries()) {
    try {
      const company = await EnhancedCompany.findById(companyId);
      if (company) {
        await company.updateStats();
        logInfo(
          `Estadísticas actualizadas para ${rut}: ${company.stats.totalUsers} usuarios`
        );
      }
    } catch (error) {
      logError(`Error actualizando estadísticas para empresa ${rut}: ${error}`);
    }
  }
}

/**
 * Crear usuarios adicionales para testing
 */
async function createTestUsers(
  companyMap: Map<string, mongoose.Types.ObjectId>
): Promise<void> {
  const testUsers = [
    {
      name: "Test Manager",
      email: "testmanager@erpsolutions.cl",
      role: "manager" as CompanyRole,
      companyRut: "77.123.456-7",
    },
    {
      name: "Test Employee",
      email: "testemployee@erpsolutions.cl",
      role: "employee" as CompanyRole,
      companyRut: "77.123.456-7",
    },
    {
      name: "Demo Admin",
      email: "demoadmin@democompany.cl",
      role: "admin_empresa" as CompanyRole,
      companyRut: "76.987.654-3",
    },
  ];

  for (const testUser of testUsers) {
    try {
      const existingUser = await EnhancedUser.findOne({
        email: testUser.email.toLowerCase(),
      });

      if (existingUser) {
        logWarning(`Usuario de prueba ${testUser.name} ya existe`);
        continue;
      }

      const companyId = companyMap.get(testUser.companyRut);
      if (!companyId) {
        logError(
          `Empresa para usuario de prueba ${testUser.name} no encontrada`
        );
        continue;
      }

      const userId = new mongoose.Types.ObjectId();
      const userRole: IUserRole = {
        roleType: "company",
        role: testUser.role,
        companyId: companyId,
        permissions: [],
        isActive: true,
        assignedAt: new Date(),
        assignedBy: userId,
      };

      const testUserData = {
        _id: userId,
        name: testUser.name,
        email: testUser.email.toLowerCase(),
        password: await bcrypt.hash(`Test${testUser.role}2024!`, SALT_ROUNDS),
        status: "active" as const,
        confirmed: true,
        emailVerified: true,
        roles: [userRole],
        primaryCompanyId: companyId,
        lastLogin: null,
        loginCount: 0,
        createdBy: null,
        preferences: {
          theme: "light" as const,
          language: "es",
          timezone: "America/Santiago",
          notifications: {
            email: true,
            push: true,
            sms: false,
          },
        },
      };

      await EnhancedUser.create(testUserData);
      logInfo(`Usuario de prueba ${testUser.name} creado exitosamente`);
    } catch (error) {
      logError(`Error creando usuario de prueba ${testUser.name}: ${error}`);
    }
  }
}

/**
 * Mostrar estadísticas de la base de datos
 */
async function showEnhancedDatabaseStats(): Promise<void> {
  logProcess("📊 Estadísticas de la base de datos:");

  const totalCompanies = await EnhancedCompany.countDocuments();
  const totalUsers = await EnhancedUser.countDocuments();

  console.log(colors.white(`  • Total empresas: ${totalCompanies}`));
  console.log(colors.white(`  • Total usuarios: ${totalUsers}`));

  // Estadísticas por rol
  const roleStats = await EnhancedUser.aggregate([
    { $unwind: "$roles" },
    { $match: { "roles.isActive": true } },
    { $group: { _id: "$roles.role", count: { $sum: 1 } } },
    { $sort: { _id: 1 } },
  ]);

  console.log(colors.white("  • Usuarios por rol:"));
  roleStats.forEach((stat) => {
    console.log(colors.gray(`    - ${stat._id}: ${stat.count}`));
  });

  // Estadísticas por empresa
  const companyStats = await EnhancedUser.aggregate([
    {
      $lookup: {
        from: "enhancedcompanies",
        localField: "primaryCompanyId",
        foreignField: "_id",
        as: "company",
      },
    },
    {
      $group: {
        _id: {
          companyId: "$primaryCompanyId",
          companyName: { $arrayElemAt: ["$company.companyName", 0] },
        },
        count: { $sum: 1 },
      },
    },
    { $sort: { "_id.companyName": 1 } },
  ]);

  console.log(colors.white("  • Usuarios por empresa:"));
  companyStats.forEach((stat) => {
    const companyName = stat._id.companyName || "Global (Super Admin)";
    console.log(colors.gray(`    - ${companyName}: ${stat.count}`));
  });
}

/**
 * Función principal de inicialización
 */
async function runEnhancedInitialization(
  options: {
    includeTestUsers?: boolean;
    skipCompanies?: boolean;
    skipUsers?: boolean;
  } = {}
): Promise<void> {
  try {
    console.log(
      colors.blue.bold("🚀 Iniciando configuración de base de datos...")
    );
    console.log("============================================================");

    let companyMap = new Map<string, mongoose.Types.ObjectId>();

    // Inicializar empresas
    if (!options.skipCompanies) {
      companyMap = await initializeEnhancedCompanies();
    }

    // Inicializar usuarios
    if (!options.skipUsers) {
      await initializeEnhancedUsers(companyMap, options.includeTestUsers);
    }

    // Mostrar estadísticas
    await showEnhancedDatabaseStats();

    console.log("============================================================");
    console.log(
      colors.green.bold(
        "🎉 Inicialización de base de datos completada exitosamente!"
      )
    );

    console.log(colors.cyan.bold("\n📝 CREDENCIALES IMPORTANTES:"));
    console.log(
      colors.white("Super Admin: superadmin@erpsolutions.cl / SuperAdmin2024!")
    );
    console.log(
      colors.white("Admin ERP: admin@erpsolutions.cl / AdminERP2024!")
    );
    console.log(
      colors.white("Manager Demo: manager@democompany.cl / Manager2024!")
    );
    console.log(
      colors.white("Employee Test: empleado@testindustries.cl / Employee2024!")
    );
    console.log(
      colors.white("Viewer Demo: viewer@democompany.cl / Viewer2024!")
    );
  } catch (error) {
    logError(`Error en la inicialización: ${error}`);
    throw error;
  }
}

// Funciones legacy para compatibilidad
export async function getOrCreateCompany(): Promise<string> {
  const companyMap = await initializeEnhancedCompanies();
  return companyMap.get("77.123.456-7")?.toString() || "";
}

export async function initializeAdminUser(): Promise<string> {
  const companyMap = await initializeEnhancedCompanies();
  await initializeEnhancedUsers(companyMap, false);
  return "admin@erpsolutions.cl";
}

// Exportar funciones principales
export { runEnhancedInitialization };

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  (async () => {
    try {
      await connectDB();
      await runEnhancedInitialization({ includeTestUsers: false });
      process.exit(0);
    } catch (error) {
      console.error(colors.red("Error fatal:"), error);
      process.exit(1);
    }
  })();
}
