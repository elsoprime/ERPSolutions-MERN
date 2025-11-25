/**
 * Database Initialization Script
 * @description: Script completo para inicializar la base de datos con empresas, usuarios y roles
 * @author: Esteban Soto Ojeda @elsoprimeDev
 * @version: 2.0.0 Enhanced Companies
 */

import bcrypt from "bcrypt";
import colors from "colors";
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
} from "@/modules/companiesManagement/types/EnhandedCompanyTypes";
import { PlanType } from "@/interfaces/IPlan";

// ====== ENUMS Y CONSTANTES ======
export enum UserRole {
  SUPER_ADMIN = "super_admin",
  ADMIN_EMPRESA = "admin_empresa",
  MANAGER = "manager",
  EMPLOYEE = "employee",
  VIEWER = "viewer",
}

export enum UserStatus {
  ACTIVE = "active",
  INACTIVE = "inactive",
  SUSPENDED = "suspended",
  PENDING = "pending",
}

// ====== DATOS DE INICIALIZACIÓN ======
const COMPANIES_DATA: ICreateCompanyRequest[] = [
  {
    name: "ERP Solutions SPA",
    slug: "erp-solutions",
    description: "Software ERP desarrollado por ELSOMEDIA - Empresa Principal",
    website: "https://erpsolutions.cl",
    email: "admin@erpsolutions.cl",
    phone: "+56 9 1234 5678",
    address: {
      street: "Calle Falsa 123",
      city: "Santiago",
      state: "Región Metropolitana",
      country: "Chile",
      postalCode: "8320000",
    },
    plan: null, // TODO: Asignar ObjectId del plan correcto desde la BD
    settings: {
      businessType: BusinessType.TECHNOLOGY,
      industry: "Technology",
      taxId: "77.123.456-7",
      currency: Currency.CLP,
      fiscalYear: {
        startMonth: 1,
        endMonth: 12,
      },
    },
  },
  {
    name: "Demo Company SPA",
    slug: "demo-company",
    description: "Empresa de demostración para testing del sistema ERP",
    email: "demo@democompany.cl",
    phone: "+56 9 8765 4321",
    address: {
      street: "Av. Las Condes 5678",
      city: "Santiago",
      state: "Región Metropolitana",
      country: "Chile",
      postalCode: "7550000",
    },
    plan: null, // TODO: Asignar ObjectId del plan correcto desde la BD
    settings: {
      businessType: BusinessType.RETAIL,
      industry: "Comercio y Retail",
      taxId: "76.987.654-3",
      currency: Currency.CLP,
      fiscalYear: {
        startMonth: 1,
        endMonth: 12,
      },
    },
  },
  {
    name: "Test Industries LTDA",
    slug: "test-industries",
    description: "Empresa industrial para pruebas del módulo de manufactura",
    email: "admin@testindustries.cl",
    phone: "+56 2 3456 7890",
    address: {
      street: "Parque Industrial 999",
      city: "Quilicura",
      state: "Región Metropolitana",
      country: "Chile",
      postalCode: "8700000",
    },
    plan: null, // TODO: Asignar ObjectId del plan correcto desde la BD
    settings: {
      businessType: BusinessType.MANUFACTURING,
      industry: "Manufactura",
      taxId: "75.555.444-9",
      currency: Currency.CLP,
      fiscalYear: {
        startMonth: 1,
        endMonth: 12,
      },
    },
  },
];

const USERS_DATA = [
  {
    name: "Super Administrador",
    email: "superadmin@erpsolutions.cl",
    password: process.env.SUPER_ADMIN_PASSWORD || "SuperAdmin2024!",
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.SUPER_ADMIN,
    companyId: null, // Super Admin no pertenece a una empresa específica
  },
  {
    name: "Admin ERP Solutions",
    email: "admin@erpsolutions.cl",
    password: process.env.ADMIN_PASSWORD || "AdminERP2024!",
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.ADMIN_EMPRESA,
    companyId: "ERP_SOLUTIONS", // Se asignará el ID real después
  },
  {
    name: "Manager Demo",
    email: "manager@democompany.cl",
    password: process.env.MANAGER_PASSWORD || "Manager2024!",
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.MANAGER,
    companyId: "DEMO_COMPANY",
  },
  {
    name: "Empleado Test",
    email: "empleado@testindustries.cl",
    password: process.env.EMPLOYEE_PASSWORD || "Employee2024!",
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.EMPLOYEE,
    companyId: "TEST_INDUSTRIES",
  },
  {
    name: "Viewer Demo",
    email: "viewer@democompany.cl",
    password: process.env.VIEWER_PASSWORD || "Viewer2024!",
    status: UserStatus.ACTIVE,
    confirmed: true,
    role: UserRole.VIEWER,
    companyId: "DEMO_COMPANY",
  },
];

