import { supabase, supabaseAdmin } from "../supaBaseCliente.js";
import { Rutas } from "../models/Rutas.js";
async function obtenerPuntosRuta (req, res) 
    {
    const { idRuta } = req.params; // Obtenemos el idRuta desde los parámetros de la URL
    try {
        const puntosRuta = await Rutas.obtenerPuntosRuta(supabase, idRuta);
        if (puntosRuta) {
            res.status(200).json({ message: 'Puntos de ruta obtenidos correctamente', data: puntosRuta });
        } else {
            res.status(404).json({ message: 'No se encontraron puntos de ruta para esta ruta' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function agregarPuntoRuta (req, res){
    const { idRuta, puntoLongitud, puntoLatitud, descripcion, ordenNumericodelaRuta } = req.body;
    try {
        const response = await Rutas.agregarPuntoRuta(
            supabase,
            idRuta,
            puntoLongitud,
            puntoLatitud,
            descripcion,
            ordenNumericodelaRuta
        );
        res.status(201).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}

async function eliminarPuntoRuta(req, res){
    const { idPunto } = req.params; // Obtenemos el idPunto desde los parámetros de la URL
    try {
        const response = await Rutas.eliminarPunto(supabase, idPunto);
        res.status(200).json(response);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
}
export const RutasController={
    agregarPuntoRuta,
    eliminarPuntoRuta,
    obtenerPuntosRuta,

}
