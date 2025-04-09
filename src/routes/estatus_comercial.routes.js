import { Router } from "express";
import { getEstatusComercial } from "../controllers/estatus_comercial.controller.js";

const router = Router();

router.get("/estatusComercial", getEstatusComercial)

export default router;