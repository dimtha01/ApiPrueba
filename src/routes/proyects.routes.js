import { Router } from "express";
import { getProyectoById, getProyects, postProyect } from "../controllers/proyects.controller.js";

const router = Router();

router.get("/proyectos", getProyects);
router.get("/proyectos/:id", getProyectoById);
router.post("/proyectos", postProyect);

export default router;