import { Router } from "express";
import { getProyectoById, getProyectsAll, getProyectsNameRegion, postProyect, putProyect } from "../controllers/proyects.controller.js";

const router = Router();

router.get("/proyectos/all", getProyectsAll);
router.get("/proyectos/:region", getProyectsNameRegion);
router.get("/proyectos/id/:id", getProyectoById);
router.post("/proyectos", postProyect);
router.put("/proyectos/:id", putProyect);

export default router;