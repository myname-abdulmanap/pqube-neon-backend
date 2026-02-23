import { Response } from "express";
import { roleService } from "../services/role.service.js";
import type {
  AuthenticatedRequest,
  CreateRoleDto,
  UpdateRoleDto,
  AssignPermissionDto,
} from "../types/index.js";

/**
 * GET /roles
 * Get all roles with their permissions
 */
export const getAllRoles = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const roles = await roleService.findAll();

    res.json({
      success: true,
      data: roles,
    });
  } catch (error) {
    console.error("Get all roles error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * GET /roles/:id
 * Get role by ID
 */
export const getRoleById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await roleService.findById(id);

    if (!role) {
      res.status(404).json({
        success: false,
        error: "Role not found",
      });
      return;
    }

    res.json({
      success: true,
      data: role,
    });
  } catch (error) {
    console.error("Get role by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * POST /roles
 * Create a new role
 */
export const createRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const data: CreateRoleDto = req.body;

    // Validate input
    if (!data.name) {
      res.status(400).json({
        success: false,
        error: "Role name is required",
      });
      return;
    }

    // Check if role name already exists
    const existingRole = await roleService.findByName(data.name);
    if (existingRole) {
      res.status(409).json({
        success: false,
        error: "Role name already exists",
      });
      return;
    }

    const role = await roleService.create(data);

    res.status(201).json({
      success: true,
      data: role,
      message: "Role created successfully",
    });
  } catch (error) {
    console.error("Create role error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * PUT /roles/:id
 * Update role
 */
export const updateRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdateRoleDto = req.body;

    // Check if name is being changed and if it already exists
    if (data.name) {
      const existingRole = await roleService.findByName(data.name);
      if (existingRole && existingRole.id !== id) {
        res.status(409).json({
          success: false,
          error: "Role name already exists",
        });
        return;
      }
    }

    const role = await roleService.update(id, data);

    if (!role) {
      res.status(404).json({
        success: false,
        error: "Role not found",
      });
      return;
    }

    res.json({
      success: true,
      data: role,
      message: "Role updated successfully",
    });
  } catch (error) {
    console.error("Update role error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * DELETE /roles/:id
 * Delete role
 */
export const deleteRole = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await roleService.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: "Role not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Role deleted successfully",
    });
  } catch (error) {
    console.error("Delete role error:", error);

    if (error instanceof Error && error.message.includes("Cannot delete role")) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * POST /roles/:id/permissions
 * Assign permission to role
 */
export const assignPermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const { permissionId }: { permissionId: string } = req.body;

    if (!permissionId) {
      res.status(400).json({
        success: false,
        error: "Permission ID is required",
      });
      return;
    }

    await roleService.assignPermission(id, permissionId);

    res.json({
      success: true,
      message: "Permission assigned successfully",
    });
  } catch (error) {
    console.error("Assign permission error:", error);

    if (error instanceof Error) {
      res.status(400).json({
        success: false,
        error: error.message,
      });
      return;
    }

    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * DELETE /roles/:id/permissions/:permissionId
 * Revoke permission from role
 */
export const revokePermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id, permissionId } = req.params;

    const revoked = await roleService.revokePermission(id, permissionId);

    if (!revoked) {
      res.status(404).json({
        success: false,
        error: "Role permission not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Permission revoked successfully",
    });
  } catch (error) {
    console.error("Revoke permission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * GET /roles/:id/permissions
 * Get all permissions for a role
 */
export const getRolePermissions = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const role = await roleService.findById(id);

    if (!role) {
      res.status(404).json({
        success: false,
        error: "Role not found",
      });
      return;
    }

    res.json({
      success: true,
      data: role.permissions || [],
    });
  } catch (error) {
    console.error("Get role permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
