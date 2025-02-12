import { Router } from "express";
import { getProyects, postProyect } from "../controllers/proyects.controller.js";

const router = Router();

router.get("/proyectos", getProyects);
router.post("/proyectos", postProyect);

export default router;