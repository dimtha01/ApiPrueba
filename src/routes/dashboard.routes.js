import { Router } from "express";
import { getDashboardRegion } from "../controllers/dashboard.controller.js";
const router = Router();

router.get('/dashdoard/:region',getDashboardRegion)

export default router;
