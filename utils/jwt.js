import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import { JWT_SECRET_KEY } from '../constants.js';

dotenv.config();
export const createAccessToken = (user) => {
    try {
        return jwt.sign(
            {
                user_id: user.id,
                email: user.email
            },
            JWT_SECRET_KEY,
            { expiresIn: '15m' }
        );
    } catch (error) {
        console.error('Error al crear el Access Token:', error);
        throw new Error('No se pudo generar el token');
    }
};

export const createRefreshToken = (user) => {
    try {
        return jwt.sign(
            { user_id: user.id },
            JWT_SECRET_KEY,
            { expiresIn: '7d' }
        );
    } catch (error) {
        console.error('Error al crear el Refresh Token:', error);
        throw new Error('No se pudo generar el token');
    }
};

export const hasExpiredToken = (token) => {
    try {
        const { exp } = jwt.decode(token);
        const currentDate = new Date().getTime();
        return exp * 1000 < currentDate;
    } catch (error) {
        return true;
    }
};

export const decoded = (token) => {
    try {
        return jwt.verify(token, JWT_SECRET_KEY);
    } catch (error) {
        console.error('Error al decodificar token:', error);
        return null;
    }
};

/**
 * Verifica si el token es válido.
 * @param {String} token - El token JWT.
 * @returns {Object} - Payload si es válido, error si no.
 */
function verifyToken(token) {
    try {
        return jsonwebtoken.verify(token, JWT_SECRET_KEY);
    } catch (error) {
        console.error("Error al verificar el token:", error);
        return null;
    }
}

export const jwtgenerated = {
    createAccessToken,
    createRefreshToken,
    verifyToken,
    decoded,
    hasExpiredToken,
};