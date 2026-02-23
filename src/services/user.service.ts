import prisma from "../lib/prisma.js";
import bcrypt from "bcrypt";
import type { CreateUserDto, UpdateUserDto, UserDto } from "../types/index.js";

const SALT_ROUNDS = 10;

export class UserService {
  /**
   * Get all users (without passwordHash)
   */
  async findAll(): Promise<UserDto[]> {
    const users = await prisma.user.findMany({
      include: {
        role: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return users.map((user) => this.toUserDto(user));
  }

  /**
   * Get user by ID (without passwordHash)
   */
  async findById(id: string): Promise<UserDto | null> {
    const user = await prisma.user.findUnique({
      where: { id },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.toUserDto(user);
  }

  /**
   * Get user by email (without passwordHash)
   */
  async findByEmail(email: string): Promise<UserDto | null> {
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        role: true,
      },
    });

    if (!user) {
      return null;
    }

    return this.toUserDto(user);
  }

  /**
   * Create a new user
   */
  async create(data: CreateUserDto): Promise<UserDto> {
    // Hash password
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    const user = await prisma.user.create({
      data: {
        email: data.email,
        name: data.name,
        passwordHash,
        roleId: data.roleId,
      },
      include: {
        role: true,
      },
    });

    return this.toUserDto(user);
  }

  /**
   * Update user
   */
  async update(id: string, data: UpdateUserDto): Promise<UserDto | null> {
    // Check if user exists
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return null;
    }

    // Prepare update data
    const updateData: {
      email?: string;
      name?: string;
      passwordHash?: string;
      roleId?: string;
      isActive?: boolean;
    } = {};

    if (data.email !== undefined) updateData.email = data.email;
    if (data.name !== undefined) updateData.name = data.name;
    if (data.roleId !== undefined) updateData.roleId = data.roleId;
    if (data.isActive !== undefined) updateData.isActive = data.isActive;

    // Hash password if provided
    if (data.password) {
      updateData.passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);
    }

    const user = await prisma.user.update({
      where: { id },
      data: updateData,
      include: {
        role: true,
      },
    });

    return this.toUserDto(user);
  }

  /**
   * Delete user
   */
  async delete(id: string): Promise<boolean> {
    const existingUser = await prisma.user.findUnique({ where: { id } });
    if (!existingUser) {
      return false;
    }

    await prisma.user.delete({ where: { id } });
    return true;
  }

  /**
   * Convert Prisma User to UserDto (exclude passwordHash)
   */
  private toUserDto(user: {
    id: string;
    email: string;
    name: string;
    roleId: string;
    isActive: boolean;
    createdAt: Date;
    updatedAt: Date;
    role?: {
      id: string;
      name: string;
      description: string | null;
      createdAt: Date;
      updatedAt: Date;
    };
  }): UserDto {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      roleId: user.roleId,
      isActive: user.isActive,
      createdAt: user.createdAt,
      updatedAt: user.updatedAt,
      role: user.role
        ? {
            id: user.role.id,
            name: user.role.name,
            description: user.role.description,
            createdAt: user.role.createdAt,
            updatedAt: user.role.updatedAt,
          }
        : undefined,
    };
  }
}

export const userService = new UserService();
