import express from "express";
import morgan from "morgan";
import cors from "cors"; // Importa el paquete cors
import employeesRoutes from "./routes/clients.routes.js";
import proyectsRoutes from "./routes/proyects.routes.js";
import avanceFisicoRoutes from "./routes/avance_fisico.routes.js";
import avanceFinancieroRoutes from "./routes/avance_financiero.routes.js";
import indexRoutes from "./routes/index.routes.js";
import regionesRoutes from './routes/regiones.routes.js'
import estatusRoutes from './routes/estatus.routes.js'
import dashboardRoutes from './routes/dashboard.routes.js'
import costosRoutes from './routes/costos.routes.js'
import proveedoresRoutes from './routes/proveedores.routes.js'
import requisitionRoutes from './routes/requisition.routes.js'
import estatusComercialRoutes from './routes/estatus_comercial.routes.js'
import procedimientoComercialRoutes from './routes/procedimiento_comercial.routes.js'
import authRoutes from "./routes/auth.routes.js"
import userRoutes from "./routes/user.routes.js"
import roleRoutes from "./routes/role.routes.js"

const app = express();

// Middlewares
app.use(cors()); // Habilita CORS para todas las rutas
app.use(morgan("dev"));
app.use(express.json());
  
// Routes
app.use("/", indexRoutes);
app.use("/api", employeesRoutes);
app.use("/api", proyectsRoutes);
app.use("/api", avanceFisicoRoutes);
app.use("/api", avanceFinancieroRoutes);
app.use("/api", regionesRoutes);
app.use("/api", estatusRoutes);
app.use("/api", dashboardRoutes);
app.use("/api", costosRoutes);
app.use("/api", proveedoresRoutes);
app.use("/api", requisitionRoutes);
app.use("/api", estatusComercialRoutes);
app.use("/api", procedimientoComercialRoutes);
app.use("/api/auth", authRoutes)
app.use("/api/users", userRoutes)
app.use("/api/roles", roleRoutes)

// Middleware para manejar rutas no encontradas
app.use((req, res, next) => {
  res.status(404).json({ message: "Not found" });
});

export default app;