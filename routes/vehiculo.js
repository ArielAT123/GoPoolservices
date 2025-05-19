import express from 'express';
import { vehiculoController } from '../controllers/vehiculo.js';

const api = express.Router();

api.post('/crear', vehiculoController.agregarVehiculo);
api.get('/listar/:id_driver', vehiculoController.obtenerVehiculos);

export const vehiculoRoutes = api;