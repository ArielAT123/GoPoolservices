import { User } from "../models/index.js";
import bcrypt from "bcryptjs";
import supabase from "../supaBaseCliente.js";

async function getProfile(req, res) {
    const { user_id } = req.user;
    try {
        // Usamos el modelo User con selección de columnas
        const user = await auth.user.findById(user_id, 'id, email, firstname, lastname, avatar, username, created_at');
        
        if (!user) {
            return res.status(400).send({ msg: "No se ha encontrado el usuario" });
        }
        return res.status(200).send(user);
    } catch (error) {
        console.error("Error en getMe:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function getUsers(req, res) {
    try {
        const { user_id } = req.user;
        const users = await User.find({ _id: { $ne: user_id } }).select(["-password"]);

        if (!users || users.length === 0) {
            return res.status(400).send({ msg: "No se han encontrado usuarios" });
        }

        return res.status(200).send(users);
    } catch (error) {
        console.error("Error en getUsers:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}

async function getUser(req, res) {
    const { id } = req.params;

    try {
        const response = await User.findById(id).select(["-password"]);

        if (!response) {
            return res.status(400).send({ msg: "No se ha encontrado el usuario" });
        }

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error en getUser:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}



async function getUsersExeptParticipantsGroup(req, res) {
    try {
        const { group_id } = req.params;

        console.log(req);

        const group = await Group.findById(group_id);
        if (!group) {
            return res.status(404).send({ msg: "Grupo no encontrado" });
        }

        const participants = group.participants.map(participant => participant.toString());

        const response = await User.find({ _id: { $nin: participants } }).select(["-password"]);

        if (!response || response.length === 0) {
            return res.status(400).send({ msg: "No se ha encontrado ningún usuario" });
        }

        return res.status(200).send(response);
    } catch (error) {
        console.error("Error en getUsersExeptParticipantsGroup:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}
async function assignUsername(req, res) {
    try {
        const { user_id } = req.user; // Assuming the authenticated user's ID comes from req.user
        const { username } = req.body;

        // Validate username is provided
        if (!username) {
            return res.status(400).send({ msg: "El username es requerido" });
        }

        // Check if username is already taken
        const existingUser = await User.findOne({ username });
        if (existingUser && existingUser._id.toString() !== user_id) {
            return res.status(400).send({ msg: "El username ya está en uso" });
        }

        // Update the user with the new username
        const response = await User.findByIdAndUpdate(
            user_id,
            { username },
            { new: true }
        ).select(["-password"]);

        if (!response) {
            return res.status(400).send({ msg: "No se pudo asignar el username" });
        }

        return res.status(200).send({
            msg: "Username asignado exitosamente",
            user: response
        });
    } catch (error) {
        console.error("Error en assignUsername:", error);
        return res.status(500).send({ msg: "Error del servidor", error });
    }
}
async function updateProfile(req, res) {
    try {
        const { firstname, lastname, username } = req.body;
        const updates = { firstname, lastname, username };
  
        const updatedUser = await User.update(req.user.user_id, updates);
        const { password, ...safeUser } = updatedUser;
  
        res.status(200).send({ 
          msg: 'Perfil actualizado correctamente',
          user: safeUser
        });
      } catch (error) {
        res.status(500).send({ msg: 'Error al actualizar perfil', error: error.message });
    }
}

async function deleteAccount(req, res) {
    try {
      await User.delete(req.user.user_id);
      
      // Invalida todos los tokens (opcional)
      // Implementación depende de tu sistema de tokens
      
      res.status(200).send({ msg: 'Cuenta eliminada correctamente' });
    } catch (error) {
      res.status(500).send({ msg: 'Error al eliminar cuenta', error: error.message });
    }
}
async function changePassword(req, res) {
    try {
        const { currentPassword, newPassword } = req.body;
        const userId = req.user.user_id;
        
        // 1. Obtener usuario actual con el password
        const { data: user, error: userError } = await supabase
            .from('users')
            .select('password')
            .eq('id', userId)
            .single();

        if (userError || !user) {
            return res.status(404).send({ msg: 'Usuario no encontrado' });
        }

        // 2. Verificar contraseña actual
        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) {
            return res.status(400).send({ msg: 'Contraseña actual incorrecta' });
        }

        // 3. Hashear nueva contraseña
        const salt = await bcrypt.genSalt(10);
        const newPasswordHash = await bcrypt.hash(newPassword, salt);

        // 4. Actualizar contraseña en Supabase
        const { error: updateError } = await supabase
            .from('users')
            .update({ password: newPasswordHash })
            .eq('id', userId);

        if (updateError) {
            throw updateError;
        }

        return res.status(200).send({ msg: 'Contraseña actualizada correctamente' });
    } catch (error) {
        console.error('Error en changePassword:', error);
        return res.status(500).send({ 
            msg: 'Error al cambiar contraseña', 
            error: error.message 
        });
    }
}
async function logout(req, res) {
    
    
}

export const UserController = {
    getProfile,
    getUsers,
    getUser,
    getUsersExeptParticipantsGroup,
    assignUsername,
    deleteAccount,
    changePassword,
    updateProfile
};