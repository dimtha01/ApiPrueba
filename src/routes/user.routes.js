// src/routes/user.routes.js
import express from "express"
import { getUsers, getUserById, createUser, updateUser, deleteUser } from "../controllers/user.controller.js"
import { protect, admin, canEdit } from "../middleware/auth.middleware.js"

const router = express.Router()

// Admin routes
router.route("/").get(getUsers).post(createUser)

router
  .route("/:id")
  .get(protect, admin, getUserById)
  .put(protect, admin, canEdit, updateUser)
  .delete(protect, admin, deleteUser)

export default router
