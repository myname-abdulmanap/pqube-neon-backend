import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { roleService } from "../services/role.service.js";

/**
 * RBAC Middleware Factory
 * Creates a middleware that checks if the user has the required permission
 * @param requiredPermission - The permission name required to access the route
 */
export const rbacMiddleware = (requiredPermission: string) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      // Check if user is authenticated
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { roleId } = req.user;

      // Check if user's role has the required permission
      const hasPermission = await roleService.hasPermission(roleId, requiredPermission);

      if (!hasPermission) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required permission: ${requiredPermission}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("RBAC middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Multiple Permissions Middleware (ANY)
 * Checks if user has at least one of the required permissions
 */
export const rbacMiddlewareAny = (requiredPermissions: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { roleId } = req.user;
      const userPermissions = await roleService.getPermissions(roleId);

      const hasAnyPermission = requiredPermissions.some((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasAnyPermission) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required one of: ${requiredPermissions.join(", ")}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("RBAC middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during authorization",
      });
    }
  };
};

/**
 * Multiple Permissions Middleware (ALL)
 * Checks if user has all of the required permissions
 */
export const rbacMiddlewareAll = (requiredPermissions: string[]) => {
  return async (
    req: AuthenticatedRequest,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      if (!req.user) {
        res.status(401).json({
          success: false,
          error: "Authentication required",
        });
        return;
      }

      const { roleId } = req.user;
      const userPermissions = await roleService.getPermissions(roleId);

      const hasAllPermissions = requiredPermissions.every((perm) =>
        userPermissions.includes(perm)
      );

      if (!hasAllPermissions) {
        res.status(403).json({
          success: false,
          error: `Access denied. Required all of: ${requiredPermissions.join(", ")}`,
        });
        return;
      }

      next();
    } catch (error) {
      console.error("RBAC middleware error:", error);
      res.status(500).json({
        success: false,
        error: "Internal server error during authorization",
      });
    }
  };
};
