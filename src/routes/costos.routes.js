import { Router } from "express";
import { createCostos, getCostosByProyecto, updateCostos } from "../controllers/costos.controller.js";
const router = Router();

router.get('/costos/:id',getCostosByProyecto)
router.post('/costos',createCostos);
router.put('/costos/:id',updateCostos)

export default router;
