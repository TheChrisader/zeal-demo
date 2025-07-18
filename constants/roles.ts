import { UserRole } from "@/types/user.type";

export const ROLE_MAP: Record<UserRole, string> = {
  admin: "Admin",
  user: "User",
  writer: "Writer",
  freelance_writer: "Freelance Writer",
};

export const DEFAULT_WHITELIST: UserRole[] = [
  "user",
  "writer",
  "freelance_writer",
];
export const WRITER_WHITELIST: UserRole[] = ["writer", "freelance_writer"];
export const STRICT_WRITER_WHITELIST: UserRole[] = ["writer"];
