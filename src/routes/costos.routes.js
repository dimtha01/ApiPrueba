import { Router } from "express";
import { createCostos, getCostosByProyecto, updateCosto, updateCostoEstatus } from "../controllers/costos.controller.js";
const router = Router();

router.get('/costos/:id', getCostosByProyecto)
router.post('/costos', createCostos);
router.put('/costos/:id', updateCosto);
router.put('/costos/estatus/:id', updateCostoEstatus)
router.patch('/costos/estatus/:id', updateCosto)
router.patch('/costos/monto/:id', updateCosto)

export default router;
