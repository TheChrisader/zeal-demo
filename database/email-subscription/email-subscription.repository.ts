import mongoose from "mongoose";
import { newId } from "@/lib/database";
import {
  EmailSubscriptionStatuses,
  IEmailSubscription,
} from "@/types/email-subscription.type";
import EmailSubscriptionModel from "./email-subscription.model";

type CreateEmailSubscriptionInput = {
  subscriber_id: string;
  list_id: string;
  status?: (typeof EmailSubscriptionStatuses)[number];
};

type UpdateEmailSubscriptionInput = {
  subscriber_id: string;
  list_id: string;
  data: Partial<IEmailSubscription>;
};

export const createEmailSubscription = async ({
  subscriber_id,
  list_id,
  status = "subscribed",
}: CreateEmailSubscriptionInput): Promise<IEmailSubscription> => {
  try {
    const subscriptionData = {
      subscriber_id: newId(subscriber_id),
      list_id,
      status,
      subscribed_at: new Date(),
    };

    const newSubscription =
      await EmailSubscriptionModel.create(subscriptionData);
    return newSubscription;
  } catch (error) {
    if (error instanceof mongoose.Error.ValidationError) {
      throw new Error("Invalid email subscription data");
    }
    throw error;
  }
};

export const findEmailSubscription = async (
  subscriber_id: string,
  list_id: string,
): Promise<IEmailSubscription | null> => {
  return await EmailSubscriptionModel.findOne({
    subscriber_id: newId(subscriber_id),
    list_id,
  });
};

export const findEmailSubscriptionsBySubscriber = async (
  subscriber_id: string,
): Promise<IEmailSubscription[]> => {
  return await EmailSubscriptionModel.find({
    subscriber_id: newId(subscriber_id),
  });
};

export const findEmailSubscriptionsByList = async (
  list_id: string,
  status?: (typeof EmailSubscriptionStatuses)[number],
): Promise<IEmailSubscription[]> => {
  const query: {
    list_id: string;
    status?: (typeof EmailSubscriptionStatuses)[number];
  } = { list_id };
  if (status) {
    query.status = status;
  }
  return await EmailSubscriptionModel.find(query);
};

export const updateEmailSubscription = async ({
  subscriber_id,
  list_id,
  data,
}: UpdateEmailSubscriptionInput): Promise<IEmailSubscription | null> => {
  return await EmailSubscriptionModel.findOneAndUpdate(
    { subscriber_id: newId(subscriber_id), list_id },
    { $set: data },
    { new: true },
  );
};

export const subscribeToList = async (
  subscriber_id: string,
  list_id: string,
): Promise<IEmailSubscription> => {
  const existing = await findEmailSubscription(subscriber_id, list_id);

  if (existing) {
    return (await updateEmailSubscription({
      subscriber_id,
      list_id,
      data: {
        status: "subscribed",
        subscribed_at: new Date(),
        unsubscribed_at: undefined,
      },
    })) as IEmailSubscription;
  }

  return await createEmailSubscription({
    subscriber_id,
    list_id,
    status: "subscribed",
  });
};

export const unsubscribeFromList = async (
  subscriber_id: string,
  list_id: string,
): Promise<IEmailSubscription | null> => {
  return await updateEmailSubscription({
    subscriber_id,
    list_id,
    data: {
      status: "unsubscribed",
      unsubscribed_at: new Date(),
    },
  });
};

export const deleteEmailSubscription = async (
  subscriber_id: string,
  list_id: string,
): Promise<boolean> => {
  const result = await EmailSubscriptionModel.deleteOne({
    subscriber_id: newId(subscriber_id),
    list_id,
  });
  return result.deletedCount > 0;
};

export const deleteEmailSubscriptionsBySubscriber = async (
  subscriber_id: string,
): Promise<boolean> => {
  const result = await EmailSubscriptionModel.deleteMany({
    subscriber_id: newId(subscriber_id),
  });
  return result.deletedCount > 0;
};

export const bulkSubscribeToList = async (
  subscriber_ids: string[],
  list_id: string,
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const subscriber_id of subscriber_ids) {
    try {
      await subscribeToList(subscriber_id, list_id);
      success++;
    } catch (error) {
      console.error(
        `Failed to subscribe ${subscriber_id} to list ${list_id}:`,
        error,
      );
      failed++;
    }
  }

  return { success, failed };
};

export const bulkUnsubscribeFromList = async (
  subscriber_ids: string[],
  list_id: string,
): Promise<{ success: number; failed: number }> => {
  let success = 0;
  let failed = 0;

  for (const subscriber_id of subscriber_ids) {
    try {
      await unsubscribeFromList(subscriber_id, list_id);
      success++;
    } catch (error) {
      console.error(
        `Failed to unsubscribe ${subscriber_id} from list ${list_id}:`,
        error,
      );
      failed++;
    }
  }

  return { success, failed };
};
