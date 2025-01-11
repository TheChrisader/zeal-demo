import mongoose from "mongoose";
import { PushSubscription } from "web-push";
import { ISubscription } from "@/types/subscription.type";
import SubscriptionModel from "./subscription.model";
import { newId } from "@/lib/database";

type CreateSubscriptionInput = {
  subscription: PushSubscription;
  user_id?: string;
};

type UpdateSubscriptionInput = {
  endpoint: string;
  data: Partial<Omit<ISubscription, "user_id"> & { user_id?: string }>;
};

export const createSubscription = async ({
  subscription,
  user_id,
}: CreateSubscriptionInput): Promise<ISubscription> => {
  try {
    const subscriptionData = {
      endpoint: subscription.endpoint,
      expirationTime: subscription.expirationTime,
      keys: {
        p256dh: subscription.keys.p256dh,
        auth: subscription.keys.auth,
      },
      ...(user_id && { user_id: newId(user_id) }),
    };

    const newSubscription = await SubscriptionModel.create(subscriptionData);
    return newSubscription;
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new Error("Invalid subscription data");
    }
    throw error;
  }
};

export const findSubscriptionByEndpoint = async (
  endpoint: string,
): Promise<ISubscription | null> => {
  return await SubscriptionModel.findOne({ endpoint });
};

export const findSubscriptionsByUserId = async (
  user_id: string,
): Promise<ISubscription[]> => {
  return await SubscriptionModel.find({ user_id: newId(user_id) });
};

export const updateSubscription = async ({
  endpoint,
  data,
}: UpdateSubscriptionInput): Promise<ISubscription | null> => {
  return await SubscriptionModel.findOneAndUpdate(
    { endpoint },
    {
      $set: { ...data, ...(data.user_id && { user_id: newId(data.user_id) }) },
    },
    { new: true },
  );
};

export const deleteSubscription = async (
  endpoint: string,
): Promise<boolean> => {
  const result = await SubscriptionModel.deleteOne({ endpoint });
  return result.deletedCount > 0;
};

export const deleteSubscriptionsByUserId = async (
  user_id: string,
): Promise<boolean> => {
  const result = await SubscriptionModel.deleteMany({
    user_id: newId(user_id),
  });
  return result.deletedCount > 0;
};

export const validateSubscription = (
  subscription: PushSubscription,
): boolean => {
  return Boolean(
    subscription.endpoint &&
      subscription.keys &&
      subscription.keys.p256dh &&
      subscription.keys.auth,
  );
};

export const isSubscriptionExpired = (subscription: ISubscription): boolean => {
  if (!subscription.expirationTime) return false;
  return Date.now() > subscription.expirationTime;
};
