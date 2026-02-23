import { Response } from "express";
import { userService } from "../services/user.service.js";
import type { AuthenticatedRequest, CreateUserDto, UpdateUserDto } from "../types/index.js";

/**
 * GET /users
 * Get all users
 */
export const getAllUsers = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const users = await userService.findAll();

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Get all users error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * GET /users/:id
 * Get user by ID
 */
export const getUserById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    const user = await userService.findById(id);

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
    console.error("Get user by ID error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * POST /users
 * Create a new user
 */
export const createUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const data: CreateUserDto = req.body;

    // Validate input
    if (!data.email || !data.password || !data.name || !data.roleId) {
      res.status(400).json({
        success: false,
        error: "Email, password, name, and roleId are required",
      });
      return;
    }

    // Check if email already exists
    const existingUser = await userService.findByEmail(data.email);
    if (existingUser) {
      res.status(409).json({
        success: false,
        error: "Email already in use",
      });
      return;
    }

    const user = await userService.create(data);

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Create user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * PUT /users/:id
 * Update user
 */
export const updateUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;
    const data: UpdateUserDto = req.body;

    // Check if email is being changed and if it's already in use
    if (data.email) {
      const existingUser = await userService.findByEmail(data.email);
      if (existingUser && existingUser.id !== id) {
        res.status(409).json({
          success: false,
          error: "Email already in use",
        });
        return;
      }
    }

    const user = await userService.update(id, data);

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
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Update user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};

/**
 * DELETE /users/:id
 * Delete user
 */
export const deleteUser = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const id = req.params.id as string;

    // Prevent self-deletion
    if (req.user && req.user.userId === id) {
      res.status(400).json({
        success: false,
        error: "Cannot delete your own account",
      });
      return;
    }

    const deleted = await userService.delete(id);

    if (!deleted) {
      res.status(404).json({
        success: false,
        error: "User not found",
      });
      return;
    }

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Delete user error:", error);
    res.status(500).json({
      success: false,
      error: "Internal server error",
    });
  }
};