// ====== FUNCIONES DE UTILIDAD ======
async function hashPassword(password: string): Promise<string> {
  const saltRounds = 12;
  return await bcrypt.hash(password, saltRounds);
}

/**
 * Crear o verificar el usuario Super Admin
 */
async function createSuperAdminUser(): Promise<any> {
  const superAdminData = USERS_DATA.find(
    (user) => user.role === UserRole.SUPER_ADMIN
  );
  if (!superAdminData) {
    throw new Error("No se encontraron datos del Super Admin");
  }

  // Verificar si ya existe
  const existingUser = await EnhancedUser.findOne({
    email: superAdminData.email,
  });
  if (existingUser) {
    logWarning(`Super Admin ${existingUser.name} ya existe`);
    return existingUser;
  }

  // Crear el Super Admin
  const hashedPassword = await hashPassword(superAdminData.password);
  const newSuperAdmin = await EnhancedUser.create({
    name: superAdminData.name,
    email: superAdminData.email,
    password: hashedPassword,
    status: superAdminData.status,
    confirmed: superAdminData.confirmed,
    role: superAdminData.role,
    companyId: null,
  });

  logSuccess(`Super Admin ${newSuperAdmin.name} creado exitosamente`);
  return newSuperAdmin;
}

function logSuccess(message: string): void {
  console.log(colors.green.bold(`✅ ${message}`));
}

function logInfo(message: string): void {
  console.log(colors.cyan.bold(`ℹ️  ${message}`));
}

function logWarning(message: string): void {
  console.log(colors.yellow.bold(`⚠️  ${message}`));
}

function logError(message: string, error?: any): void {
  console.log(colors.red.bold(`❌ ${message}`));
  if (error) {
    console.error(colors.red(error));
  }
}

// ====== FUNCIONES DE CREACIÓN ======

/**
 * Crear o verificar empresas en la base de datos
 */
export async function initializeCompanies(
  superAdminId?: string
): Promise<Map<string, string>> {
  const companyIdMap = new Map<string, string>();

  logInfo("Inicializando empresas...");

  // Si no se proporciona superAdminId, crear el Super Admin primero
  if (!superAdminId) {
    const superAdminUser = await createSuperAdminUser();
    superAdminId = superAdminUser._id.toString();
  }

  try {
    for (const companyData of COMPANIES_DATA) {
      // Verificar si ya existe por taxId o slug
      const existingCompany = await EnhancedCompany.findOne({
        $or: [
          { "settings.taxId": companyData.settings.taxId },
          { slug: companyData.slug },
        ],
      });

      if (existingCompany) {
        logWarning(
          `Empresa ${existingCompany.name} (${existingCompany.settings.taxId}) ya existe`
        );

        // Mapear según el taxId para facilitar la asignación
        if (companyData.settings.taxId === "77.123.456-7") {
          companyIdMap.set("ERP_SOLUTIONS", existingCompany._id.toString());
        } else if (companyData.settings.taxId === "76.987.654-3") {
          companyIdMap.set("DEMO_COMPANY", existingCompany._id.toString());
        } else if (companyData.settings.taxId === "75.555.444-9") {
          companyIdMap.set("TEST_INDUSTRIES", existingCompany._id.toString());
        }
      } else {
        try {
          // Agregar los campos requeridos ownerId y createdBy
          const companyDataWithOwner = {
            ...companyData,
            ownerId: superAdminId,
            createdBy: superAdminId,
          };

          const newCompany = await EnhancedCompany.create(companyDataWithOwner);
          logSuccess(`Empresa ${newCompany.name} creada exitosamente`);

          // Mapear según el taxId
          if (companyData.settings.taxId === "77.123.456-7") {
            companyIdMap.set("ERP_SOLUTIONS", newCompany._id.toString());
          } else if (companyData.settings.taxId === "76.987.654-3") {
            companyIdMap.set("DEMO_COMPANY", newCompany._id.toString());
          } else if (companyData.settings.taxId === "75.555.444-9") {
            companyIdMap.set("TEST_INDUSTRIES", newCompany._id.toString());
          }
        } catch (createError: any) {
          // Si es un error de duplicado, buscar la empresa existente
          if (createError.code === 11000) {
            logWarning(
              `Empresa con datos duplicados detectada, buscando existente...`
            );
            const existingBySlug = await EnhancedCompany.findOne({
              slug: companyData.slug,
            });
            if (existingBySlug) {
              logWarning(
                `Empresa ${existingBySlug.name} ya existe con slug ${companyData.slug}`
              );

              // Mapear según el taxId de la empresa encontrada
              if (existingBySlug.settings.taxId === "77.123.456-7") {
                companyIdMap.set(
                  "ERP_SOLUTIONS",
                  existingBySlug._id.toString()
                );
              } else if (existingBySlug.settings.taxId === "76.987.654-3") {
                companyIdMap.set("DEMO_COMPANY", existingBySlug._id.toString());
              } else if (existingBySlug.settings.taxId === "75.555.444-9") {
                companyIdMap.set(
                  "TEST_INDUSTRIES",
                  existingBySlug._id.toString()
                );
              }
            }
          } else {
            throw createError;
          }
        }
      }
    }

    logSuccess(`✨ Inicialización de empresas completada`);
    return companyIdMap;
  } catch (error) {
    logError("Error al inicializar empresas", error);
    throw error;
  }
}

