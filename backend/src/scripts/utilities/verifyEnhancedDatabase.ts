/**
 * Enhanced Database Verification Script
 * @description: Script para verificar el estado de la base de datos con EnhancedCompany
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { config } from "dotenv";
import { connectDB } from "@/config/database";
import EnhancedCompany from "@/modules/companiesManagement/models/EnhancedCompany";
import EnhancedUser from "@/modules/userManagement/models/EnhancedUser";
import colors from "colors";
import { Types } from "mongoose";

// Cargar variables de entorno
config();

// Interfaces para tipado específico
interface CompanyAggregateResult {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  email: string;
  plan: string;
  status: string;
  userCount: number;
  settings: {
    taxId?: string;
    industry?: string;
    limits?: {
      maxUsers: number;
    };
    features?: Record<string, boolean>;
  };
  stats?: {
    totalUsers: number;
  };
  users: UserSummary[];
}

interface UserSummary {
  name: string;
  email: string;
  role: string;
  confirmed: boolean;
}

interface RoleStatistic {
  _id: string;
  count: number;
}

interface UsersByCompanyResult {
  _id: Types.ObjectId | null;
  companyName: string;
  users: UserSummary[];
}

interface TestUser {
  name: string;
  email: string;
  confirmed: boolean;
  primaryCompanyId?: {
    name: string;
  };
}

interface UserWithCompany {
  name: string;
  email: string;
  primaryCompanyId?: {
    name: string;
  } | null;
}

/**
 * Verificar el estado actual de la base de datos con EnhancedCompany
 */
