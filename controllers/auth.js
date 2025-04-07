import bcryptjs from "bcryptjs";
 import { User } from "../models/index.js";
 import { jwtgenerated } from "../utils/index.js";
 import  supabase  from "../supaBaseCliente.js";
 async function register(req, res) {
     try {
         const { email, password } = req.body;
 
         // Verificar si el usuario ya existe
         const { data: existingUser, error: lookupError } = await supabase
             .from('users')
             .select('*')
             .eq('email', email.toLowerCase())
             .single();  // Asegura que solo esperamos un resultado
         if (existingUser) {
             return res.status(400).send({ msg: "El usuario ya está registrado" });
         }
 
         // Hashear la contraseña
         const salt = bcryptjs.genSaltSync(10);
         const passwordHash = bcryptjs.hashSync(password, salt);
 
         // Crear nuevo usuario
         const { data: newUser, error: insertError } = await supabase
             .from('users')
             .insert([
                 { 
                     email: email.toLowerCase(), 
                     password: passwordHash,
                     username: email.split('@')[0] // Opcional: crea username del email
                 }
             ])
             .select()  // Esto es crucial para devolver el registro insertado
             .single();
 
         if (insertError) {
             throw insertError;
         }
 
         return res.status(201).send({
             msg: "Usuario registrado exitosamente",
             user: {
                 id: newUser.id,
                 email: newUser.email,
                 created_at: newUser.created_at
                 // Excluir datos sensibles como password
             }
         });
     } catch (error) {
         console.error("Error en register:", error);
         return res.status(500).send({ 
             msg: "Error al registrar el usuario",
             error: error.message 
         });
     }
 }
 
 async function login(req, res) {
     try {
         const { email, password } = req.body;
 
         // Buscar usuario en Supabase
         const { data: user, error: userError } = await supabase
             .from('users')
             .select('*')
             .eq('email', email.toLowerCase())
             .single();
 
         if (userError || !user) {
             return res.status(400).send({ msg: "Usuario no encontrado" });
         }
 
         // Verificar contraseña
         const passwordMatch = await bcryptjs.compare(password, user.password);
         if (!passwordMatch) {
             return res.status(400).send({ msg: "Contraseña incorrecta" });
         }
 
         // Generar tokens
         try {
             const accessToken = jwtgenerated.createAccessToken(user);
             const refreshToken = jwtgenerated.createRefreshToken(user);
 
             return res.status(200).send({
                 access: accessToken,
                 refresh: refreshToken,
             });
         } catch (tokenError) {
             console.error("Error generando tokens:", tokenError);
             return res.status(500).send({ msg: "Error al generar tokens de acceso" });
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
 
         if (!refreshToken) {
             return res.status(400).send({ msg: "Token requerido" });
         }
 
         const hasExpired = jwtgenerated.hasExpiredToken(refreshToken);
         if (hasExpired) {
             return res.status(400).send({ msg: "Token expirado" });
         }
 
         const { user_id } = jwtgenerated.decoded(refreshToken);
         const userStorage = await User.findById(user_id);
 
         if (!userStorage) {
             return res.status(404).send({ msg: "Usuario no encontrado" });
         }
 
         return res.status(200).send({
             accessToken: jwtgenerated.createAccessToken(userStorage),
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