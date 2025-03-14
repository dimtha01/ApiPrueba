import { Router } from "express";
import {
  createCliente,
  createEmployee,
  deleteEmployee,
  getClientes,
  updateCliente,
  updateEmployee,
} from "../controllers/clients.controller.js";

const router = Router();

// GET all Employees
router.get("/clientes", getClientes);

// GET An Employee
router.post("/clientes", createCliente);
router.put("/clientes/:id", updateCliente);



export default router;
