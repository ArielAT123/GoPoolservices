export class Rutas{
    static table= "puntosruta"

    static async obtenerPuntosRuta(supabase, idRuta){
        try {
            const {data, error}= await supabase
            .from(this.table)
            .select("orden, longitud, latitud, descripcion,id")
            .eq("idrutadriver", idRuta)
            .order("orden", {ascending: true});
            if(error){
                console.error("Error al obtener las rutas: ", error);
                console.log("rutas filtradas y ordenadas: ", data);
            }
            return data;
        } catch (error) {
            console.error('Error en obtener puntos ruta:', error);
            throw new Error('Error en obtenerPuntosRuta :3');
        }
    }

    static async  agregarPuntoRuta(supabase,id_ruta, puntoLongitud, puntoLatitud, descripcion, ordenNumericodelaRuta ) {
        try {
            const {error} = await supabase
            .from(this.table)
            .insert({
                idrutadriver:id_ruta,
                orden:ordenNumericodelaRuta,
                descripcion:descripcion,
                longitud: puntoLongitud,
                latitud: puntoLatitud
            })
        if (error) throw error;

            return { message: "punto nuevo agregado correctamente" };
        } catch (error) {
            console.error('Error en agregarPuntoRuta:', error);
            throw new Error('Error en agregarPuntoRuta :3');
        }
    }
    static async eliminarPunto(supabase, idPunto){
        try {
            const {data, error}= await supabase
            .from(this.table)
            .delete()
            .eq("id", idPunto);
        if(error) throw error;
        return{message: "punto eliminado correctamente"}    
        } catch (error) {
            console.error("Error en eliminarPuntoRuta", error);
            throw new Error("Error al eliminarPuntoRuta :3");
        }
    }
}