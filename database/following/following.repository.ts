import { ClientSession } from "mongoose";
import { Id } from "@/lib/database";

import { IFollowing } from "@/types/following.type";

import FollowingModel from "./following.model";

// create following
export const createFollowing = async (
  userId: string | Id,
  followingId: string | Id,
  session: ClientSession,
): Promise<IFollowing> => {
  try {
    const createdFollowingDoc = await FollowingModel.create(
      [
        {
          user_id: userId,
          following_id: followingId,
        },
      ],
      {
        session,
      },
    );
    const createdFollowing: IFollowing = createdFollowingDoc[0]!.toObject();
    return createdFollowing;
  } catch (error) {
    throw error;
  }
};

// get all following by user id
// TODO: add pagination, sorting, filtering, search
export const getFollowingsByUserId = async (
  userId: string | Id,
): Promise<IFollowing[]> => {
  try {
    const followings = await FollowingModel.find({ user_id: userId });
    return followings.map((following) => following.toObject());
  } catch (error) {
    throw error;
  }
};

// get all followers by user id
// TODO: add pagination, sorting, filtering, search
export const getFollowersByUserId = async (
  userId: string | Id,
): Promise<IFollowing[]> => {
  try {
    const followings = await FollowingModel.find({ following_id: userId });
    return followings.map((following) => following.toObject());
  } catch (error) {
    throw error;
  }
};

// delete a following by user id
export const deleteFollowing = async (
  userId: string | Id,
  followingId: string | Id,
  session: ClientSession,
): Promise<IFollowing | null> => {
  try {
    const deletedFollowingDoc = await FollowingModel.findOneAndDelete(
      {
        user_id: userId,
        following_id: followingId,
      },
      { session },
    );
    return deletedFollowingDoc?.toObject() || null;
  } catch (error) {
    throw error;
  }
};

// check if a user is following another user
export const checkFollowing = async (
  userId: string | Id,
  followingId: string | Id,
): Promise<boolean> => {
  try {
    const following = await FollowingModel.findOne({
      user_id: userId,
      following_id: followingId,
    });
    return !!following;
  } catch (error) {
    throw error;
  }
};
