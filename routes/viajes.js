import express from 'express';
import { createTravel } from '../controllers/viajes.js';
import { mdAuth } from '../middlewares/authenticated.js';

const api = express.Router();

// Route to create a new trip
api.post('/crear-viaje', [mdAuth.asureAuth], createTravel);

export const travelRoutes = api;