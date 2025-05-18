import { supabase, supabaseAdmin } from "../supaBaseCliente.js";
import { User } from "../models/User.js";

// Validar formato de email
function isValidEmail(email) {
    // Validación general de formato de email
    const generalEmailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    
    // Validación específica para dominio ESPOL
    const espolRegex = /^[^\s@]+@espol\.edu\.ec$/;
    
    return generalEmailRegex.test(email) && espolRegex.test(email);
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
        const { email, password, fotodriver, fotolicencia, numeroLicencia } = req.body;

        // 1. Validación de campos requeridos
        const requiredFields = ['email', 'password', 'fotoDriver', 'fotoLicencia', 'numeroLicencia'];
        const missingFields = requiredFields.filter(field => !req.body[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: { 
                    message: 'Campos requeridos faltantes',
                    missing_fields: missingFields 
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
                    message: authError.message.includes('Invalid login credentials') ? 
                        'Credenciales inválidas' : 'Error al verificar la cuenta',
                    details: process.env.NODE_ENV === 'development' ? authError.message : null
                }
            });
        }

        const userId = authData.user.id;

        // 3. Verificar si ya existe registro en la tabla driver
        const { data: existingDriver, error: driverError } = await supabase
            .from('driver')
            .select('id')
            .eq('id', userId)
            .maybeSingle();

        if (driverError) {
            throw new Error(`Error al verificar conductor existente: ${driverError.message}`);
        }

        if (existingDriver) {
            return res.status(409).json({ 
                error: { 
                    message: existingDriver.verificado ? 
                        'Ya eres un conductor verificado' : 
                        'Ya tienes un registro de conductor pendiente de verificación'
                } 
            });
        }

        // 4. Validar formato del número de licencia
        if (!/^[A-Za-z0-9]{8,20}$/.test(numeroLicencia)) {
            return res.status(400).json({
                error: {
                    message: 'El número de licencia debe tener entre 8 y 20 caracteres alfanuméricos'
                }
            });
        }

        // 5. Validar fecha de nacimiento
        //const fechaNac = new Date(fechanacimiento);
        const edadMinima = 28;
        //edadMinima.setFullYear(edadMinima.getFullYear() - 18); // Mínimo 18 años

        if (edadMinima<18) {
            return res.status(400).json({
                error: {
                    message: 'Debes tener al menos 18 años para registrarte como conductor'
                }
            });
        }

        // 6. Insertar datos del conductor
        const { data: driverData, error: insertError } = await supabase
            .from('driver')
            .insert({
                id: userId,
                fotodriver,
                fotolicencia,
                numeroLicencia,
            })
            .select('id, numeroLicencia')
            .single();

        if (insertError) {
            throw new Error(`Error al insertar conductor: ${insertError.message}`);
        }
        //. Respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Registro de conductor completado. Pendiente de verificación.',
            driver: {
                id: driverData.id,
                numeroLicencia: driverData.numeroLicencia,
            },
            user: {
                id: userId,
                email: authData.user.email,
                rol: 'conductor_pendiente'
            }
        });

    } catch (error) {
        console.error('Error en registerDriver:', error);
        return res.status(500).json({ 
            error: { 
                message: 'Error al procesar el registro de conductor',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            } 
        });
    }
}
async function register(req, res) {
    try {
        const { email, password, metadata } = req.body;

        // 1. Validación básica de campos
        if (!email || !password) {
            return res.status(400).json({ 
                error: { message: 'Email y contraseña son requeridos' } 
            });
        }

        // 2. Validar formato de email
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                error: { message: 'Por favor ingresa un email válido' } 
            });
        }

        // 3. Validar fortaleza de contraseña
        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                error: { 
                    message: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas y números' 
                } 
            });
        }

        // 4. Validar metadata
        if (!metadata || typeof metadata !== 'object') {
            return res.status(400).json({ 
                error: { message: 'Se requiere metadata válida para el registro' } 
            });
        }

        // 5. Validar campos obligatorios en metadata
        const requiredMetadataFields = ['nombre', 'usuario', 'lastname', 'nummatricula'];
        const missingFields = requiredMetadataFields.filter(field => !metadata[field]);

        if (missingFields.length > 0) {
            return res.status(400).json({ 
                error: { 
                    message: 'Faltan campos obligatorios en metadata',
                    missing_fields: missingFields 
                } 
            });
        }

        // 6. Verificar si el usuario ya existe
        const userExists = await isUserExist(email);
        if (userExists) {
            return res.status(409).json({ 
                error: { message: 'El usuario ya está registrado' } 
            });
        }

        // 7. Registrar usuario en Supabase Auth
        const { data, error: authError } = await supabase.auth.signUp({
            email,
            password,
            options: {
                data: { // Metadata que se guardará en auth.users
                    nombre: metadata.nombre,
                    usuario: metadata.usuario,
                    lastname: metadata.lastname
                }
            }
        });

        if (authError) {
            console.error('Error en auth:', authError);
            return res.status(400).json({ 
                error: { 
                    message: authError.message.includes('User already registered') ? 
                        'El email ya está registrado' : 'Error en el registro',
                    details: process.env.NODE_ENV === 'development' ? authError.message : null
                } 
            });
        }

        // 8. Insertar en la tabla users
        const userData = {
            nombre: metadata.nombre,
            username: metadata.usuario,
            lastname: metadata.lastname,
            nummatricula: metadata.nummatricula,
            fechanacimiento: metadata.fechanacimiento || null,
            fotomatricula: metadata.fotomatricula || null,
            //created_at: new Date().toISOString()
        };

        console.log("ID DEL USUARIO:", data.user.id);   
        const { error: dbError } = await supabase
            .from('users')
            .update({
            nombre: metadata.nombre,
            username: metadata.usuario,
            lastname: metadata.lastname,
            nummatricula: metadata.nummatricula,
            fechanacimiento: metadata.fechanacimiento || null,
            fotomatricula: metadata.fotomatricula || null, 
            })
            .eq('id', data.user.id);
        console.log("ID DEL USUARIO:", data.user.id);   

        if (dbError) {
            console.error('Error al insertar en users:', dbError);
            
            // Opcional: Revertir el registro en auth si falla la inserción     
            await supabase.auth.admin.deleteUser(data.user.id);
            
            return res.status(500).json({ 
                error: { 
                    message: 'Error al crear el perfil de usuario',
                    details: process.env.NODE_ENV === 'development' ? dbError.message : null
                } 
            });
        }

        // 9. Respuesta exitosa
        return res.status(201).json({
            success: true,
            user: {
                id: data.user.id,
                email: data.user.email,
                ...userData
            },
            session: data.session ? {
                access_token: data.session.access_token,
                expires_at: data.session.expires_at
            } : null
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
        email_verified: user.email_confirmed_at || user.user_metadata?.email_verified
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

async function registerDriverCompleteForm(req, res) {
    try {
        const { email, password, metadata } = req.body;

        // 1. Validación básica de campos
        if (!email || !password) {
            return res.status(400).json({ 
                error: { message: 'Email y contraseña son requeridos' } 
            });
        }

        // 2. Validar formato de email
        if (!isValidEmail(email)) {
            return res.status(400).json({ 
                error: { message: 'Por favor ingresa un email válido' } 
            });
        }

        // 3. Validar fortaleza de contraseña
        if (!isValidPassword(password)) {
            return res.status(400).json({ 
                error: { 
                    message: 'La contraseña debe tener al menos 8 caracteres, incluyendo letras mayúsculas, minúsculas y números' 
                } 
            });
        }

        // 4. Validar metadata y campos requeridos
        if (!metadata || typeof metadata !== 'object') {
            return res.status(400).json({ 
                error: { message: 'Se requiere metadata válida para el registro' } 
            });
        }

        // Campos requeridos para usuario
        const requiredUserFields = ['nombre', 'usuario', 'lastname', 'nummatricula','fechanacimiento', 'fotomatricula'];
        // Campos requeridos para conductor
        const requiredDriverFields = ['fotodriver', 'fotolicencia', 'numeroLicencia' ];
        
        const missingUserFields = requiredUserFields.filter(field => !metadata[field]);
        const missingDriverFields = requiredDriverFields.filter(field => !metadata[field]);

        if (missingUserFields.length > 0 || missingDriverFields.length > 0) {
            return res.status(400).json({ 
                error: { 
                    message: 'Faltan campos obligatorios',
                    missing_user_fields: missingUserFields,
                    missing_driver_fields: missingDriverFields
                } 
            });
        }

        // 5. Validar formato del número de licencia
        if (!/^[A-Za-z0-9]{8,20}$/.test(metadata.numeroLicencia)) {
            return res.status(400).json({
                error: {
                    message: 'El número de licencia debe tener entre 8 y 20 caracteres alfanuméricos'
                }
            });
        }

        // 6. Validar fecha de nacimiento (mínimo 18 años)
        const fechaNac = new Date(metadata.fechanacimiento);
        const edadMinima = new Date();
        edadMinima.setFullYear(edadMinima.getFullYear() - 18);

        if (fechaNac > edadMinima) {
            return res.status(400).json({
                error: {
                    message: 'Debes tener al menos 18 años para registrarte como conductor'
                }
            });
        }

        // 7. Verificar si el usuario ya existe
        const userExists = await isUserExist(email);
        if (userExists) {
            return res.status(409).json({ 
                error: { message: 'El usuario ya está registrado' } 
            });
        }

        // 8. Registrar usuario en Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signUp({
            email,
            password            
        });

        if (authError) {
            console.error('Error en auth:', authError);
            return res.status(400).json({ 
                error: { 
                    message: authError.message.includes('User already registered') ? 
                        'El email ya está registrado' : 'Error en el registro',
                    details: process.env.NODE_ENV === 'development' ? authError.message : null
                } 
            });
        }

        const userId = authData.user.id;

        // 9. Insertar en la tabla users (pública)
        const userData = {
            email: authData.user.email,
            nombre: metadata.nombre,
            username: metadata.usuario,
            lastname: metadata.lastname,
            nummatricula: metadata.nummatricula,
            fechanacimiento: metadata.fechanacimiento || null,
            fotomatricula: metadata.fotomatricula || null,
        };

        const { error: userInsertError } = await supabase
            .from('users')
            .update(userData).eq('id', userId);

        if (userInsertError) {
            console.error('Error al insertar en users:', userInsertError);
            // Revertir el registro en auth si falla
            await supabase.auth.admin.deleteUser(userId);
            return res.status(500).json({ 
                error: { 
                    message: 'Error al crear el perfil de usuario',
                    details: process.env.NODE_ENV === 'development' ? userInsertError.message : null
                } 
            });
        }

        // 10. Insertar en la tabla driver
        const driverData = {
            id: userId,
            fotoDriver: metadata.fotoDriver,
            fotoLicencia: metadata.fotoLicencia,
            numeroLicencia: metadata.numeroLicencia,
        };

        const { error: driverInsertError } = await supabaseAdmin
            .from('driver')
            .insert(driverData);

        if (driverInsertError) {
            console.error('Error al insertar en driver:', driverInsertError);
            // Revertir: eliminar de users y auth
            await supabaseAdmin.from('users').delete().eq('id', userId);
            await supabase.auth.admin.deleteUser(userId);
            return res.status(500).json({ 
                error: { 
                    message: 'Error al crear el perfil de conductor',
                    details: process.env.NODE_ENV === 'development' ? driverInsertError.message : null
                } 
            });
        }

        // 11. Respuesta exitosa
        return res.status(201).json({
            success: true,
            message: 'Registro de conductor completado. Pendiente de verificación.',
            user: {
                id: userId,
                email: authData.user.email,
                nombre: userData.nombre,
                username: userData.username,
            },
            driver: {
                numeroLicencia: driverData.numeroLicencia,
                fechaRegistro: driverData.fecha_registro
            },
            session: authData.session ? {
                access_token: authData.session.access_token,
                expires_at: authData.session.expires_at
            } : null
        });

    } catch (error) {
        console.error('Error en registerDriverCompleteForm:', error);
        return res.status(500).json({ 
            error: { 
                message: 'Error interno del servidor',
                details: process.env.NODE_ENV === 'development' ? error.message : null
            } 
        });
    }
}

function hello(req, res) {
    return res.status(200).json({ msg: "hola guapo" });
}

export const AuthController = {
register,
login,
refreshAccessToken,
registerDriver,
hello,
registerDriverCompleteForm,
};