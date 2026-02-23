import { Request, Response } from "express";
import { authService } from "../services/auth.service.js";
import type { AuthenticatedRequest, LoginDto } from "../types/index.js";

/**
 * POST /auth/login
 * Authenticate user with email and password
 */
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password }: LoginDto = req.body;

    // Validate input
    if (!email || !password) {
      res.status(400).json({
        success: false,
        error: "Email and password are required",
      });
      return;
    }

    // Attempt login
    const result = await authService.login(email, password);

    if (!result) {
      res.status(401).json({
        success: false,
        error: "Invalid email or password",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: "Login successful",
    });
  } catch (error) {
    console.error("Login error:", error);
    
    if (error instanceof Error && error.message === "User account is deactivated") {
      res.status(403).json({
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
 * GET /auth/me
 * Get current authenticated user
 */
export const getCurrentUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    const user = await authService.getCurrentUser(req.user.userId);

    if (!user) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Get current user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * POST /auth/refresh
 * Refresh JWT token (placeholder - can be extended)
 */
export const refreshToken = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        error: "Not authenticated",
      });
      return;
    }

    // Get fresh user data and generate new token
    const result = await authService.getCurrentUser(req.user.userId);

    if (!result) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      data: result,
      message: "Token refreshed",
    });
  } catch (error) {
    console.error("Refresh token error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
