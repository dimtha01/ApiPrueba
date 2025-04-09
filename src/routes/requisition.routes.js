import { Router } from "express";
import { createRequisition, getRequisitions } from "../controllers/requisition.controller.js";

const router = Router();

router.get("/requisiciones",getRequisitions);
router.post("/requisiciones",createRequisition);

export default router;