import { User } from './User.js';
export class vehiculo{
static table = 'vehiculo';
static async agregarVehiculo(supabase, id_driver, placa, capacidad_maxima, fotovehiculo, modelocar, color) {
    try {
        const { isDriver} = await User.isDriver(supabase, id_driver);
        if(!isDriver) {
            throw new Error('El usuario no es un conductor');
        }
        else{
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
    }
    } catch (error) {
        console.error('Error en agregarVehiculo:', error);
        throw new Error('Error al agregar vehículo');
    }    
}
static async obtenerVehiculos(supabase, id_driver) {
    try {
        const { data, error } = await supabase
            .from(this.table)
            .select('*')
            .eq('iddriver', id_driver);

        if (error) throw error;

        return data;
    } catch (error) {
        console.error('Error en obtenerVehiculos:', error);
        throw new Error('Error al obtener vehículos');
    }
}
}
