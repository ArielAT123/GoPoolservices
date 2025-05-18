import supabase from '../supaBaseCliente.js';
import { Viaje } from '../models/viajes.js';

async function mostrarViajesCercanos(req, res) {
    try {
        const{longitud, latitud}=req.body
    } catch (error) {
        
    }    
}

async function crearViaje(req, res) {
    try {
        const { 
            cuposDisponibles, 
            id_driver, 
            horaSalida, 
            horaestimacionllegada, 
            bloqueopasajeros 
        } = req.body;

        // Validación básica de datos requeridos
        if (!cuposDisponibles || !id_driver || !horaSalida) {
            return res.status(400).json({
                msg: "Datos incompletos",
                required_fields: ["cuposDisponibles", "id_driver", "horaSalida"]
            });
        }

        const result = await Viaje.crearViaje(
            supabase,
            cuposDisponibles,
            id_driver,
            horaSalida,
            horaestimacionllegada,
            bloqueopasajeros
        );

        return res.status(201).json({
            msg: "Viaje creado exitosamente",
            data: result
        });

    } catch (error) {
        console.error('Error en crearViaje:', error);
        return res.status(500).json({
            msg: "Error al crear viaje",
            error: error.message
        });
    }
}

async function unirseAViaje(req, res) {
    try {
        const { 
            id_viaje, 
            userid, 
            waltuserubicacionlongitud, 
            waltuserubicacionlatitud, 
            saldo, 
            recogido,
            cantidad_cupos 
        } = req.body;

        // Validación de datos requeridos
        if (!id_viaje || !userid || cantidad_cupos === undefined) {
            return res.status(400).json({
                msg: "Datos incompletos",
                required_fields: ["id_viaje", "userid", "cantidad_cupos"]
            });
        }

        // 1. Validar y actualizar cupos disponibles
        const updatedViaje = await Viaje.updateCupo(
            supabase,
            cantidad_cupos,
            id_viaje
        );

        if (!updatedViaje) {
            return res.status(400).json({
                msg: "No se pudo actualizar los cupos del viaje",
                error: "No hay suficientes cupos disponibles"
            });
        }

        // 2. Registrar al pasajero en el viaje
        const result = await Viaje.consumirCupodeViaje(
            supabase,
            id_viaje,
            userid,
            waltuserubicacionlongitud,
            waltuserubicacionlatitud,
            saldo,
            recogido
        );

        return res.status(200).json({
            msg: "Te has unido al viaje exitosamente",
            viaje: updatedViaje,
            registro: result
        });

    } catch (error) {
        console.error('Error en unirseAViaje:', error);
        return res.status(500).json({
            msg: "Error al unirse al viaje",
            error: error.message
        });
    }
}

async function obtenerCuposDisponibles(req, res) {
    try {
        const { id_viaje } = req.params;

        if (!id_viaje) {
            return res.status(400).json({
                msg: "ID de viaje requerido"
            });
        }

        const cupos = await Viaje.cuposDisponibles(supabase, id_viaje);

        return res.status(200).json({
            cuposDisponibles: cupos
        });

    } catch (error) {
        console.error('Error en obtenerCuposDisponibles:', error);
        return res.status(500).json({
            msg: "Error al obtener cupos disponibles",
            error: error.message
        });
    }
}

export const ViajeController = {
    crearViaje,
    unirseAViaje,
    obtenerCuposDisponibles
};