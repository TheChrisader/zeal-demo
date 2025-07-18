import { User } from "lucia";

export const checkUserWriterStatus = (user: User) => {
  return user.role === "writer" || user.role === "freelance_writer";
};

export const checkIsUserFreelance = (user: User) => {
  return user.role === "freelance_writer";
};

export const checkUserUpgradeStatus = (user: User) => {
  return user.upgrade_pending;
};
