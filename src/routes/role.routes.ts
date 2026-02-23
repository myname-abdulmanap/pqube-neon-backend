import { Router } from "express";
import {
  getAllRoles,
  getRoleById,
  createRole,
  updateRole,
  deleteRole,
  assignPermission,
  revokePermission,
  getRolePermissions,
} from "../controllers/role.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../middlewares/rbac.middleware.js";

const router = Router();

// All role routes require authentication
router.use(authMiddleware);

// GET /roles - requires manage_roles permission
router.get("/", rbacMiddleware("manage_roles"), getAllRoles);

// GET /roles/:id - requires manage_roles permission
router.get("/:id", rbacMiddleware("manage_roles"), getRoleById);

// POST /roles - requires manage_roles permission
router.post("/", rbacMiddleware("manage_roles"), createRole);

// PUT /roles/:id - requires manage_roles permission
router.put("/:id", rbacMiddleware("manage_roles"), updateRole);

// DELETE /roles/:id - requires manage_roles permission
router.delete("/:id", rbacMiddleware("manage_roles"), deleteRole);

// Permission management for roles
// GET /roles/:id/permissions - requires manage_roles permission
router.get("/:id/permissions", rbacMiddleware("manage_roles"), getRolePermissions);

// POST /roles/:id/permissions - requires manage_roles permission
router.post("/:id/permissions", rbacMiddleware("manage_roles"), assignPermission);

// DELETE /roles/:id/permissions/:permissionId - requires manage_roles permission
router.delete("/:id/permissions/:permissionId", rbacMiddleware("manage_roles"), revokePermission);

export default router;
