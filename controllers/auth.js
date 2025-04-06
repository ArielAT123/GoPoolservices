import bcryptjs from "bcryptjs";
import { User } from "../models/index.js";
import { jwtgenerated } from "../utils/index.js";
import  supabase  from "../supaBaseCliente.js";



async function register(req, res) {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(400).json({ error: 'Todos los campos son obligatorios' });
        }

        // Validar formato de email
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return res.status(400).json({ error: 'Correo electrónico inválido' });
        }

        // Verificar si el usuario ya existe en Auth
        const { error: authError } = await supabase.auth.signInWithPassword({
            email,
            password: 'randomFakePassword123' // Usamos un password falso para validar existencia
        });
        console.log(authError)
        if (authError) {
            return res.status(409).json({ error: 'El usuario ya está registrado' });
        }

        if (authError?.message !== "Invalid login credentials") {
            return res.status(500).json({ error: 'Error al verificar usuario', details: authError.message });
        }

        // Registrar usuario en Supabase Auth
        const { data, error } = await supabase.auth.signUp({ email, password });

        if (error) {
            return res.status(500).json({ error: 'Error al registrar el usuario', details: error.message });
        }

        return res.status(201).json({ message: 'Usuario registrado exitosamente', userId: data.user.id });

    } catch (error) {
        console.error("Error en register:", error);
        return res.status(500).json({ msg: "Error interno del servidor", error: error.message });
    }
}

async function login(req, res) {
    try {

        const { email, password } = req.body;
        // valida que el email y la contraseña 
        const {error , data } = await supabase.auth.signInWithPassword({email, password});
        console.log('data', data)
        if (!error) {
            return res.status(200).json({
                access_token: data.session.access_token,
                refresh_token: data.session.refresh_token,
            });
        } else {
            return res.status(400).send({ msg: "Error al iniciar sesión credenciales incorrectas" });
        }
    } catch (error) {
        console.error("Error en login:", error);
        return res.status(500).send({ 
            msg: "Error del servidor",
            error: error.message 
        });
    }
}

async function refreshAccessToken(req, res) {
    try {
        const { refreshToken } = req.body;
        const { data, error } = await supabase.auth.refreshSession({ 
            refresh_token: refreshToken,
        }); // renueva el token de acceso usando el token de refressh
        if (error) throw new Error('Error al refrescar el token');
        return res.send({
            accessToken: data.session?.access_token,
            refreshToken: data.session?.refresh_token,
        });
    } catch (error) {
        console.error("Error en refreshAccessToken:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

export const AuthController = {
    register,
    login,
    refreshAccessToken,
};