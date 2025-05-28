import { Router } from "express";
import { deleteProyect, getProyectoById, getProyectsAll, getProyectsAllRequisition, getProyectsNameRegion, postProyect, putProyect } from "../controllers/proyects.controller.js";

const router = Router();

router.get("/proyectos/all", getProyectsAll);
router.get("/proyectos/requisition", getProyectsAllRequisition);
router.get("/proyectos/:region", getProyectsNameRegion);
router.get("/proyectos/id/:id", getProyectoById);
router.post("/proyectos", postProyect);
router.put("/proyectos/:id", putProyect);
router.delete("/proyectos/:id", deleteProyect);

export default router;