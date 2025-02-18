import { Router } from "express";
import { createCostos, getCostosByProyecto } from "../controllers/costos.controller.js";
const router = Router();

router.get('/costos/:id',getCostosByProyecto)
router.post('/costos',createCostos);

export default router;
