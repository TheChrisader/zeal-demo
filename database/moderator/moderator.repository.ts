import { DeleteResult } from "mongodb";
import { newId } from "@/lib/database";
import { IModerator, ModeratorDTO } from "@/types/moderator.type";
import ModeratorModel from "./moderator.model";

export const createModerator = async (
  dto: ModeratorDTO,
): Promise<IModerator> => {
  try {
    const moderator = new ModeratorModel({
      name: dto.name,
      email: dto.email,
      password_hash: dto.password_hash,
      permissions: dto.permissions,
    });
    return await moderator.save();
  } catch (error) {
    throw error;
  }
};

export const updateModerator = async (
  moderatorId: string,
  dto: Partial<ModeratorDTO>,
): Promise<IModerator | null> => {
  try {
    return await ModeratorModel.findByIdAndUpdate(
      newId(moderatorId),
      { $set: dto },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};

export const findModeratorByEmail = async (
  email: string,
): Promise<IModerator | null> => {
  try {
    return await ModeratorModel.findOne({ email });
  } catch (error) {
    throw error;
  }
};

export const findModeratorById = async (
  id: string,
): Promise<IModerator | null> => {
  try {
    return await ModeratorModel.findById(newId(id));
  } catch (error) {
    throw error;
  }
};

export const updateModeratorPermissions = async (
  moderatorId: string,
  permissions: string[],
): Promise<IModerator | null> => {
  try {
    return await ModeratorModel.findByIdAndUpdate(
      newId(moderatorId),
      { $set: { permissions } },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};

export const addModeratorPermissions = async (
  moderatorId: string,
  permissions: string[],
): Promise<IModerator | null> => {
  try {
    return await ModeratorModel.findByIdAndUpdate(
      newId(moderatorId),
      { $addToSet: { permissions: { $each: permissions } } },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};

export const removeModeratorPermissions = async (
  moderatorId: string,
  permissions: string[],
): Promise<IModerator | null> => {
  try {
    return await ModeratorModel.findByIdAndUpdate(
      newId(moderatorId),
      { $pull: { permissions: { $in: permissions } } },
      { new: true, runValidators: true },
    );
  } catch (error) {
    throw error;
  }
};

export const deleteModerator = async (
  moderatorId: string,
): Promise<DeleteResult> => {
  try {
    return await ModeratorModel.deleteOne({ _id: newId(moderatorId) });
  } catch (error) {
    throw error;
  }
};
