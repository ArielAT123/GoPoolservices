import { supabase } from "../supaBaseCliente.js"; // Ajusta la ruta según tu estructura

// Clase para manejar operaciones con la tabla users
export class User {
    // Buscar un usuario por email
    static async findOne({ email }) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("email", email)
            .single(); // Devuelve un solo registro

        if (error) {
            console.error("Error en findOne:", error);
            throw error;
        }

        return data;
    }

    // Buscar un usuario por ID
    static async findById(id) {
        const { data, error } = await supabase
            .from("users")
            .select("*")
            .eq("id", id)
            .single();

        if (error) {
            console.error("Error en findById:", error);
            throw error;
        }

        return data;
    }

    // Crear un nuevo usuario
    static async create(userData) {
        const { data, error } = await supabase
            .from("users")
            .insert([userData])
            .select()
            .single();

        if (error) {
            console.error("Error en create:", error);
            throw error;
        }

        return data;
    }

    // Actualizar un usuario (opcional, si lo necesitas)
    static async update(id, updates) {
        const { data, error } = await supabase
            .from("users")
            .update(updates)
            .eq("id", id)
            .select()
            .single();

        if (error) {
            console.error("Error en update:", error);
            throw error;
        }

        return data;
    }
}