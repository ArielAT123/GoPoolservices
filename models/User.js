import { supabase } from "../supaBaseCliente.js";
export class User {
  static async find(conditions = {}, columns = '*') {
    let query = supabase.from('users').select(columns);
    
    // Aplica condiciones dinámicas
    Object.entries(conditions).forEach(([key, value]) => {
      query = query.eq(key, value);
    });
    
    const { data, error } = await query.single();
    if (error) throw error;
    return data;
  }

  static async findById(id, columns = '*') {
    return this.find({ id }, columns);
  }

  static async findOne(conditions, columns = '*') {
    return this.find(conditions, columns);
  }

  static async create(userData) {
    const { data, error } = await supabase
      .from('users')
      .insert([userData])
      .select()
      .single();
    
    if (error) throw error;
    return data;
  }

  static async update(id, updates, columns = '*') {
    const { data, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', id)
      .select(columns)
      .single();
    
    if (error) throw error;
    return data;
  }

  static async delete(id) {
    const { error } = await supabase
      .from('users')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  }

  // models/User.js
static async updatePassword(userId, newPasswordHash) {
  const { error } = await supabase
      .from('users')
      .update({ password: newPasswordHash })
      .eq('id', userId);

  if (error) throw error;
  return true;
}
}