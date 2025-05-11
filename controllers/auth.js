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

async function registerDriver(req, res) {
  try {
    const { email, password, fotoDriver, fotoLicencia, numeroLicencia } = req.body;

    // 1. Validar campos requeridos
    if (!email || !password) {
      return res.status(400).json({ 
        error: { message: 'Email y contraseña son requeridos para verificar la cuenta' } 
      });
    }

    if (!fotoDriver || !fotoLicencia || !numeroLicencia) {
      return res.status(400).json({ 
        error: { 
          message: 'Datos de conductor incompletos',
          required: ['fotoDriver', 'fotoLicencia', 'numeroLicencia']
        } 
      });
    }

    // 2. Verificar credenciales (autenticar al usuario primero)
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      return res.status(401).json({
        error: { 
          message: 'Credenciales inválidas o cuenta no existente',
          details: authError.message 
        }
      });
    }

    const userId = authData.user.id;

    // 3. Verificar si ya existe registro en dhvar
    const { data: existingDriver, error: driverError } = await supabase
      .from('dhvar')
      .select('id')
      .eq('id', userId)
      .maybeSingle();

    if (existingDriver) {
      return res.status(409).json({ 
        error: { message: 'Este usuario ya completó su registro como conductor' } 
      });
    }

    // 4. Insertar datos del conductor
    const { data: driverData, error: insertError } = await supabase
      .from('dhvar')
      .insert({
        id: userId,
        fotoDriver,
        fotoLicencia,
        numeroLicencia
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(insertError.message);
    }

    // 5. Actualizar rol en tabla users (opcional)
    await supabaseAdmin
      .from('users')
      .update({ rol: 'conductor' })
      .eq('id', userId);

    // 6. Respuesta exitosa
    return res.status(201).json({
      message: 'Registro de conductor completado exitosamente',
      driver: driverData,
      user: {
        id: userId,
        email: authData.user.email,
        rol: 'conductor'
      }
    });

  } catch (error) {
    console.error('Error en registerDriver:', error);
    return res.status(500).json({ 
      error: { 
        message: 'Error al completar registro de conductor',
        details: process.env.NODE_ENV === 'development' ? error.message : null
      } 
    });
  }
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
       // emailRedirectTo: `${process.env.FRONTEND_URL}/auth/confirm` // URL para confirmación de email
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
    
    // 1. Iniciar sesión
    const { data, error } = await supabase.auth.signInWithPassword({ 
      email, 
      password 
    });

    // 2. Si hay error, verificar si es por correo no verificado
    if (error) {
      // Caso específico: credenciales correctas pero email no verificado
      if (error.message.includes("Email not confirmed")) {
        return res.status(400).json({ 
          msg: "Por favor, verifica tu correo electrónico antes de iniciar sesión.",
          error: "EMAIL_NOT_VERIFIED"
        });
      }

      // Otros errores (credenciales incorrectas, etc.)
      return res.status(400).json({ 
        msg: "Credenciales incorrectas",
        error: error.message 
      });
    }

    // 3. Verificar manualmente si el email está confirmado (por si acaso)
    const user = data.user;
    if (!user.email_confirmed_at || !user.user_metadata?.email_verified) {
      return res.status(400).json({
        msg: "El correo electrónico no ha sido verificado.",
        error: "EMAIL_NOT_VERIFIED"
      });
    }

    // 4. Si todo está bien, devolver tokens
    return res.status(200).json({
      access_token: data.session.access_token,
      refresh_token: data.session.refresh_token,
      user: {
        id: user.id,
        email: user.email,
        email_verified: user.email_confirmed || user.user_metadata?.email_verified
      }
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
  registerDriver,
};