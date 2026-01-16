import { fetcher } from "@/lib/fetcher";

import { IUser } from "@/types/user.type";

export const getCurrentLoggedInUser = async (): Promise<IUser | null> => {
  try {
    const data = await fetcher("/api/v1/auth/account");
    return data;
  } catch (error) {
    throw error;
  }
};

export const SignUpUserWithEmailAndPassword = async ({
  display_name,
  username,
  email,
  password,
  referral_code,
  newsletter_opt_in = false,
  phone,
  source,
  terms_accepted = false,
}: {
  display_name: string;
  email: string;
  password: string;
  username: string;
  referral_code?: string;
  newsletter_opt_in?: boolean;
  phone?: string;
  source?: string;
  terms_accepted?: boolean;
}): Promise<IUser | null> => {
  try {
    const data = await fetcher("/api/v1/auth/signup", {
      method: "POST",
      body: JSON.stringify({
        display_name,
        email,
        password,
        username: username.trim().toLowerCase(),
        ...(referral_code && { referral_code }),
        newsletter_opt_in,
        ...(phone && { phone }),
        ...(source && { source }),
        ...(terms_accepted && { terms_accepted }),
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const SignInUserWithUsernameAndPassword = async ({
  username,
  password,
}: {
  username: string;
  password: string;
}): Promise<IUser | null> => {
  try {
    const data = await fetcher("/api/v1/auth/signin", {
      method: "POST",
      body: JSON.stringify({
        username,
        password,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const SignUserWithoutPassword = async (
  user: Partial<IUser>,
): Promise<{ message: string; user: IUser | null }> => {
  try {
    const data = await fetcher("/api/v1/auth/signin/without-password", {
      method: "POST",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const VerifyEmail = async (otp: string) => {
  try {
    const data = await fetcher("/api/v1/auth/verify-email", {
      method: "POST",
      body: JSON.stringify({
        otp,
      }),
      headers: {
        "Content-Type": "application/json",
      },
    });

    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUser = async (user: Partial<IUser>) => {
  try {
    const data = await fetcher("/api/v1/auth/account", {
      method: "PUT",
      body: JSON.stringify(user),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

export const updateUserAvatar = async (file: File): Promise<IUser | null> => {
  try {
    const formData = new FormData();
    formData.append("avatar", file);
    const data = await fetcher("/api/v1/auth/account/avatar", {
      method: "PUT",
      body: formData,
    });
    return data;
  } catch (error) {
    throw error;
  }
};
