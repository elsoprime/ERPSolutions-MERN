import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import morgan from "morgan";
import { corsConfig } from "./config/cors";
import appRoutes from "./routes/appRoutes";
import settingsRoutes from "./routes/settingsRoutes";
import locationRoutes from "./routes/locationRoutes";
import servicesRoutes from "./routes/servicesRoutes";
import healthRoutes from "./routes/healthRoutes";
import planRoutes from "./routes/planRoutes";

import { connectDB } from "./config/database";
import { globalErrorHandler } from "./middleware/global";

// Importar modelos explícitamente para asegurar registro en Mongoose
import "@/modules/userManagement/models/EnhancedUser";
import "@/modules/companiesManagement/models/EnhancedCompany";

dotenv.config();

connectDB();

const app = express();
app.use(cors(corsConfig));

// Middleware para parsear JSON
app.use(morgan("dev"));
//
app.use(express.json());

// 🧪 RUTAS DE TESTING JWT (solo en desarrollo)
if (process.env.NODE_ENV !== "production") {
  try {
    const {
      registerTestingRoutes,
    } = require("./scripts/utilities/registerTestingRoutes");
    registerTestingRoutes(app, {
      enabled: true,
      basePath: "/api/testing/auth",
      environment: process.env.NODE_ENV || "development",
      logRequests: true,
    });
    console.log("🧪 Rutas de testing JWT activadas en: /api/testing/auth");

    // Verificar registro de modelos
    const {
      testModelRegistration,
    } = require("./scripts/utilities/testModelRegistration");
    testModelRegistration();
  } catch (error) {
    console.log(
      "⚠️ No se pudieron cargar las rutas de testing:",
      error.message
    );
  }
}

// Routes Privadas Ajustes de la aplicación
app.use("/api/health", healthRoutes); // 🏥 Health check routes
app.use("/api/plans", planRoutes); // 📊 Plan management routes
app.use("/api/settings", settingsRoutes);
app.use("/api/location", locationRoutes);
app.use("/api/services", servicesRoutes);

// Rutas Globales de los Módulos de la aplicación (incluye rutas protegidas)
app.use("/api/", appRoutes);

// Middleware para manejar rutas no definidas
app.use("*", (req, res) => {
  res.status(404).json({ message: "Ruta no encontrada o Inexistente" });
});

// Middleware global de manejo de errores
app.use(globalErrorHandler);

export default app;
