import { Router } from "express";
import { createAvanceFisico, getAvanceFisico, getAvanceFisicoByProyectoId } from "../controllers/avance_fisico.controller.js";

const router = Router();

router.get("/avanceFisico", getAvanceFisico);
router.get("/avanceFisico/:id", getAvanceFisicoByProyectoId);
router.post("/avanceFisico", createAvanceFisico);

export default router;