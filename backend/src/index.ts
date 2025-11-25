import server from "./server";
import colors from "colors";
import { connectDB } from "./config/database";

const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0";

const startServer = async () => {
  try {
    console.log(colors.cyan.bold("=".repeat(50)));
    console.log(colors.cyan.bold("🚀 INICIANDO SERVIDOR"));
    console.log(colors.cyan.bold("=".repeat(50)));
    console.log(colors.yellow(`📍 Puerto: ${port}`));
    console.log(colors.yellow(`📍 Host: ${host}`));
    console.log(
      colors.yellow(`📍 Entorno: ${process.env.NODE_ENV || "development"}`)
    );
    console.log(colors.yellow(`📍 Node version: ${process.version}`));

    // ⚡ PRIMERO: Iniciar el servidor (crítico para Render)
    const serverInstance = server.listen(port, host, () => {
      console.log(
        colors.green.bold(`✅ Servidor escuchando en ${host}:${port}`)
      );
      console.log(
        colors.green(`🔗 Health check: http://${host}:${port}/api/health`)
      );
    });

    // Manejar errores del servidor
    serverInstance.on("error", (error: NodeJS.ErrnoException) => {
      if (error.code === "EADDRINUSE") {
        console.error(colors.red.bold(`❌ El puerto ${port} ya está en uso`));
      } else {
        console.error(colors.red.bold("❌ Error del servidor:"), error);
      }
      process.exit(1);
    });

    // 🔌 SEGUNDO: Conectar a la base de datos (en paralelo, no bloqueante)
    console.log(colors.yellow.bold("\n🔌 Conectando a la base de datos..."));

    try {
      await connectDB();
      console.log(colors.green.bold("✅ Sistema completamente operativo\n"));
    } catch (dbError) {
      console.error(
        colors.red.bold(
          "⚠️ ADVERTENCIA: Servidor iniciado SIN conexión a base de datos"
        )
      );
      console.error(
        colors.yellow(
          "El servidor continuará funcionando, pero las operaciones de BD fallarán"
        )
      );
      console.error(
        colors.yellow("Verifica tu DATABASE_URL y la conectividad de red\n")
      );
    }
  } catch (error) {
    console.error(colors.red.bold("❌ ERROR CRÍTICO al iniciar:"), error);
    process.exit(1);
  }
};

// Manejo de señales para graceful shutdown
process.on("SIGTERM", () => {
  console.log(colors.yellow.bold("⚠️ SIGTERM recibido, cerrando servidor..."));
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log(colors.yellow.bold("⚠️ SIGINT recibido, cerrando servidor..."));
  process.exit(0);
});

// Manejar errores no capturados
process.on("unhandledRejection", (reason, promise) => {
  console.error(colors.red.bold("❌ Unhandled Rejection:"), reason);
});

process.on("uncaughtException", (error) => {
  console.error(colors.red.bold("❌ Uncaught Exception:"), error);
  process.exit(1);
});

console.log(colors.cyan.bold("\n🔥 Iniciando aplicación...\n"));
startServer();
