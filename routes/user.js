import express from 'express';
import { UserController } from '../controllers/user.js';
import { mdAuth } from '../middlewares/authenticated.js';
//import multer from 'multer';

const api = express.Router();
//const upload = multer({ storage: multer.memoryStorage() });
api.use(express.json());

// Rutas protegidas (requieren autenticación)
api.get("/me", [mdAuth.asureAuth], UserController.getProfile);
api.put('/me', [mdAuth.asureAuth], UserController.updateProfile);
api.delete('/me', [mdAuth.asureAuth], UserController.deleteAccount);
api.put('/me/password', [mdAuth.asureAuth], UserController.changePassword);
api.put('/me/username', [mdAuth.asureAuth], UserController.assignUsername);
//router.post('/me/avatar', [mdAuth.asureAuth], upload.single('avatar'), UserController.uploadAvatar);
//api.post('/logout', [mdAuth.asureAuth], UserController.logout);

export const userRoutes = api;
