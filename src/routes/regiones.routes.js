import { Router } from "express";
import { getRegiones } from "../controllers/regiones.controller.js";

const router = Router();

router.get("/regiones", getRegiones);

export default router;