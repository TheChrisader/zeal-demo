import { Id } from "@/lib/database";

export const UserRoles = [
  "admin",
  "user",
  "writer",
  "freelance_writer",
] as const;
export type UserRole = (typeof UserRoles)[number];

export const AuthProviders = ["email", "google"] as const;
export type AuthProvider = (typeof AuthProviders)[number];

export const Genders = ["male", "female", "unspecified"] as const;
export type Gender = (typeof Genders)[number];

export interface IUser {
  id: Id | string;
  email: string;
  has_email_verified: boolean;
  role: UserRole;
  username: string;
  auth_provider: AuthProvider;
  birth_date: Date | null;
  display_name: string;
  gender: Gender;
  avatar: string | null;
  profile_banner: string | null;
  is_disabled: boolean;
  last_login_at: Date;
  has_password: boolean;
  upgrade_pending: boolean;
  location: string;
  ip_address: string;
  bio: string | null;
  referral_code: string | null;
  referral_count: number;
  referred_by: Id | null;
  two_fa_enabled: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface IUserWithPassword extends IUser {
  password_hash: string;
  two_fa_secret?: string | null; // Encrypted JSON string, not exposed in API responses
  two_fa_backup_codes?: string[]; // Hashed backup codes, not exposed in API responses
  two_fa_backup_codes_used?: string[]; // Used backup codes, not exposed in API responses
}

export interface IUserWithStrictId extends Omit<IUser, "id"> {
  _id: Id;
}

export interface IUpdateUser extends Partial<IUser> {
  id: Id | string;
}
