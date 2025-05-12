import express from "express";
import { AuthController } from "../controllers/index.js";


const api = express.Router();


// Middleware para registrar las peticiones HTTP
// no vi esto en el codigo lo puse para ver si es necesario
api.use(express.json());


api.post("/auth/register", AuthController.register);
api.get("/hello", AuthController.hello);
api.post("/auth/login", AuthController.login);
api.post("/auth/refresh_access_token", AuthController.refreshAccessToken);
api.post("/auth/register-driver", AuthController.registerDriver);


export const authRoutes = api;
