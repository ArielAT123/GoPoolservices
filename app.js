import express from "express";
import cors from "cors";
import morgan from "morgan";
import { authRoutes, userRoutes, travelRoutes, } from "./routes/index.js"; // Asegúrate de importar tus rutas
import serverless from "serverless-http";

const app = express();

// Middlewares mejorados
app.use(cors());
app.use(morgan("dev"));

// Middleware personalizado para parsear el cuerpo de la solicitud
app.use((req, res, next) => {
  if (req.apiGateway && req.apiGateway.event && req.apiGateway.event.body) {
    try {
      req.body = JSON.parse(req.apiGateway.event.body);
    } catch (err) {
      console.error("Error parsing JSON:", err);
      return res.status(400).json({ error: "Invalid JSON" });
    }
  }
  next();
});

// Middleware adicional para asegurar el parseo
app.use(express.json()); // ¡Solo esto es suficiente para parsear JSON!
app.use(express.urlencoded({ extended: true })); // Para formularios

// Configuración de rutas
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
// app.use("/api/viajes", travelRoutes);
app.get('/s', (req, res) => {
  res.send('ESTANNNN PASANDOOO COSASSSSSSS');
});
// Manejador de errores
app.use((err, req, res, next) => {
  console.error("Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export const handler = serverless(app);