/**
 * Crear o verificar usuarios en la base de datos
 */
export async function initializeUsers(
  companyIdMap: Map<string, string>
): Promise<void> {
  logInfo("Inicializando usuarios...");

  try {
    // Filtrar el Super Admin ya que ya fue creado
    const usersToCreate = USERS_DATA.filter(
      (user) => user.role !== UserRole.SUPER_ADMIN
    );

    for (const userData of usersToCreate) {
      const existingUser = await EnhancedUser.findOne({
        email: userData.email,
      });

      if (existingUser) {
        logWarning(
          `Usuario ${existingUser.name} (${existingUser.email}) ya existe`
        );

        // Verificar y actualizar contraseña si es necesario
        const passwordMatch = await bcrypt.compare(
          userData.password,
          existingUser.password
        );
        if (!passwordMatch) {
          const hashedPassword = await hashPassword(userData.password);
          await EnhancedUser.updateOne(
            { email: userData.email },
            { password: hashedPassword }
          );
          logInfo(`Contraseña actualizada para ${existingUser.name}`);
        }
      } else {
        // Preparar datos del usuario
        const hashedPassword = await hashPassword(userData.password);

        const userToCreate = {
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          status: userData.status,
          confirmed: userData.confirmed,
          role: userData.role,
          companyId: null as any,
        };

        // Asignar companyId si corresponde
        if (userData.companyId && userData.companyId !== null) {
          const companyId = companyIdMap.get(userData.companyId);
          if (companyId) {
            userToCreate.companyId = companyId;
          } else {
            logWarning(`No se encontró empresa para ${userData.companyId}`);
          }
        }

        const newUser = await EnhancedUser.create(userToCreate);
        logSuccess(
          `Usuario ${newUser.name} (${newUser.roles}) creado exitosamente`
        );
      }
    }

    logSuccess(`✨ Inicialización de usuarios completada`);
  } catch (error) {
    logError("Error al inicializar usuarios", error);
    throw error;
  }
}

/**
 * Verificar y mostrar estadísticas de la base de datos
 */
