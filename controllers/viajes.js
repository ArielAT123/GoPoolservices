import supabase from "../supaBaseCliente.js";

export const createTravel = async (req, res) => {
  try {
    const { cuposDisponibles, horaSalida, horaEstimacionLlegada, bloqueoPasajeros, puntosRuta, pasajeros } = req.body;

    // Step 1: Get the authenticated user's ID from the request (set by mdAuth middleware)
    const userId = req.user.id; // Assuming mdAuth.asureAuth attaches the user to req.user

    // Step 2: Verify the user exists in the users table
    const { data: user, error: userError } = await supabase
      .from('users')
      .select('id')
      .eq('id', userId)
      .single();
    if (userError || !user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Step 3: Verify the user is a driver in the Driver table
    const { data: driver, error: driverError } = await supabase
      .from('Driver')
      .select('id')
      .eq('idUser', userId)
      .single();
    if (driverError || !driver) {
      return res.status(403).json({ message: 'User is not a registered driver' });
    }
    const driverId = driver.id;

    // Step 4: Create the trip in RutaDriver
    const { data: rutaDriver, error: rutaDriverError } = await supabase
      .from('RutaDriver')
      .insert({
        cuposDisponibles,
        driver: driverId,
        horaSalida, // Format: 'HH:MM:SS'
        horaEstimacionLlegada, // Format: 'HH:MM:SS'
        bloqueoPasajeros: bloqueoPasajeros || false,
      })
      .select('id')
      .single();
    if (rutaDriverError) {
      throw new Error(rutaDriverError.message);
    }
    const rutaDriverId = rutaDriver.id;

    // Step 5: Insert route points into PuntosRuta
    if (puntosRuta && Array.isArray(puntosRuta)) {
      const puntosRutaToInsert = puntosRuta.map(punto => ({
        idRutaDriver: rutaDriverId,
        orden: punto.orden,
        descripcion: punto.descripcion,
        longitud: punto.longitud,
        latitud: punto.latitud,
      }));
      const { error: puntosRutaError } = await supabase
        .from('PuntosRuta')
        .insert(puntosRutaToInsert);
      if (puntosRutaError) {
        throw new Error(puntosRutaError.message);
      }
    }

    // Step 6: Insert passengers into Pasajeros
    if (pasajeros && Array.isArray(pasajeros)) {
      for (const pasajero of pasajeros) {
        const { userId: pasajeroId, waltUserUbicacionLongitud, waltUserUbicacionLatitud, saldo, recogido } = pasajero;

        // Verify the passenger exists in the users table
        const { data: pasajeroData, error: pasajeroError } = await supabase
          .from('users')
          .select('id')
          .eq('id', pasajeroId)
          .single();
        if (pasajeroError || !pasajeroData) {
          return res.status(404).json({ message: `Passenger with ID ${pasajeroId} not found` });
        }

        const { error: pasajeroInsertError } = await supabase
          .from('Pasajeros')
          .insert({
            RutaDriverId: rutaDriverId,
            userId: pasajeroId,
            waltUserUbicacionLongitud,
            waltUserUbicacionLatitud,
            saldo,
            recogido: recogido || false,
          });
        if (pasajeroInsertError) {
          throw new Error(pasajeroInsertError.message);
        }
      }
    }

    // Step 7: Return success response
    return res.status(201).json({
      message: 'Trip created successfully',
      rutaDriverId,
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: 'Error creating trip', error: error.message });
  }


  
};
export const ViajesController = {
    createTravel,
};
