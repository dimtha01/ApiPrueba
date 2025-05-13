import { Router } from "express";
import { createRequisition, getRequisitions, updateRequisition } from "../controllers/requisition.controller.js";

const router = Router();

router.get("/requisiciones",getRequisitions);
router.post("/requisiciones",createRequisition);
router.put("/requisiciones/:id",updateRequisition);

export default router;