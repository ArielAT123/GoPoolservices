// middlewares/upload.js
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";

// Configuración para obtener la ruta del directorio actual (necesario para ES Modules)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Configuración de almacenamiento
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, "../uploads/stories")); // Carpeta donde se guardarán los archivos
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    const extension = path.extname(file.originalname); // .jpg, .png, etc.
    cb(null, "story-" + uniqueSuffix + extension); // Nombre del archivo: story-123456789.jpg
  },
});

// Filtro para aceptar solo imágenes/videos
const fileFilter = (req, file, cb) => {
  const allowedTypes = ["image/jpeg", "image/png", "image/gif", "video/mp4", "video/quicktime"];
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true); // Aceptar el archivo
  } else {
    cb(new Error("Tipo de archivo no permitido. Solo imágenes (JPEG, PNG, GIF) o videos (MP4, MOV)"), false);
  }
};

// Middleware configurado
const uploadMiddleware = multer({
  storage,
  limits: { fileSize: 20 * 1024 * 1024 }, // Límite: 20MB
  fileFilter,
});

export default uploadMiddleware;