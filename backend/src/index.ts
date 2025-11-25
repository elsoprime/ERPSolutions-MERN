import server from "./server";
import colors from "colors";
import { connectDB } from "./config/database";

const port = Number(process.env.PORT) || 4000;
const host = "0.0.0.0"; // Escuchar en todas las interfaces para Fly.io

// Iniciar servidor después de conectar a la base de datos
const startServer = async () => {
  try {
    // Conectar a la base de datos primero
    await connectDB();

    // Luego iniciar el servidor
    server.listen(port, host, () => {
      console.log(colors.cyan.bold(`REST API funcionando en ${host}:${port}`));
    });
  } catch (error) {
    console.error(colors.red.bold("Error al iniciar el servidor:"), error);
    process.exit(1);
  }
};

startServer();
