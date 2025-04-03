import { server } from "./app.js";
import { IP_SERVER, PORT, SUPABASE_URL, SUPABASE_KEY } from "./constants.js";
import { io } from "./utils/index.js";
import { createClient } from "@supabase/supabase-js";

// Inicializar Supabase
const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

(async () => {
    try {
        // Verificar conexión a la base de datos
        const { data, error } = await supabase.from("users").select("id").limit(1);
        if (error) throw error;

        console.log("✅ Conectado a Supabase");

        // Inicia el servidor después de la conexión exitosa
        server.listen(PORT, () => {
            console.log("##############################");
            console.log("###### API REST ######");
            console.log("##############################");
            console.log(`http://${IP_SERVER}:${PORT}/api`);

            io.sockets.on("connection", (socket) => {
                console.log("NUEVO USUARIO CONECTADO");

                socket.on("disconnect", () => {
                    console.log("USUARIO DESCONECTADO");
                });

                socket.on("subscribe", (room) => {
                    socket.join(room);
                });

                socket.on("unsubscribe", (room) => {
                    socket.leave(room);
                });
            });
        });
    } catch (error) {
        console.error("❌ Error al conectar a Supabase:", error.message);
    }
})();
