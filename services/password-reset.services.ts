import { fetcher } from "@/lib/fetcher";

/**
 * Request a password reset by sending an email with an OTP to the user's email address.
 * @param email The email address of the user requesting a password reset
 * @returns A promise that resolves to a message indicating the status of the request
 */
export const requestPasswordReset = async (
  email: string,
): Promise<{ message: string }> => {
  try {
    const data = await fetcher("/api/v1/auth/password-reset/request", {
      method: "POST",
      body: JSON.stringify({ email }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Validate the OTP sent to the user's email
 * @param email The email address of the user
 * @param otp The one-time password sent to the user's email
 * @returns A promise that resolves to a message and userId if validation is successful
 */
export const validateOTP = async ({
  email,
  otp,
}: {
  email: string;
  otp: string;
}): Promise<{ message: string; userId: string }> => {
  try {
    const data = await fetcher("/api/v1/auth/password-reset/validate-otp", {
      method: "POST",
      body: JSON.stringify({ email, otp }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Reset the user's password after OTP validation
 * @param email The email address of the user
 * @param userId The ID of the user (obtained from OTP validation)
 * @param password The new password to set
 * @returns A promise that resolves to a message indicating the status of the password reset
 */
export const resetPassword = async ({
  email,
  password,
}: {
  email: string;
  password: string;
}): Promise<{ message: string }> => {
  try {
    const data = await fetcher("/api/v1/auth/password-reset/verify", {
      method: "POST",
      body: JSON.stringify({ email, password }),
      headers: {
        "Content-Type": "application/json",
      },
    });
    return data;
  } catch (error) {
    throw error;
  }
};

/**
 * Legacy function for backward compatibility
 * @deprecated Use validateOTP and resetPassword instead
 */
export const verifyAndResetPassword = async ({
  email,
  otp,
  password,
}: {
  email: string;
  otp: string;
  password: string;
}): Promise<{ message: string }> => {
  try {
    // First validate the OTP
    const { userId } = await validateOTP({ email, otp });

    // Then reset the password
    return await resetPassword({ email, password });
  } catch (error) {
    throw error;
  }
};
