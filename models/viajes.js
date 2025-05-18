export class Viaje {
    static tablerutaDriver = 'rutadriver';
    static tablepasajeros = 'pasajeros';

    static async cuposDisponibles(supabase, id_viaje) {
    try {
        const { data, error } = await supabase
            .from(this.tablerutaDriver)
            .select('cuposdisponibles')
            .eq('id', id_viaje);
            
        if (error) throw error;
        
        if (data && data.length > 0) {
            return data[0].cuposdisponibles;
        }
        return null;
        
    } catch (error) {
        console.error('Error al obtener cupos disponibles:', error);
        throw error; // O maneja el error según necesites
    }
}
    static async crearViaje(supabase, cuposDisponibles, id_driver, horaSalida, horaestimacionllegada, bloqueopasajeros) {
        try {
            const { error } = await supabase
                .from(this.tablerutaDriver)
                .insert({
                    iddriver: id_driver,
                    cuposdisponibles: cuposDisponibles,
                    horasalida: horaSalida,
                    horaestimacionllegada: horaestimacionllegada,
                    bloqueopasajeros: bloqueopasajeros
                });

            if (error) throw error;

            return { message: "Viaje creado correctamente" };
        } catch (error) {
            console.error('Error en crearViaje:', error);
            throw new Error('Error al crear viaje');
        }
    }

    static async consumirCupodeViaje(supabase, rutadriverId, userid, waltuserubicacionlongitud, waltuserubicacionlatitud, saldo, recogido) {
        try {
            const { error } = await supabase
                .from(this.tablepasajeros)
                .insert({
                    idrutadriver: rutadriverId,
                    userid: userid,
                    waltuserubicacionlongitud: waltuserubicacionlongitud,
                    waltuserubicacionlatitud: waltuserubicacionlatitud,
                    saldo: saldo,
                    recogido: recogido
                });

            if (error) throw error;
            return { message: "Viaje agregado correctamente" };
        } catch (error) {
            console.error('Error en agregarViaje:', error);
            throw new Error('Error al agregar viaje');
        }
    }

static async updateCupo(supabase, cantidad_cupos, id_viaje) {
    try {
        // 1. Obtener cupos disponibles actuales
        const { cuposDisponibles } = await this.cuposDisponibles(supabase, id_viaje);
        
        // 2. Calcular nuevos cupos
        const cuposResultantes = cuposDisponibles - cantidad_cupos;
        
        // 3. Validar que haya suficientes cupos
        if (cuposResultantes >= 0) {  // Cambié > por >= para permitir llegar a 0
            // 4. Actualizar en Supabase
            const { data, error } = await supabase
                .from(this.tablerutaDriver)
                .update({ cuposdisponibles: cuposResultantes })
                .eq('id', id_viaje);
            
            if (error) {
                throw error;
            }
            
            console.log('Cupos actualizados con éxito:', data);
            return data;
        } else {
            throw new Error('No hay suficientes cupos disponibles');
        }
    } catch (error) {
        console.error('Error al actualizar cupos:', error.message);
        return null;
    }
}

/*static async getListaViajes(supabase, longitud, latitud){
    try {
        const{data, error}=await supabase
        .from()
    } catch (error) {
        
    }
}*/
}