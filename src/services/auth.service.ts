import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import type { JwtPayload, LoginResponseDto, UserDto } from "../types/index.js";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";
const JWT_EXPIRES_IN = (process.env.JWT_EXPIRES_IN || "7d") as string;

export class AuthService {
  /**
   * Authenticate user with email and password
   * Returns JWT token and user info on success
   */
  async login(email: string, password: string): Promise<LoginResponseDto | null> {
    // Find user by email
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    if (!user.isActive) {
      throw new Error("User account is deactivated");
    }

    // Compare password with bcrypt
    const isPasswordValid = await bcrypt.compare(password, user.passwordHash);

    if (!isPasswordValid) {
      return null;
    }

    // Generate JWT token
    const payload: JwtPayload = {
      userId: user.id,
      roleId: user.roleId,
      email: user.email,
    };

    const token = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN as jwt.SignOptions["expiresIn"],
    });

    // Build user DTO (without passwordHash)
    const userDto: UserDto = {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        createdAt: user.role.createdAt,
        updatedAt: user.role.updatedAt,
        permissions: user.role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
          createdAt: rp.permission.createdAt,
          updatedAt: rp.permission.updatedAt,
        })),
      },
    };

    return {
      token,
      user: userDto,
    };
  }

  /**
   * Verify JWT token and return payload
   */
  verifyToken(token: string): JwtPayload | null {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  /**
   * Get current user from token
   */
  async getCurrentUser(userId: string): Promise<UserDto | null> {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        role: {
          include: {
            rolePermissions: {
              include: {
                permission: true,
              },
            },
          },
        },
      },
    });

    if (!user) {
      return null;
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: {
        id: user.role.id,
        name: user.role.name,
        description: user.role.description,
        createdAt: user.role.createdAt,
        updatedAt: user.role.updatedAt,
        permissions: user.role.rolePermissions.map((rp) => ({
          id: rp.permission.id,
          name: rp.permission.name,
          description: rp.permission.description,
          resource: rp.permission.resource,
          action: rp.permission.action,
          createdAt: rp.permission.createdAt,
          updatedAt: rp.permission.updatedAt,
        })),
      },
    };
  }
}

export const authService = new AuthService();
