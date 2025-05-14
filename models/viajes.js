export class Viaje {
    static tablerutaDriver = 'rutadriver';
    static tablepasajeros = 'pasajeros';
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
                    idpasajero: userid,
                    waltuserubicacionlongitud: waltuserubicacionlongitud,
                    waltuserubicacionlatitud: waltuserubicacionlatitud,
                    saldo: saldo,
                    recogido: recogido
                });

            if (error) throw error;
            const { data, error2 } = await supabase
            .from(this.tablerutaDriver)
            .update(updates)
            return { message: "Viaje agregado correctamente" };
        } catch (error) {
            console.error('Error en agregarViaje:', error);
            throw new Error('Error al agregar viaje');
        }
    }
}