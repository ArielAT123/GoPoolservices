import { supabase, supabaseAdmin } from "../supaBaseCliente.js";
import { User } from "../models/User.js";

// Validar formato de email
function isValidEmail(email) {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
}

// Validar contraseña (mínimo 6 caracteres, ejemplo mejorado)
function isValidPassword(password) {
  return password.length >= 6 && /[A-Za-z]/.test(password) && /[0-9]/.test(password);
}

function isUserExist(email) {
  return User.existsByEmail(supabase, email); // Devuelve la Promise
}

async function register(req, res) {
  try {
    const { email, password } = req.body;

    // Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email y contraseña son requeridos' } 
      });
    }

    // Validar formato de email
    if (!isValidEmail(email)) {
      return res.status(400).json({ 
        error: { message: 'Por favor ingresa un email válido' } 
      });
    }

    // Validar contraseña
    if (!isValidPassword(password)) {
      return res.status(400).json({ 
        error: { 
          message: 'La contraseña debe tener al menos 6 caracteres, incluyendo letras y números' 
        } 
      });
    }

    // Verificar si el email existe en la tabla users (esperamos la Promise)
    const userExists = await isUserExist(email);
    console.log("ESTA registrado?", userExists); // Ahora mostrará true o false
    if (userExists) {
      return res.status(409).json({ 
        error: { message: 'El email ya está registrado en la tabla users' } 
      });
    }

    // Registrar usuario en Supabase Auth
    const { data, error: authError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${process.env.FRONTEND_URL}/auth/confirm` // URL para confirmación de email
      }
    });

    if (authError) {
      // Manejar el caso de email ya registrado en auth.users
      if (authError.message.includes('User already registered')) {
        return res.status(409).json({ 
          error: { message: 'El email ya está registrado en el sistema' } 
        });
      }
      return res.status(400).json({ 
        error: { 
          message: 'Error al registrar usuario',
          details: authError.message 
        } 
      });
    }

    // Sincronizar con la tabla users usando supabaseAdmin
    if (data.user) {
      await supabaseAdmin.from('users').insert({
        id: data.user.id,
        email: data.user.email,
        nombre: '', // Valores por defecto (ajusta según tus necesidades)
        username: '',
        lastname: '',
        nummatricula: '',
        fechanacimiento: null,
        fotommatricula: '',
      }).select();
    }

    // Respuesta exitosa
    return res.status(201).json({
      user: data.user,
      session: data.session ? {
        access_token: data.session.access_token,
        refresh_token: data.session.refresh_token,
        expires_at: data.session.expires_at
      } : null,
      email_confirmed: data.user?.email_confirmed_at !== null
    });

  } catch (error) {
    console.error('Error en el registro:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Error interno del servidor',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      } 
    });
  }
}

async function login(req, res) {
  try {
    const { email, password } = req.body;
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    if (error) {
      console.log(data, error);
      return res.status(400).json({ msg: "Error al iniciar sesión: credenciales incorrectas" });
    }

    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
    });

  } catch (error) {
    console.error("Error en login:", error);
    return res.status(500).json({
      msg: "Error del servidor",
      error: error.message
    });
  }
}

async function refreshAccessToken(req, res) {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ msg: "refreshToken es requerido" });
    }

    const { data, error } = await supabase.auth.refreshSession({
      refresh_token: refreshToken,
    });

    if (error) {
      throw new Error('Error al refrescar el token');
    }

    return res.status(200).json({
      accessToken: data.session?.access_token,
      refreshToken: data.session?.refresh_token,
    });

  } catch (error) {
    console.error("Error en refreshAccessToken:", error);
    return res.status(500).json({ 
      msg: "Error del servidor", 
      error: error.message 
    });
  }
}

export const AuthController = {
  register,
  login,
  refreshAccessToken,
};