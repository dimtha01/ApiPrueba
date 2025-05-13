import { Router } from 'express';
import {
  getProveedores,
  getProveedorById,
  createProveedor,
  updateProveedor,
  updateEstatusProveedor,
  deleteProveedor,
  getProveedoresByEstatus
} from '../controllers/proveedores.controller.js';

const router = Router();

// Rutas básicas CRUD
router.get('/proveedores', getProveedores);
router.get('/proveedores/:id', getProveedorById);
router.post('/proveedores', createProveedor);
router.put('/proveedores/:id', updateProveedor);
router.delete('/proveedores/:id', deleteProveedor);

// Ruta específica para actualizar solo el estatus
router.put('/proveedores/:id/estatus', updateEstatusProveedor);

// Ruta para obtener proveedores por estatus (puede ser ID o abreviatura)
router.get('/proveedores/estatus/:estatus', getProveedoresByEstatus);

export default router;