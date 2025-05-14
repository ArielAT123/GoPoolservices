import express from "express";
import bodyParser from "body-parser";
import cors from "cors";
import http from "http";
import morgan from "morgan";
import { initSocketServer } from "./utils/index.js";

import {
  authRoutes,
  userRoutes,
  vehiculoRoutes,
  viajesRoutes,
} from "./routes/index.js";



const app = express();
const server = http.createServer(app);

// Inicializar servidor de sockets
initSocketServer(server);

// Middlewares generales
app.use(cors());
app.use(morgan("dev"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(express.static("uploads"));

// Rutas agrupadas bajo /api
app.use("/api", authRoutes);
app.use("/api/user", userRoutes);
app.use("/api/viajes", viajesRoutes);
app.use("api/vehiculo", vehiculoRoutes)

export { server };