import express from 'express';
import { vehiculoController } from '../controllers/vehiculo.js';

const api = express.Router();

api.post('/crear', vehiculoController.agregarVehiculo);


export const vehiculoRoutes = api;