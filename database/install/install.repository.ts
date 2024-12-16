import { newId } from "@/lib/database";
import { IInstall } from "@/types/install.type";
import InstallModel from "./install.model";

export const createInstallDoc = async (data: IInstall) => {
  try {
    const newInstall = await InstallModel.create({
      ...data,
      user_id: data.user_id ? newId(data.user_id) : undefined,
    });
    return newInstall.toObject();
  } catch (error) {
    throw error;
  }
};
