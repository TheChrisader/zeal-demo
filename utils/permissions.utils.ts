import { PermissionAction, PermissionResource } from "@/types/permission.type";

export class PermissionError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "PermissionError";
  }
}

export const createPermission = (
  resource: PermissionResource,
  action: PermissionAction,
): string => `${resource}:${action}`;

export const validatePermission = (permission: string): boolean => {
  return /^[a-z_]+:[a-z_]+$/.test(permission);
};

export const hasPermission = (
  userPermissions: string[],
  requiredPermission: string,
): boolean => {
  return userPermissions.includes(requiredPermission);
};
