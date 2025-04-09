import { Router } from "express";
import { createProcedimientoComercial, getProcedimientoComercialById, getProcedimientosComerciales, getProcedimientosPorRegion, updateEstatusComercial } from "../controllers/procedimiento_comercial.controller.js";

const router = Router();

router.get('/procedimientosComerciales', getProcedimientosComerciales);
router.get('/procedimientosComerciales/region/:region', getProcedimientosPorRegion);
router.post('/procedimientosComerciales', createProcedimientoComercial);
router.get('/procedimientosComerciales/:id', getProcedimientoComercialById);
router.put('/procedimientosComerciales/estatusComercial/:id', updateEstatusComercial);

export default router;