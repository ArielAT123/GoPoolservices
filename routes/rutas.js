import express from "express";
import { RutasController } from "../controllers/ruta.js";
const api = express.Router();

// Obtener todos los puntos de ruta
api.get('/:idRuta/puntos', RutasController.obtenerPuntosRuta);

// Agregar un nuevo punto de ruta
api.post('/:idRuta/puntos', RutasController.agregarPuntoRuta);

// Eliminar un punto de ruta
api.delete('/puntos/:idPunto', RutasController.eliminarPuntoRuta);

export const rutasRoutes = api;
