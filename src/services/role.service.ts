import prisma from "../lib/prisma.js";
import type { CreateRoleDto, RoleDto, UpdateRoleDto } from "../types/index.js";

export class RoleService {
  /**
   * Get all roles with their permissions
   */
  async findAll(): Promise<RoleDto[]> {
    const roles = await prisma.role.findMany({
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
        _count: {
          select: {
            users: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return roles.map((role) => this.toRoleDto(role));
  }

  /**
   * Get role by ID with permissions
   */
  async findById(id: string): Promise<RoleDto | null> {
    const role = await prisma.role.findUnique({
      where: { id },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return null;
    }

    return this.toRoleDto(role);
  }

  /**
   * Get role by name
   */
  async findByName(name: string): Promise<RoleDto | null> {
    const role = await prisma.role.findUnique({
      where: { name },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    if (!role) {
      return null;
    }

    return this.toRoleDto(role);
  }

  /**
   * Create a new role
   */
  async create(data: CreateRoleDto): Promise<RoleDto> {
    const role = await prisma.role.create({
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.toRoleDto(role);
  }

  /**
   * Update role
   */
  async update(id: string, data: UpdateRoleDto): Promise<RoleDto | null> {
    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return null;
    }

    const role = await prisma.role.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
      },
      include: {
        rolePermissions: {
          include: {
            permission: true,
          },
        },
      },
    });

    return this.toRoleDto(role);
  }

  /**
   * Delete role
   */
  async delete(id: string): Promise<boolean> {
    const existingRole = await prisma.role.findUnique({ where: { id } });
    if (!existingRole) {
      return false;
    }

    // Check if users are using this role
    const usersWithRole = await prisma.user.count({ where: { roleId: id } });
    if (usersWithRole > 0) {
      throw new Error("Cannot delete role that is assigned to users");
    }

    await prisma.role.delete({ where: { id } });
    return true;
  }

  /**
   * Assign permission to role
   */
  async assignPermission(roleId: string, permissionId: string): Promise<boolean> {
    // Check if role exists
    const role = await prisma.role.findUnique({ where: { id: roleId } });
    if (!role) {
      throw new Error("Role not found");
    }

    // Check if permission exists
    const permission = await prisma.permission.findUnique({ where: { id: permissionId } });
    if (!permission) {
      throw new Error("Permission not found");
    }

    // Check if already assigned
    const existing = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    if (existing) {
      return true; // Already assigned
    }

    await prisma.rolePermission.create({
      data: {
        roleId,
        permissionId,
      },
    });

    return true;
  }

  /**
   * Revoke permission from role
   */
  async revokePermission(roleId: string, permissionId: string): Promise<boolean> {
    const existing = await prisma.rolePermission.findUnique({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    if (!existing) {
      return false;
    }

    await prisma.rolePermission.delete({
      where: {
        roleId_permissionId: { roleId, permissionId },
      },
    });

    return true;
  }

  /**
   * Check if role has a specific permission
   */
  async hasPermission(roleId: string, permissionName: string): Promise<boolean> {
    const rolePermission = await prisma.rolePermission.findFirst({
      where: {
        roleId,
        permission: {
          name: permissionName,
        },
      },
    });

    return rolePermission !== null;
  }

  /**
   * Get all permissions for a role
   */
  async getPermissions(roleId: string): Promise<string[]> {
    const rolePermissions = await prisma.rolePermission.findMany({
      where: { roleId },
      include: {
        permission: true,
      },
    });

    return rolePermissions.map((rp) => rp.permission.name);
  }

  /**
   * Convert Prisma Role to RoleDto
   */
  private toRoleDto(role: {
    id: string;
    name: string;
    description: string | null;
    createdAt: Date;
    updatedAt: Date;
    rolePermissions?: Array<{
      permission: {
        id: string;
        name: string;
        description: string | null;
        resource: string | null;
        action: string | null;
        createdAt: Date;
        updatedAt: Date;
      };
    }>;
    _count?: {
      users: number;
    };
  }): RoleDto {
    return {
      id: role.id,
      name: role.name,
      description: role.description,
      createdAt: role.createdAt,
      updatedAt: role.updatedAt,
      permissions: role.rolePermissions?.map((rp) => ({
        id: rp.permission.id,
        name: rp.permission.name,
        description: rp.permission.description,
        resource: rp.permission.resource,
        action: rp.permission.action,
        createdAt: rp.permission.createdAt,
        updatedAt: rp.permission.updatedAt,
      })),
      _count: role._count,
    };
  }
}

export const roleService = new RoleService();
