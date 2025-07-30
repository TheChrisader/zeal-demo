import { User } from "lucia";

export const checkUserWriterStatus = (user: User | null) => {
  if (!user) return false;
  return user?.role === "writer" || user?.role === "freelance_writer";
};

export const checkIsUserFreelance = (user?: User | null) => {
  if (!user) return false;
  return user?.role === "freelance_writer";
};

export const checkUserUpgradeStatus = (user?: User | null) => {
  if (!user) return false;
  return user?.upgrade_pending;
};
