import { lucia } from "@/lib/auth/auth";
import { Id } from "@/lib/database";
import { IUser } from "./user.type";

interface DatabaseSessionAttributes {
  two_fa_pending?: boolean;
  two_fa_verified_at?: Date | null;
}

declare module "lucia" {
  interface Register {
    Lucia: typeof lucia;
    DatabaseSessionAttributes: DatabaseSessionAttributes;
    DatabaseUserAttributes: Partial<IUser>;
    UserId: Id | string;
  }
}
