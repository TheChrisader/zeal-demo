import { FilterQuery } from "mongoose";

import { connectToDatabase, Id, newId, QueryOptions, UpdateQueryOptions } from "@/lib/database";
import { IUser, IUserWithPassword } from "@/types/user.type";
import { Optional } from "@/types/utils";

import { CreateUserDTO, SignUpUserDTO, UpdateUserDTO } from "./user.dto";
import UserModel from "./user.model";

// export interface IUserDocument extends IUser, Document {}

export const findUsers = async (
  searchRequest: FilterQuery<IUser>,
  options?: QueryOptions<IUser>,
): Promise<IUser[]> => {
  try {
    const users = await UserModel.find(searchRequest, { password_hash: 0 })
      .skip(options?.skip || 0)
      .limit(options?.limit || 0)
      .sort(options?.sort || {})
      .lean({ virtuals: ["id"] });
    return users;
  } catch (error) {
    throw error;
  }
};

export const findUsersCount = async (
  searchRequest: FilterQuery<IUser>,
): Promise<number> => {
  try {
    const count = await UserModel.find(searchRequest, {
      password_hash: 0,
    }).countDocuments();
    return count;
  } catch (error) {
    throw error;
  }
};

export const findUserByEmail = async (email: string): Promise<IUser | null> => {
  try {
    const serializedEmail = email.toLowerCase().trim();
    const userDoc = await UserModel.findOne(
      { email: serializedEmail },
      { password_hash: 0 },
    );
    const user: Optional<IUserWithPassword, "password_hash"> | null =
      userDoc?.toObject() || null;
    if (user) {
      delete user.password_hash;
    }
    return user;
  } catch (error) {
    throw error;
  }
};

export const findUserByUsername = async (
  username: string,
): Promise<IUser | null> => {
  try {
    const serializedUsername = username.toLowerCase().trim();

    const userDoc = await UserModel.findOne(
      { username: serializedUsername },
      { password_hash: 0 },
    );

    const user: Optional<IUserWithPassword, "password_hash"> | null =
      userDoc?.toObject() || null;

    if (user) {
      delete user.password_hash;
    }

    return user;
  } catch (error) {
    throw error;
  }
};

export const findUserWithPasswordByEmail = async (
  email: string,
): Promise<IUserWithPassword | null> => {
  try {
    const serializedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: serializedEmail });
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const findUserWithPasswordByUsername = async (
  username: string,
): Promise<IUserWithPassword | null> => {
  try {
    const serializedUsername = username.toLowerCase().trim();

    const userDoc = await UserModel.findOne({ username: serializedUsername });

    const user: IUserWithPassword | null = userDoc?.toObject() || null;

    return user;
  } catch (error) {
    throw error;
  }
};

export const findUserById = async (
  userId: string | Id,
): Promise<IUser | null> => {
  try {
    const user = await UserModel.findById(userId, { password_hash: 0 });
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const findUsersByIds = async (
  userIds: (string | Id)[],
): Promise<IUser[]> => {
  try {
    // turn to string from objectID
    userIds = userIds.map((id) => id.toString());

    const users = await UserModel.find(
      { _id: { $in: userIds } },
      { password_hash: 0 },
    );

    return users.map((user) => user.toObject());
  } catch (error) {
    throw error;
  }
};

export const findUserWithPasswordById = async (
  userId: string | Id,
): Promise<IUserWithPassword | null> => {
  try {
    const user = await UserModel.findById(userId);
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

export const createUser = async (
  userToCreate: CreateUserDTO | SignUpUserDTO,
): Promise<IUser> => {
  try {
    const createdUserDoc = await UserModel.create({
      password_hash: userToCreate.password,
      ...userToCreate,
    });
    const createdUser: Optional<IUserWithPassword, "password_hash"> =
      createdUserDoc.toObject();
    delete createdUser.password_hash;
    return createdUser as IUser;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (
  userToUpdate: UpdateUserDTO,
  options?: UpdateQueryOptions,
): Promise<IUser | null> => {
  try {
    const updatedUserDoc = await UserModel.findByIdAndUpdate(
      userToUpdate.id,
      { $set: { ...userToUpdate } },
      { new: options?.newDocument || false },
    );
    const updatedUser: Optional<IUserWithPassword, "password_hash"> | null =
      updatedUserDoc?.toObject() || null;
    if (updatedUser) {
      delete updatedUser.password_hash;
    }
    return updatedUser;
  } catch (error) {
    throw error;
  }
};

export const updateUserPassword = async (
  userId: string | Id,
  newHashedPassword: string,
  updated_by: Id | string,
): Promise<void> => {
  try {
    await UserModel.findByIdAndUpdate(userId, {
      $set: {
        password_hash: newHashedPassword,
        has_password: true,
        updated_on: new Date(),
        updated_by,
      },
    });
  } catch (error) {
    throw error;
  }
};

export const deleteUserById = async (
  userId: string | Id,
): Promise<IUser | null> => {
  try {
    const deletedUserDoc = await UserModel.findByIdAndDelete(newId(userId));
    const deletedUser: Optional<IUserWithPassword, "password_hash"> | null =
      deletedUserDoc?.toObject() || null;
    if (deletedUser) {
      delete deletedUser.password_hash;
    }
    return deletedUser;
  } catch (error) {
    throw error;
  }
};

export const deleteMultipleUsersById = async (
  userIds: (string | Id)[],
): Promise<number> => {
  try {
    const { deletedCount } = await UserModel.deleteMany({
      _id: { $in: userIds.map((id) => newId(id)) },
    });
    return deletedCount;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user with 2FA fields by ID
 * Uses .select() to include fields marked with select: false
 */
export const findUserWith2FAById = async (
  userId: string | Id,
): Promise<IUserWithPassword | null> => {
  try {
    await connectToDatabase();
    const user = await UserModel.findById(userId)
      .select("+two_fa_secret +two_fa_backup_codes +two_fa_backup_codes_used");
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user with 2FA fields by email
 * Uses .select() to include fields marked with select: false
 */
export const findUserWith2FAByEmail = async (
  email: string,
): Promise<IUserWithPassword | null> => {
  try {
    await connectToDatabase();
    const serializedEmail = email.toLowerCase().trim();
    const user = await UserModel.findOne({ email: serializedEmail })
      .select("+two_fa_secret +two_fa_backup_codes +two_fa_backup_codes_used");
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

/**
 * Find user with 2FA fields by username
 * Uses .select() to include fields marked with select: false
 */
export const findUserWith2FAByUsername = async (
  username: string,
): Promise<IUserWithPassword | null> => {
  try {
    await connectToDatabase();
    const user = await UserModel.findOne({ username: username.trim() })
      .select("+two_fa_secret +two_fa_backup_codes +two_fa_backup_codes_used");
    return user?.toObject() || null;
  } catch (error) {
    throw error;
  }
};
