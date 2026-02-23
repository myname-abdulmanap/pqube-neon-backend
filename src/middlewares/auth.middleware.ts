import { Response, NextFunction } from "express";
import type { AuthenticatedRequest } from "../types/index.js";
import { authService } from "../services/auth.service.js";

/**
 * Authentication Middleware
 * Verifies JWT token from Authorization header and injects user info into request
 */
export const authMiddleware = async (
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Get token from Authorization header
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      res.status(401).json({
        success: false,
        error: "No authorization header provided",
      });
      return;
    }

    // Check Bearer token format
    const parts = authHeader.split(" ");
    if (parts.length !== 2 || parts[0] !== "Bearer") {
      res.status(401).json({
        success: false,
        error: "Invalid authorization header format. Use: Bearer <token>",
      });
      return;
    }

    const token = parts[1];

    // Verify token
    const payload = authService.verifyToken(token);

    if (!payload) {
      res.status(401).json({
        success: false,
        error: "Invalid or expired token",
      });
      return;
    }

    // Inject user info into request
    req.user = payload;

    next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error during authentication",
    });
  }
};
