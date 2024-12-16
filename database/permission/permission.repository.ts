import { newId } from "@/lib/database";
import { PermissionDTO } from "@/types/permission.type";
import PermissionModel from "./permission.model";

export const createPermission = async (dto: PermissionDTO) => {
  try {
    const permission = new PermissionModel({
      user_id: newId(dto.user_id),
      permissions: dto.permissions,
    });
    return await permission.save();
  } catch (error) {
    throw error;
  }
};

export const findPermissionsByUserId = async (userId: string) => {
  try {
    return await PermissionModel.findOne({ user_id: newId(userId) });
  } catch (error) {
    throw error;
  }
};

export const updatePermissions = async (
  userId: string,
  permissions: string[],
) => {
  try {
    return await PermissionModel.updateOne(
      { user_id: newId(userId) },
      { $set: { permissions: permissions } },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};

export const deletePermission = async (userId: string) => {
  try {
    return await PermissionModel.deleteOne({ user_id: newId(userId) });
  } catch (error) {
    throw error;
  }
};

export const addPermissions = async (userId: string, permissions: string[]) => {
  try {
    return await PermissionModel.updateOne(
      { user_id: newId(userId) },
      { $addToSet: { permissions: { $each: permissions } } },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};

export const removePermissions = async (
  userId: string,
  permissions: string[],
) => {
  try {
    return await PermissionModel.updateOne(
      { user_id: newId(userId) },
      { $pull: { permissions: { $in: permissions } } },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};
