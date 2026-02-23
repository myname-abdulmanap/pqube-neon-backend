import { Router, Response } from "express";
import authRoutes from "./auth.routes.js";
import userRoutes from "./user.routes.js";
import roleRoutes from "./role.routes.js";
import permissionRoutes from "./permission.routes.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../middlewares/rbac.middleware.js";
import type { AuthenticatedRequest } from "../types/index.js";

const router = Router();

// Mount module routes
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/roles", roleRoutes);
router.use("/permissions", permissionRoutes);

// Example protected route: /admin-only
// This route requires manage_users permission
router.get(
  "/admin-only",
  authMiddleware,
  rbacMiddleware("manage_users"),
  (req: AuthenticatedRequest, res: Response) => {
    res.json({
      success: true,
      message: "Welcome! You have admin access (manage_users permission)",
      user: req.user,
    });
  }
);

// Health check endpoints
router.get("/health", (_req, res) => {
  res.json({
    success: true,
    message: "API is healthy",
    timestamp: new Date().toISOString(),
  });
});

export default router;
