import { Router } from "express";
import { createAvanceFinanciero, getAvanceFinanciero, getAvanceFinancieroByProyectoId, updateEstatusAvanceFinanciero } from "../controllers/avance_financiero.controller.js"; // Agrega la extensión .js
const router = Router();

// Ruta GET para obtener datos de avance financiero
router.get("/avanceFinanciero", getAvanceFinanciero);
router.post("/avanceFinanciero", createAvanceFinanciero);
router.get("/avanceFinanciero/:id", getAvanceFinancieroByProyectoId);
router.put("/avanceFinanciero/:id", updateEstatusAvanceFinanciero);

export default router;