export async function showDatabaseStats(): Promise<void> {
  try {
    logInfo("📊 Estadísticas de la base de datos:");

    const totalCompanies = await EnhancedCompany.countDocuments();
    const totalUsers = await EnhancedUser.countDocuments();

    console.log(colors.cyan(`  • Total empresas: ${totalCompanies}`));
    console.log(colors.cyan(`  • Total usuarios: ${totalUsers}`));

    // Estadísticas por rol
    const roleStats = await EnhancedUser.aggregate([
      {
        $group: {
          _id: "$role",
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log(colors.cyan("  • Usuarios por rol:"));
    roleStats.forEach((stat) => {
      console.log(colors.cyan(`    - ${stat._id}: ${stat.count}`));
    });

    // Estadísticas por empresa
    const companyStats = await EnhancedUser.aggregate([
      {
        $lookup: {
          from: "enhancedcompanies",
          localField: "companyId",
          foreignField: "_id",
          as: "company",
        },
      },
      {
        $group: {
          _id: "$companyId",
          companyName: { $first: { $arrayElemAt: ["$company.name", 0] } },
          count: { $sum: 1 },
        },
      },
      {
        $sort: { count: -1 },
      },
    ]);

    console.log(colors.cyan("  • Usuarios por empresa:"));
    companyStats.forEach((stat) => {
      const companyName = stat.companyName || "Global (Super Admin)";
      console.log(colors.cyan(`    - ${companyName}: ${stat.count}`));
    });
  } catch (error) {
    logError("Error al obtener estadísticas", error);
  }
}

/**
 * Crear usuarios de prueba adicionales para testing
 */
export async function createTestUsers(
  companyIdMap: Map<string, string>
): Promise<void> {
  logInfo("Creando usuarios de prueba adicionales...");

  const testUsers = [
    {
      name: "Test Manager",
      email: "testmanager@erpsolutions.cl",
      password: "TestManager2024!",
      role: UserRole.MANAGER,
      companyId: "ERP_SOLUTIONS",
    },
    {
      name: "Test Employee",
      email: "testemployee@erpsolutions.cl",
      password: "TestEmployee2024!",
      role: UserRole.EMPLOYEE,
      companyId: "ERP_SOLUTIONS",
    },
    {
      name: "Demo Admin",
      email: "demoadmin@democompany.cl",
      password: "DemoAdmin2024!",
      role: UserRole.ADMIN_EMPRESA,
      companyId: "DEMO_COMPANY",
    },
  ];

  try {
    for (const userData of testUsers) {
      const existingUser = await EnhancedUser.findOne({
        email: userData.email,
      });

      if (!existingUser) {
        const hashedPassword = await hashPassword(userData.password);
        const companyId = companyIdMap.get(userData.companyId);

        await EnhancedUser.create({
          name: userData.name,
          email: userData.email,
          password: hashedPassword,
          status: UserStatus.ACTIVE,
          confirmed: true,
          role: userData.role,
          companyId: companyId,
        });

        logSuccess(`Usuario de prueba ${userData.name} creado`);
      }
    }
  } catch (error) {
    logError("Error al crear usuarios de prueba", error);
  }
}

/**
 * Función principal de inicialización
 */
export async function initializeDatabase(
  includeTestUsers = false
): Promise<void> {
  console.log(
    colors.bold.blue("🚀 Iniciando configuración de base de datos...")
  );
  console.log(colors.bold.blue("=".repeat(60)));

  try {
    // 1. Crear Super Admin primero
    const superAdminUser = await createSuperAdminUser();

    // 2. Inicializar empresas con el Super Admin como owner
    const companyIdMap = await initializeCompanies(
      superAdminUser._id.toString()
    );

    // 3. Inicializar usuarios principales
    await initializeUsers(companyIdMap);

    // 4. Crear usuarios de prueba si se solicita
    if (includeTestUsers) {
      await createTestUsers(companyIdMap);
    }

    // 4. Mostrar estadísticas
    await showDatabaseStats();

    console.log(colors.bold.blue("=".repeat(60)));
    console.log(
      colors.bold.green(
        "🎉 Inicialización de base de datos completada exitosamente!"
      )
    );

    // Mostrar credenciales importantes
    console.log(colors.bold.yellow("\n📝 CREDENCIALES IMPORTANTES:"));
    console.log(
      colors.yellow("Super Admin: superadmin@erpsolutions.cl / SuperAdmin2024!")
    );
    console.log(
      colors.yellow("Admin ERP: admin@erpsolutions.cl / AdminERP2024!")
    );
    console.log(
      colors.yellow("Manager Demo: manager@democompany.cl / Manager2024!")
    );
    console.log(
      colors.yellow("Employee Test: empleado@testindustries.cl / Employee2024!")
    );
    console.log(
      colors.yellow("Viewer Demo: viewer@democompany.cl / Viewer2024!")
    );
  } catch (error) {
    logError("❌ Error en la inicialización de la base de datos", error);
    throw error;
  }
}

// ====== FUNCIONES DE COMPATIBILIDAD (LEGACY) ======

/**
 * Función legacy para compatibilidad - obtener o crear empresa principal
 */
export async function getOrCreateCompany(): Promise<string> {
  const superAdminUser = await createSuperAdminUser();
  const companyIdMap = await initializeCompanies(superAdminUser._id.toString());
  return companyIdMap.get("ERP_SOLUTIONS") || "";
}

/**
 * Función legacy para compatibilidad - inicializar usuario admin
 */
export async function initializeAdminUser(): Promise<string> {
  const superAdminUser = await createSuperAdminUser();
  const companyIdMap = await initializeCompanies(superAdminUser._id.toString());
  await initializeUsers(companyIdMap);
  return "admin@erpsolutions.cl";
}

// ====== EXPORTACIÓN POR DEFECTO ======
export default {
  initializeDatabase,
  initializeCompanies,
  initializeUsers,
  createTestUsers,
  showDatabaseStats,
  getOrCreateCompany,
  initializeAdminUser,
};
