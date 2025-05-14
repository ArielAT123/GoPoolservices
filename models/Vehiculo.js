export class vehiculo{
static table = 'vehiculo';
static async agregarVehiculo(supabase, id_driver, placa, capacidad_maxima, fotovehiculo, modelocar, color) {
    try {
        const { error } = await supabase
            .from(this.table)
            .insert({
                iddriver: id_driver,
                placa: placa,
                capacidadmaxima: capacidad_maxima,
                fotovehiculo: fotovehiculo,
                modelocar: modelocar,
                color: color
            });

        if (error) throw error;

        return { message: "Vehículo agregado correctamente" };
    } catch (error) {
        console.error('Error en agregarVehiculo:', error);
        throw new Error('Error al agregar vehículo');
    }    
}
}
