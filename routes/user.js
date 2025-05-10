import express from 'express';
import { UserController } from '../controllers/user.js';
import { mdAuth } from '../middlewares/authenticated.js';

const api = express.Router();
api.use(express.json());

api.get('/:id', UserController.getUserById);
api.get('/me', [mdAuth.asureAuth], UserController.getProfile);
api.put('/me', [mdAuth.asureAuth], UserController.updateProfile);
api.delete('/me', [mdAuth.asureAuth], UserController.deleteAccount);
api.put('/me/password', [mdAuth.asureAuth], UserController.changePassword);
api.put('/me/username', [mdAuth.asureAuth], UserController.assignUsername);

export const userRoutes = api;
