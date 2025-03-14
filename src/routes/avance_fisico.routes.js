import { Router } from "express";
import { createAvanceFisico, getAvanceFisico, getAvanceFisicoByProyectoId, updateAvanceFisico } from "../controllers/avance_fisico.controller.js";

const router = Router();

router.get("/avanceFisico", getAvanceFisico);
router.get("/avanceFisico/:id", getAvanceFisicoByProyectoId);
router.post("/avanceFisico", createAvanceFisico);
router.put("/avanceFisico/:id", updateAvanceFisico);

export default router;