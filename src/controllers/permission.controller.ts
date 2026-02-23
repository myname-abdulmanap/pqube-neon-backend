import { Response } from "express";
import { permissionService } from "../services/permission.service.js";
import type {
  AuthenticatedRequest,
  CreatePermissionDto,
  UpdatePermissionDto,
} from "../types/index.js";

/**
 * GET /permissions
 * Get all permissions
 */
export const getAllPermissions = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const permissions = await permissionService.findAll();

    res.json({
      success: true,
      data: permissions,
    });
  } catch (error) {
    console.error("Get all permissions error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * GET /permissions/:id
 * Get permission by ID
 */
export const getPermissionById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const permission = await permissionService.findById(id);

    if (!permission) {
      res.status(404).json({
        success: false,
        error: "Permission not found",
      });
      return;
    }

    res.json({
      success: true,
      data: permission,
    });
  } catch (error) {
    console.error("Get permission by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * POST /permissions
 * Create a new permission
 */
export const createPermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const data: CreatePermissionDto = req.body;

    // Validate input
    if (!data.name) {
      res.status(400).json({
        success: false,
        error: "Permission name is required",
      });
      return;
    }

    // Check if permission name already exists
    const existingPermission = await permissionService.findByName(data.name);
    if (existingPermission) {
      res.status(409).json({
        success: false,
        error: "Permission name already exists",
      });
      return;
    }

    const permission = await permissionService.create(data);

    res.status(201).json({
      success: true,
      data: permission,
      message: "Permission created successfully",
    });
  } catch (error) {
    console.error("Create permission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * PUT /permissions/:id
 * Update permission
 */
export const updatePermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const data: UpdatePermissionDto = req.body;

    // Check if name is being changed and if it already exists
    if (data.name) {
      const existingPermission = await permissionService.findByName(data.name);
      if (existingPermission && existingPermission.id !== id) {
        res.status(409).json({
          success: false,
          error: "Permission name already exists",
        });
        return;
      }
    }

    const permission = await permissionService.update(id, data);

    if (!permission) {
      res.status(404).json({
        success: false,
        error: "Permission not found",
      });
      return;
    }

    res.json({
      success: true,
      data: permission,
      message: "Permission updated successfully",
    });
  } catch (error) {
    console.error("Update permission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * DELETE /permissions/:id
 * Delete permission
 */
export const deletePermission = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;

    const deleted = await permissionService.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: "Permission not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "Permission deleted successfully",
    });
  } catch (error) {
    console.error("Delete permission error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
