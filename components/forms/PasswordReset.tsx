"use client";

import { useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import { useTranslations } from "next-intl";
import { z } from "zod";

import {
  requestPasswordReset,
  verifyAndResetPassword,
} from "@/services/password-reset.services";

// Form validation schemas
const RequestSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

const VerifySchema = z
  .object({
    email: z.string().email("Please enter a valid email address"),
    otp: z.string().min(6, "OTP must be at least 6 characters"),
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Confirm password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type RequestFormData = z.infer<typeof RequestSchema>;
type VerifyFormData = z.infer<typeof VerifySchema>;

export default function PasswordReset() {
  const router = useRouter();
  const t = useTranslations("Auth");
  const [step, setStep] = useState<"request" | "verify">("request");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  // Handle request password reset form submission
  const handleRequestSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const email = formData.get("email") as string;

      // Validate form data
      const validatedData = RequestSchema.parse({ email });

      // Call the password reset service
      const response = await requestPasswordReset(validatedData.email);

      // Store email for the next step
      setEmail(validatedData.email);

      // Show success message and move to verify step
      setSuccess(response.message);
      setStep("verify");
    } catch (error: unknown) {
      console.error("Password reset request error:", error);
      setError(
        // error?.message ||
        "Failed to send password reset email. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  // Handle verify OTP and reset password form submission
  const handleVerifySubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const formData = new FormData(e.currentTarget);
      const data = {
        email: email || (formData.get("email") as string),
        otp: formData.get("otp") as string,
        password: formData.get("password") as string,
        confirmPassword: formData.get("confirmPassword") as string,
      };

      // Validate form data
      const validatedData = VerifySchema.parse(data);

      // Call the verify and reset password service
      const response = await verifyAndResetPassword({
        email: validatedData.email,
        otp: validatedData.otp,
        password: validatedData.password,
      });

      // Show success message and redirect to sign in page
      setSuccess(response.message);
      setTimeout(() => {
        router.push("/signin");
      }, 2000);
    } catch (error: unknown) {
      console.error("Password reset verification error:", error);
      setError(
        // error?.message ||
        "Failed to reset password. Please try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="mx-auto max-w-md rounded-lg bg-card-alt-bg p-6 shadow-md">
      <h2 className="mb-6 text-center text-2xl font-bold">
        {step === "request" ? t("resetPassword") : t("verifyAndSetNewPassword")}
      </h2>

      {error && (
        <div className="mb-4 rounded-md bg-red-100 p-3 text-red-700">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 rounded-md bg-green-100 p-3 text-green-700">
          {success}
        </div>
      )}

      {step === "request" ? (
        <form onSubmit={handleRequestSubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("email", { defaultMessage: "Email Address" })}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your email address"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2 font-medium text-special-text ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Sending..." : "Send Reset Instructions"}
          </button>
        </form>
      ) : (
        <form onSubmit={handleVerifySubmit}>
          <div className="mb-4">
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              {t("email", { defaultMessage: "Email Address" })}
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              defaultValue={email}
              readOnly={!!email}
              className="w-full rounded-md border border-gray-300 bg-gray-50 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="otp"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              OTP Code
            </label>
            <input
              type="text"
              id="otp"
              name="otp"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter the OTP sent to your email"
            />
          </div>

          <div className="mb-4">
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              New Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your new password"
            />
          </div>

          <div className="mb-6">
            <label
              htmlFor="confirmPassword"
              className="mb-1 block text-sm font-medium text-gray-700"
            >
              Confirm New Password
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              required
              className="w-full rounded-md border border-gray-300 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Confirm your new password"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className={`w-full rounded-md px-4 py-2 font-medium text-special-text ${loading ? "bg-blue-400" : "bg-blue-600 hover:bg-blue-700"}`}
          >
            {loading ? "Resetting..." : "Reset Password"}
          </button>

          <button
            type="button"
            onClick={() => setStep("request")}
            className="mt-3 w-full rounded-md border border-gray-300 px-4 py-2 font-medium text-gray-700 hover:bg-gray-50"
          >
            Back to Request
          </button>
        </form>
      )}
    </div>
  );
}
