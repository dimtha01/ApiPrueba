import express from "express";
import morgan from "morgan";
import cors from "cors"; // Importa el paquete cors
import employeesRoutes from "./routes/clients.routes.js";
import indexRoutes from "./routes/index.routes.js";

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/", indexRoutes);
app.use("/api", employeesRoutes);

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

export default app;