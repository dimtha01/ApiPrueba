// src/routes/auth.routes.js
import express from "express"
import { login, register, getProfile } from "../controllers/auth.controller.js"
import { protect, admin } from "../middleware/auth.middleware.js"

const router = express.Router()

// Public routes
router.post("/login", login)

// Protected routes
router.get("/profile", protect, getProfile)

// Admin routes
router.post("/register", register)

export default router
