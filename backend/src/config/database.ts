/** Autor: @elsoprimeDEV */

import mongoose from "mongoose";
import colors from "colors";

export const connectDB = async () => {
  try {
    const DATABASE = process.env.DATABASE_URL;

    if (!DATABASE) {
      throw new Error(
        "DATABASE_URL no está definida en las variables de entorno"
      );
    }

    console.log(colors.yellow("🔌 Intentando conectar a la base de datos..."));

    const connection = await mongoose.connect(DATABASE, {
      serverSelectionTimeoutMS: 5000, // Timeout de 5 segundos
      socketTimeoutMS: 45000,
    });

    console.log(
      colors.bgBlue.white.bold(
        `✅ Conectado a la base de datos: ${connection.connection.host}`
      )
    );

    return connection;
  } catch (error) {
    console.error(
      colors.bgRed.white.bold(`❌ Error al conectar con la base de datos:`),
      error.message
    );
    throw error; // ⚠️ IMPORTANTE: Lanzar el error para que se maneje arriba
  }
};

// Manejar eventos de conexión
mongoose.connection.on("disconnected", () => {
  console.log(colors.yellow.bold("⚠️ Mongoose desconectado de la BD"));
});

mongoose.connection.on("error", (err) => {
  console.error(colors.red.bold("❌ Error en la conexión de Mongoose:"), err);
});
