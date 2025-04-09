import { Router } from "express";
import { createCostos, getCostosByProyecto, updateCostoEstatus, updateCostos } from "../controllers/costos.controller.js";
const router = Router();

router.get('/costos/:id',getCostosByProyecto)
router.post('/costos',createCostos);
router.put('/costos/estatus/:id',updateCostoEstatus)

export default router;
