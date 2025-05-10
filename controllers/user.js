import supabase from '../supaBaseCliente.js';
import { User } from '../models/User.js';
import bcrypt from 'bcryptjs';

async function getUserById(req, res) {
    const { id } = req.params;
    try {
        const user = await User.findById(supabase, id);
        return res.status(200).json(user);
    } catch (error) {
        return res.status(404).json({ msg: error.message });
    }
}

async function getProfile(req, res) {
    try {
        const userId = req.user.user_id;
        const user = await User.findById(supabase, userId);
        return res.status(200).json(user);
    } catch (error) {
        return res.status(500).json({ msg: "No se pudo obtener el perfil", error: error.message });
    }
}

async function updateProfile(req, res) {
    try {
      const id = req.user.user_id;
      const profileData = req.body;
  
      // 1. Validar datos mínimos requeridos
      if (!profileData || Object.keys(profileData).length === 0) {
        return res.status(400).json({
          msg: "Datos del perfil requeridos",
          required_fields: ["username", "firtname", "lastname"] // Ajusta según tu esquema
        });
      }
      
      // 2. Actualizar en Supabase
      const { data, error } = await supabase
        .from('profiles') // Ajusta el nombre de tu tabla
        .update(profileData)
        .eq('id', id) // Asegúrate que 'id' coincide con tu columna
        .select(); // Para obtener el registro actualizado
      
      if (error) {
        console.error('Error de Supabase:', error);
        throw new Error(error.message);
      }
  
      if (!data || data.length === 0) {
        return res.status(404).json({ msg: "Perfil no encontrado" });
      }
      
      return res.status(200).json({
        msg: "Perfil actualizado correctamente",
        profile: data[0]
      });
      
    } catch (error) {
      console.error("Error completo:", error);
      return res.status(500).json({
        msg: "Error al actualizar el perfil",
        error: error.message,
        details: error.details || null // Supabase a veces provee detalles adicionales
      });
    }
}

async function deleteAccount(req, res) {
    const userId = req.user.user_id;
    try {
        await User.delete(supabase, userId);
        return res.status(200).json({ msg: 'Cuenta eliminada correctamente' });
    } catch (error) {
        return res.status(500).json({ msg: "Error al eliminar cuenta", error: error.message });
    }
}

async function changePassword(req, res) {
    const userId = req.user.user_id;
    const { currentPassword, newPassword } = req.body;
    try {
        const user = await User.findById(supabase, userId);

        const isMatch = await bcrypt.compare(currentPassword, user.password);
        if (!isMatch) return res.status(400).json({ msg: 'Contraseña actual incorrecta' });

        const hashedPassword = await bcrypt.hash(newPassword, 10);
        await User.update(supabase, userId, { password: hashedPassword });

        return res.status(200).json({ msg: 'Contraseña actualizada correctamente' });
    } catch (error) {
        return res.status(500).json({ msg: 'Error al cambiar contraseña', error: error.message });
    }
}

async function assignUsername(req, res) {
    const userId = req.user.user_id;
    const { username } = req.body;
    try {
        const updated = await User.update(supabase, userId, { username });
        return res.status(200).json(updated);
    } catch (error) {
        return res.status(500).json({ msg: 'Error al asignar username', error: error.message });
    }
}

export const UserController = {
    getUserById,
    getProfile,
    updateProfile,
    deleteAccount,
    changePassword,
    assignUsername,
};