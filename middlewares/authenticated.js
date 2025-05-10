import { supabase } from "../supaBaseCliente.js";

async function asureAuth(req, res, next) {
    // 1. Verificar cabecera de autorización
    if (!req.headers.authorization) {
        return res.status(403).send({ 
            msg: "La petición no tiene cabecera de autenticación" 
        });
    }

    // 2. Extraer el token
    const token = req.headers.authorization.replace("Bearer ", "").trim();
    if (!token) {
        return res.status(403).send({ msg: "Formato de token inválido" });
    }

    try {
        // 3. Verificar el token con Supabase
        const { data: { user }, error } = await supabase.auth.getUser(token);
        
        if (error) {
            return res.status(401).send({ 
                msg: "Token inválido o expirado",
                error: error.message // Solo para desarrollo
            });
        }

        if (!user) {
            return res.status(401).send({ msg: "Usuario no encontrado" });
        }

        // 4. Adjuntar usuario al request
        req.user = {
            user_id: user.id,
            email: user.email,
            // Otros campos disponibles en user
            ...user
        };

        next();
    } catch (error) {
        console.error("Error en autenticación:", error);
        return res.status(500).send({ 
            msg: "Error en la verificación del token",
            error: error.message // Solo para desarrollo
        });
    }
}

export const mdAuth = {
    asureAuth,
};