import { Router } from "express";
import { getEstatus } from "../controllers/estatus.controller.js";

const router = Router();

router.get("/estatus", getEstatus);

export default router;
