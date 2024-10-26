"use strict";
exports.__esModule = true;
var express_1 = require("express");
var dotenv_1 = require("dotenv");
var cors_1 = require("cors");
var morgan_1 = require("morgan");
var cors_2 = require("./config/cors");
var companyRoutes_1 = require("./routes/companyRoutes");
var settingsRoutes_1 = require("./routes/settingsRoutes");
var locationRoutes_1 = require("./routes/locationRoutes");
var database_1 = require("./config/database");
var globalMiddleware_1 = require("./middleware/globalMiddleware");
dotenv_1["default"].config();
database_1.connectDB();
var app = express_1["default"]();
app.use(cors_1["default"](cors_2.corsConfig));
// Middleware para parsear JSON
app.use(morgan_1["default"]('dev'));
//
app.use(express_1["default"].json());
// Routes Ajustes de la aplicación
app.use('/api/settings', settingsRoutes_1["default"]);
app.use('/api/location', locationRoutes_1["default"]);
// Routes Private
app.use('/api/company', companyRoutes_1["default"]);
// Middleware para manejar rutas no definidas
app.use('*', function (req, res) {
    res.status(404).json({ message: 'Ruta no encontrada' });
});
// Middleware global de manejo de errores
app.use(globalMiddleware_1.globalErrorHandler);
exports["default"] = app;
