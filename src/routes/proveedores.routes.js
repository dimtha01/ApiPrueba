import { Router } from "express";
import { createProveedor, getProveedores } from "../controllers/proveedores.controller.js";

const router = Router();
router.get("/proveedores",getProveedores)
router.post("/proveedores",createProveedor)


export default router;