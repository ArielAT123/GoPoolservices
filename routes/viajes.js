import express from 'express';
import { ViajeController } from '../controllers/viajes.js';

const api = express.Router();

api.post('/crear', ViajeController.crearViaje);
api.post('/unirse', ViajeController.unirseAViaje);
api.get('/cupos/:id_viaje', ViajeController.obtenerCuposDisponibles);

export const viajesRoutes = api;