export async function verifyEnhancedDatabaseState(): Promise<void> {
  try {
    console.log(
      colors.bold.blue(
        "🔍 Verificando estado de la base de datos (Enhanced)..."
      )
    );
    console.log(colors.bold.blue("=".repeat(60)));

    // Estadísticas generales
    const totalCompanies = await EnhancedCompany.countDocuments();
    const totalUsers = await EnhancedUser.countDocuments();

    console.log(colors.cyan.bold("📊 ESTADÍSTICAS GENERALES:"));
    console.log(colors.cyan(`  • Total empresas: ${totalCompanies}`));
    console.log(colors.cyan(`  • Total usuarios: ${totalUsers}`));

    // Empresas registradas con estadísticas detalladas
    const companies = (await EnhancedCompany.aggregate([
      {
        $lookup: {
          from: "enhancedusers",
          localField: "_id",
          foreignField: "primaryCompanyId",
          as: "users",
        },
      },
      {
        $lookup: {
          from: "plans",
          localField: "plan",
          foreignField: "_id",
          as: "planInfo",
        },
      },
      {
        $project: {
          name: 1,
          slug: 1,
          "settings.taxId": 1,
          "settings.industry": 1,
          email: 1,
          plan: 1,
          planName: { $arrayElemAt: ["$planInfo.name", 0] },
          planType: { $arrayElemAt: ["$planInfo.type", 0] },
          status: 1,
          "settings.limits": 1,
          "stats.totalUsers": 1,
          "settings.features": 1,
          userCount: { $size: "$users" },
          users: {
            $map: {
              input: "$users",
              as: "user",
              in: {
                name: "$$user.name",
                email: "$$user.email",
                role: "$$user.role",
                confirmed: "$$user.confirmed",
              },
            },
          },
        },
      },
    ])) as CompanyAggregateResult[];

    console.log(colors.cyan.bold("\n🏢 EMPRESAS REGISTRADAS:"));
    companies.forEach((company, index) => {
      console.log(colors.cyan(`  ${index + 1}. ${company.name}`));
      console.log(colors.gray(`     Slug: ${company.slug}`));
      console.log(colors.gray(`     RUT: ${company.settings?.taxId || "N/A"}`));
      console.log(
        colors.gray(`     Industria: ${company.settings?.industry || "N/A"}`)
      );
      console.log(colors.gray(`     Email: ${company.email}`));
      console.log(
        colors.gray(
          `     Plan: ${(company as any).planName || "N/A"} (${
            (company as any).planType || "N/A"
          })`
        )
      );
      console.log(colors.gray(`     Estado: ${company.status.toUpperCase()}`));
      console.log(
        colors.gray(
          `     Usuarios: ${company.userCount}/${
            company.settings?.limits?.maxUsers || 0
          }`
        )
      );

      // Mostrar características habilitadas
      if (company.settings?.features) {
        const enabledFeatures = Object.entries(company.settings.features)
          .filter(([_, enabled]) => enabled)
          .map(([feature, _]) => feature);

        if (enabledFeatures.length > 0) {
          console.log(
            colors.gray(`     Características: ${enabledFeatures.join(", ")}`)
          );
        }
      }
    });

    // Estadísticas por rol
    const roleStats = (await EnhancedUser.aggregate([
      { $unwind: { path: "$roles", preserveNullAndEmptyArrays: true } },
      { $group: { _id: "$roles.role", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ])) as RoleStatistic[];

    console.log(colors.cyan.bold("\n👥 USUARIOS POR ROL:"));
    roleStats.forEach((stat: RoleStatistic) => {
      const roleIcon: Record<string, string> = {
        super_admin: "🔴",
        admin_empresa: "🔵",
        manager: "🟢",
        employee: "🟡",
        viewer: "⚪",
      };

      const roleName: Record<string, string> = {
        super_admin: "Super Admin",
        admin_empresa: "Admin Empresa",
        manager: "Manager",
        employee: "Employee",
        viewer: "Viewer",
      };

      const icon = roleIcon[stat._id] || "❓";
      const name = roleName[stat._id] || stat._id;

      console.log(colors.cyan(`  ${icon} ${name}: ${stat.count}`));
    });

    // Usuarios por empresa
    const usersByCompany = (await EnhancedUser.aggregate([
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
          _id: "$primaryCompanyId",
          companyName: { $first: { $arrayElemAt: ["$company.name", 0] } },
          users: {
            $push: {
              name: "$name",
              email: "$email",
              role: "$role",
              confirmed: "$confirmed",
            },
          },
        },
      },
      { $sort: { companyName: 1 } },
    ])) as UsersByCompanyResult[];

    console.log(colors.cyan.bold("\n🏢 USUARIOS POR EMPRESA:"));

    // Usuarios sin empresa (Super Admins)
    const globalUsers = usersByCompany.find(
      (group: UsersByCompanyResult) => !group._id
    );
    if (globalUsers) {
      console.log(
        colors.cyan(
          `  📋 Global (Super Admin) (${globalUsers.users.length} usuarios):`
        )
      );
      globalUsers.users.forEach((user: UserSummary) => {
        const roleIcon: Record<string, string> = {
          super_admin: "🔴",
          admin_empresa: "🔵",
          manager: "🟢",
          employee: "🟡",
          viewer: "⚪",
        };

        const icon = roleIcon[user.role] || "❓";
        const status = user.confirmed ? "✅" : "❌";
        console.log(
          colors.cyan(`     ${status} ${icon} ${user.name} (${user.email})`)
        );
      });
    }

    // Usuarios por empresa específica
    usersByCompany
      .filter((group: UsersByCompanyResult) => group._id)
      .forEach((group: UsersByCompanyResult) => {
        console.log(
          colors.cyan(
            `  📋 ${group.companyName} (${group.users.length} usuarios):`
          )
        );
        group.users.forEach((user: UserSummary) => {
          const roleIcon: Record<string, string> = {
            super_admin: "🔴",
            admin_empresa: "🔵",
            manager: "🟢",
            employee: "🟡",
            viewer: "⚪",
          };

          const icon = roleIcon[user.role] || "❓";
          const status = user.confirmed ? "✅" : "❌";
          console.log(
            colors.cyan(`     ${status} ${icon} ${user.name} (${user.email})`)
          );
        });
      });

    // Credenciales de testing
    const testUsers = (await EnhancedUser.find(
      { confirmed: true },
      "name email primaryCompanyId"
    ).populate("primaryCompanyId", "name")) as unknown as TestUser[];

    console.log(colors.cyan.bold("\n🔐 CREDENCIALES DE TESTING:"));
    testUsers.forEach((user: TestUser) => {
      console.log(colors.cyan(`  ✅ ${user.email}`));
      console.log(colors.gray(`     Nombre: ${user.name}`));
      if (user.primaryCompanyId?.name) {
        console.log(colors.gray(`     Empresa: ${user.primaryCompanyId.name}`));
      }
      console.log(colors.gray(`     Confirmado: Sí`));
    });

    // Verificación de problemas
    console.log(colors.cyan.bold("\n🔍 VERIFICACIÓN DE PROBLEMAS:"));

    // Verificar usuarios sin empresa válida (excepto super admins)
    const usersWithoutCompany = (await EnhancedUser.find({
      primaryCompanyId: { $exists: true, $ne: null },
    }).populate("primaryCompanyId")) as unknown as UserWithCompany[];

    const invalidCompanyUsers = usersWithoutCompany.filter(
      (user: UserWithCompany) => !user.primaryCompanyId
    );

    if (invalidCompanyUsers.length > 0) {
      console.log(
        colors.red(
          `  ❌ ${invalidCompanyUsers.length} usuarios con referencias de empresa inválidas`
        )
      );
      invalidCompanyUsers.forEach((user: UserWithCompany) => {
        console.log(colors.red(`     - ${user.name} (${user.email})`));
      });
    } else {
      console.log(
        colors.green(
          "  ✅ Todos los usuarios tienen empresa asignada correctamente"
        )
      );
    }

    // Verificar roles válidos
    const validGlobalRoles = ["super_admin"];
    const validCompanyRoles = [
      "admin_empresa",
      "manager",
      "employee",
      "viewer",
    ];

    // Obtener todos los usuarios para verificar sus roles
    const allUsers = await EnhancedUser.find({});
    const invalidRoleUsers: UserWithCompany[] = [];

    allUsers.forEach((user) => {
      // Verificar cada rol del usuario
      user.roles.forEach((roleObj) => {
        const isValidGlobalRole =
          roleObj.roleType === "global" &&
          validGlobalRoles.includes(roleObj.role);
        const isValidCompanyRole =
          roleObj.roleType === "company" &&
          validCompanyRoles.includes(roleObj.role);

        if (!isValidGlobalRole && !isValidCompanyRole) {
          invalidRoleUsers.push({
            name: user.name,
            email: user.email,
            primaryCompanyId: user.primaryCompanyId as any,
          });
        }
      });
    });

    if (invalidRoleUsers.length > 0) {
      console.log(
        colors.red(
          `  ❌ ${invalidRoleUsers.length} usuarios con roles inválidos`
        )
      );
      invalidRoleUsers.forEach((user: UserWithCompany) => {
        console.log(colors.red(`     - ${user.name}`));
      });
    } else {
      console.log(colors.green("  ✅ Todos los usuarios tienen roles válidos"));
    }

    // Verificar límites de empresa
    for (const company of companies) {
      const maxUsers = company.settings?.limits?.maxUsers || 0;
      if (company.userCount > maxUsers) {
        console.log(
          colors.yellow(
            `  ⚠️  ${company.name} excede el límite de usuarios (${company.userCount}/${maxUsers})`
          )
        );
      }
    }

    console.log(colors.bold.blue("\n" + "=".repeat(60)));
    console.log(colors.bold.green("🎉 Verificación completada"));
  } catch (error) {
    console.error(colors.red.bold("❌ Error durante la verificación:"), error);
    throw error;
  }
}

/**
 * Función principal
 */
async function main() {
  try {
    await connectDB();
    console.log(colors.green("✅ Conexión establecida exitosamente"));
    await verifyEnhancedDatabaseState();
  } catch (error) {
    console.error(
      colors.red.bold("❌ Error en el script de verificación:"),
      error
    );
    process.exit(1);
  }
}

// Ejecutar solo si es llamado directamente
if (require.main === module) {
  main();
}
