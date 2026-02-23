import type { Request } from "express";

// JWT Payload
export interface JwtPayload {
  userId: string;
  roleId: string;
  email: string;
  iat?: number;
  exp?: number;
}

// Extended Express Request with user info
export interface AuthenticatedRequest extends Request {
  user?: JwtPayload;
}

// API Response types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

// User DTOs (without passwordHash)
export interface UserDto {
  id: string;
  email: string;
  name: string;
  roleId: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
  role?: RoleDto;
}

export interface CreateUserDto {
  email: string;
  password: string;
  name: string;
  roleId: string;
}

export interface UpdateUserDto {
  email?: string;
  password?: string;
  name?: string;
  roleId?: string;
  isActive?: boolean;
}

// Role DTOs
export interface RoleDto {
  id: string;
  name: string;
  description: string | null;
  createdAt: Date;
  updatedAt: Date;
  permissions?: PermissionDto[];
  _count?: {
    users: number;
  };
}

export interface CreateRoleDto {
  name: string;
  description?: string;
}

export interface UpdateRoleDto {
  name?: string;
  description?: string;
}

// Permission DTOs
export interface PermissionDto {
  id: string;
  name: string;
  description: string | null;
  resource: string | null;
  action: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface CreatePermissionDto {
  name: string;
  description?: string;
  resource?: string;
  action?: string;
}

export interface UpdatePermissionDto {
  name?: string;
  description?: string;
  resource?: string;
  action?: string;
}

// Auth DTOs
export interface LoginDto {
  email: string;
  password: string;
}

export interface LoginResponseDto {
  token: string;
  user: UserDto;
}

// Role Permission DTOs
export interface AssignPermissionDto {
  roleId: string;
  permissionId: string;
}

export interface RevokePermissionDto {
  roleId: string;
  permissionId: string;
}
