import { Router } from "express";
import { getProyectoById, getProyects, postProyect, putProyect } from "../controllers/proyects.controller.js";

const router = Router();

router.get("/proyectos", getProyects);
router.get("/proyectos/:id", getProyectoById);
router.post("/proyectos", postProyect);
router.put("/proyectos/:id", putProyect);

export default router;