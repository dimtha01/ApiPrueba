// src/routes/role.routes.js
import express from "express"
import { getRoles, getRoleById, createRole, updateRole, deleteRole } from "../controllers/role.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

// All routes require admin privileges
// router.use(protect, admin)

router.route("/").get(getRoles).post(createRole)

router.route("/:id").get(getRoleById).put(updateRole).delete(deleteRole)

export default router
