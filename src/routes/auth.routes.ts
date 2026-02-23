import { Router } from "express";
import { login, getCurrentUser, refreshToken } from "../controllers/auth.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";

const router = Router();

// Public routes
router.post("/login", login);

// Protected routes (require authentication)
router.get("/me", authMiddleware, getCurrentUser);
router.post("/refresh", authMiddleware, refreshToken);

export default router;
