import { Router } from "express";
import {
  getAllPermissions,
  getPermissionById,
  createPermission,
  updatePermission,
  deletePermission,
} from "../controllers/permission.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../middlewares/rbac.middleware.js";

const router = Router();

// All permission routes require authentication
router.use(authMiddleware);

// GET /permissions - requires manage_roles permission
router.get("/", rbacMiddleware("manage_roles"), getAllPermissions);

// GET /permissions/:id - requires manage_roles permission
router.get("/:id", rbacMiddleware("manage_roles"), getPermissionById);

// POST /permissions - requires manage_roles permission
router.post("/", rbacMiddleware("manage_roles"), createPermission);

// PUT /permissions/:id - requires manage_roles permission
router.put("/:id", rbacMiddleware("manage_roles"), updatePermission);

// DELETE /permissions/:id - requires manage_roles permission
router.delete("/:id", rbacMiddleware("manage_roles"), deletePermission);

export default router;
