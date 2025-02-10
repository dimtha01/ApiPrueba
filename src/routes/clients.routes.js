import { Router } from "express";
import {
  createCliente,
  createEmployee,
  deleteEmployee,
  getClientes,
  updateEmployee,
} from "../controllers/clients.controller.js";

const router = Router();

// GET all Employees
router.get("/clientes", getClientes);

// GET An Employee
router.post("/clientes", createCliente);

// DELETE An Employee
router.delete("/employees/:id", deleteEmployee);

// INSERT An Employee
router.post("/employees", createEmployee);

router.patch("/employees/:id", updateEmployee);

export default router;
