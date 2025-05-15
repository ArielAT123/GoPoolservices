import express from 'express';
import { ViajeController } from '../controllers/viajes.js';

const api = express.Router();

api.post('/crear', ViajeController.crearViaje);
api.post('/unirse', ViajeController.unirseAViaje);
api.get('/cupos/:id_viaje', ViajeController.obtenerCuposDisponibles);
api.delete("/salir/viaje/:id_viaje", ViajeController.cancelarViaje);
api.get("/pasajeros/lista/:id_viaje", ViajeController.obtenerPasajerosList);


export const viajesRoutes = api;