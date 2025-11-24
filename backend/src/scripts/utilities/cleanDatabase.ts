/**
 * Database Cleanup Script
 * @description: Script para limpiar la base de datos antes de reinicializar
 * @author: Esteban Soto Ojeda @elsoprimeDev
 */

import { config } from "dotenv";
import { connectDB } from "@/config/database";
import Company from "@/modules/companiesManagement/models/EnhancedCompany";
import EnhancedUser from "@/modules/userManagement/models/EnhancedUser";
import Plan from "@/models/Plan";
import colors from "colors";

// Cargar variables de entorno
config();

/**
 * Limpiar todas las colecciones de la base de datos
 */
export async function cleanDatabase(): Promise<void> {
  try {
    console.log(colors.bold.red("🧹 Limpiando base de datos..."));
    console.log(colors.bold.red("=".repeat(60)));

    // Contar documentos antes de limpiar
    const userCount = await EnhancedUser.countDocuments();
    const companyCount = await Company.countDocuments();
    const planCount = await Plan.countDocuments();

    console.log(colors.yellow(`📊 Estado actual:`));
    console.log(colors.yellow(`  • Usuarios: ${userCount}`));
    console.log(colors.yellow(`  • Empresas: ${companyCount}`));
    console.log(colors.yellow(`  • Planes: ${planCount}`));

    if (userCount === 0 && companyCount === 0 && planCount === 0) {
      console.log(colors.green("✅ La base de datos ya está limpia"));
      return;
    }

    // Confirmar limpieza
    console.log(
      colors.bold.red(
        "\n⚠️  ADVERTENCIA: Esta acción eliminará TODOS los datos de la base de datos"
      )
    );

    // En un script automatizado, proceder directamente
    // En producción, podrías agregar una confirmación manual aquí

    console.log(colors.red("🗑️  Eliminando usuarios..."));
    const deletedUsers = await EnhancedUser.deleteMany({});
    console.log(
      colors.green(`✅ ${deletedUsers.deletedCount} usuarios eliminados`)
    );

    console.log(colors.red("🗑️  Eliminando empresas..."));
    const deletedCompanies = await Company.deleteMany({});
    console.log(
      colors.green(`✅ ${deletedCompanies.deletedCount} empresas eliminadas`)
    );

    console.log(colors.red("🗑️  Eliminando planes..."));
    const deletedPlans = await Plan.deleteMany({});
    console.log(
      colors.green(`✅ ${deletedPlans.deletedCount} planes eliminados`)
    );

    console.log(
      colors.bold.green(
        "\n🎉 Limpieza de base de datos completada exitosamente!"
      )
    );
  } catch (error) {
    console.error(colors.red.bold("❌ Error durante la limpieza:"));
    console.error(colors.red(error));
    throw error;
  }
}

/**
 * Script principal de limpieza
 */
async function runCleanup() {
  try {
    // Conectar a la base de datos
    console.log(colors.cyan("🔌 Conectando a la base de datos..."));
    await connectDB();
    console.log(colors.green("✅ Conexión establecida exitosamente"));

    // Ejecutar limpieza
    await cleanDatabase();
  } catch (error) {
    console.error(colors.red.bold("❌ Error durante la limpieza:"));
    console.error(colors.red(error));
    process.exit(1);
  } finally {
    // Cerrar conexión y terminar proceso
    process.exit(0);
  }
}

// Verificar si se ejecuta directamente
if (require.main === module) {
  runCleanup();
}

export default {
  cleanDatabase,
  runCleanup,
};
