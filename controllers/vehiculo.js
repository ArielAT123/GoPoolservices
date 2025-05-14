import { vehiculo } from "../models/Vehiculo.js";
import { supabase } from "../supaBaseCliente.js";

async function agregarVehiculo(req, res) {
    try {
        const { id_driver, placa, capacidad_maxima, fotovehiculo, modelocar, color } = req.body;
        const requiredVehiculo = ["id_driver", "placa", "capacidad_maxima", "fotovehiculo", "modelocar", "color"];
        const missingFields = requiredVehiculo.filter(field => !req.body[field]);
        
        if (missingFields.length > 0) {
            return res.status(400).json({ error: `Faltan los siguientes campos: ${missingFields.join(", ")}` });
        }

        const { error: insertError } = await vehiculo.agregarVehiculo(supabase, id_driver, placa, capacidad_maxima, fotovehiculo, modelocar, color);
        if (insertError) {
            return res.status(400).json({ error: `Error al agregar vehículo: ${insertError.message}` });
        }

        if (insertError) {
            throw insertError;
        }

        return res.status(201).json({ message: "Vehículo agregado correctamente" });

    } catch (error) {
        console.error('Error en agregarVehiculo:', error);
        return res.status(500).json({ 
            error: { 
                message: 'Error interno del servidor',
                details: error.message 
            } 
        });
    }
}

export const vehiculoController = {
    agregarVehiculo
};