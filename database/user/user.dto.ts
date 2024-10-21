import { object, string, z } from "zod";

import { Id } from "@/lib/database";
import { AuthProvider, Gender, UserRoles } from "@/types/user.type";

export const SignUpUserSchema = object({
  email: string()
    .email("Please provide a valid email address.")
    .min(1, "Please provide a valid email address."),
  username: string().min(1, "Please provide a valid username."),
  display_name: string().min(1, "Please provide a valid name."),
  password: string().min(8, "At least 8 characters."),
});

export type SignUpUserDTO = z.infer<typeof SignUpUserSchema>;

export const LoginUserSchema = object({
  username: string().min(1, "Please provide a valid username."),
  password: string().min(8, "At least 8 characters."),
});

export type LoginUserDTO = z.infer<typeof LoginUserSchema>;

export const CreateUserSchema = object({
  username: string().min(1, "Please provide a valid username."),
  email: string()
    .email("Please provide a valid email address.")
    .min(1, "Please provide a valid email address."),
  role: z.enum(UserRoles).default("user"),
  password: string().min(8, "At least 8 characters."),
  display_name: string().min(1, "Please provide a valid name."),
});

export type CreateUserDTO = z.infer<typeof CreateUserSchema> & {
  auth_provider: AuthProvider;
  has_email_verified: boolean;
  gender: Gender;
  is_disabled: boolean;
  last_login_at: Date;
  has_password: boolean;
  is_creator: boolean;
  location: string;
  ip_address: string;
  avatar?: string;
};

export const UpdateUserSchema = object({
  username: string().optional(),
  email: string().email().optional(),
  display_name: string().optional(),
  role: z.enum(UserRoles).optional(),
  gender: z.enum(["male", "female", "unspecified"]).optional(),
  location: string().optional(),
  ip_address: string().optional(),
  bio: string().optional(),
  is_disabled: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  avatar: string().optional(),
  profile_banner: string().optional(),
  auth_provider: z.enum(["email", "google"]).optional(),
});

export type UpdateUserDTO = Omit<
  z.infer<typeof UpdateUserSchema>,
  "id" | "role"
> & {
  id: Id | string;
  has_email_verified?: boolean;
  last_login_at?: Date;
};

export const UpdateUserAccountSchema = object({
  username: string().optional(),
  display_name: string().optional(),
  role: z.enum(UserRoles).optional(),
  gender: z.enum(["male", "female", "unspecified"]).optional(),
  location: string().optional(),
  ip_address: string().optional(),
  bio: string().optional(),
  is_disabled: z
    .enum(["true", "false"])
    .transform((value) => value === "true")
    .optional(),
  avatar: string().optional(),
  profile_banner: string().optional(),
  auth_provider: z.enum(["email", "google"]).optional(),
})
  .partial()
  .refine(
    (data) => {
      return Object.keys(data).length > 0;
    },
    { message: "Please provide at least one field to update." },
  );

export const UpdateUserEmailSchema = object({
  email: string()
    .email("Please provide a valid email address.")
    .min(1, "Please provide a valid email address."),
  password: string().min(8, "At least 8 characters."),
});

export const UpdateUserPasswordSchema = object({
  password: string().min(8, "At least 8 characters."),
  oldPassword: string().min(8, "At least 8 characters."),
});
