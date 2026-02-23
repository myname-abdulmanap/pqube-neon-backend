import prisma from "../lib/prisma.js";
import type { CreatePermissionDto, PermissionDto, UpdatePermissionDto } from "../types/index.js";

export class PermissionService {
  /**
   * Get all permissions
   */
  async findAll(): Promise<PermissionDto[]> {
    const permissions = await prisma.permission.findMany({
      orderBy: {
        name: "asc",
      },
    });

    return permissions;
  }

  /**
   * Get permission by ID
   */
  async findById(id: string): Promise<PermissionDto | null> {
    const permission = await prisma.permission.findUnique({
      where: { id },
    });

    return permission;
  }

  /**
   * Get permission by name
   */
  async findByName(name: string): Promise<PermissionDto | null> {
    const permission = await prisma.permission.findUnique({
      where: { name },
    });

    return permission;
  }

  /**
   * Create a new permission
   */
  async create(data: CreatePermissionDto): Promise<PermissionDto> {
    const permission = await prisma.permission.create({
      data: {
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
      },
    });

    return permission;
  }

  /**
   * Update permission
   */
  async update(id: string, data: UpdatePermissionDto): Promise<PermissionDto | null> {
    const existingPermission = await prisma.permission.findUnique({ where: { id } });
    if (!existingPermission) {
      return null;
    }

    const permission = await prisma.permission.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        resource: data.resource,
        action: data.action,
      },
    });

    return permission;
  }

  /**
   * Delete permission
   */
  async delete(id: string): Promise<boolean> {
    const existingPermission = await prisma.permission.findUnique({ where: { id } });
    if (!existingPermission) {
      return false;
    }

    // Delete related role permissions first (cascade is handled by Prisma)
    await prisma.permission.delete({ where: { id } });
    return true;
  }
}

export const permissionService = new PermissionService();
