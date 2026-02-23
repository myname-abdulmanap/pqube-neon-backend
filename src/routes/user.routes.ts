import { Router } from "express";
import {
  getAllUsers,
  getUserById,
  createUser,
  updateUser,
  deleteUser,
} from "../controllers/user.controller.js";
import { authMiddleware } from "../middlewares/auth.middleware.js";
import { rbacMiddleware } from "../middlewares/rbac.middleware.js";

const router = Router();

// All user routes require authentication
router.use(authMiddleware);

// GET /users - requires view_users permission
router.get("/", rbacMiddleware("view_users"), getAllUsers);

// GET /users/:id - requires view_users permission
router.get("/:id", rbacMiddleware("view_users"), getUserById);

// POST /users - requires manage_users permission
router.post("/", rbacMiddleware("manage_users"), createUser);

// PUT /users/:id - requires manage_users permission
router.put("/:id", rbacMiddleware("manage_users"), updateUser);

// DELETE /users/:id - requires manage_users permission
router.delete("/:id", rbacMiddleware("manage_users"), deleteUser);

export default router;
