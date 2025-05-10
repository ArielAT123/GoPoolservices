export class User {
    static table = 'users';
  
    static async existsByEmail(supabase, email) {
      try {
        const { data, error } = await supabase
          .from(this.table)
          .select('id')
          .eq('email', email)
          .maybeSingle();
        
        if (error) throw error;
        return !!data;
      } catch (error) {
        console.error(`Error verificando existencia de usuario con email ${email}:`, error);
        throw new Error('Error al verificar usuario');
      }
    }
  
    static async findById(supabase, id) {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw new Error('Usuario no encontrado');
      return data;
    }
  
    static async findByEmail(supabase, email) {
      const { data, error } = await supabase
        .from(this.table)
        .select('*')
        .eq('email', email)
        .single();
      if (error) throw new Error('Usuario no encontrado');
      return data;
    }
  
    static async update(supabase, id, updates) {
      const { data, error } = await supabase
        .from(this.table)
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw new Error('Error al actualizar el usuario');
      return data;
    }
  
    static async delete(supabase, id) {
      const { error } = await supabase
        .from(this.table)
        .delete()
        .eq('id', id);
      if (error) throw new Error('Error al eliminar el usuario');
    }
  }