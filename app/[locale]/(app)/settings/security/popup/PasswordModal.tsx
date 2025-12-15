"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { AnimatePresence, motion } from "framer-motion";
import { AlertCircle, Eye, EyeOff } from "lucide-react";
import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { z } from "zod";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import {
  requestPasswordReset,
  resetPassword,
  validateOTP,
} from "@/services/password-reset.services";

// Form validation schemas
const OTPFormSchema = z.object({
  otp: z
    .string()
    .min(6, "OTP must be 6 characters")
    .max(6, "OTP must be 6 characters"),
});

const PasswordFormSchema = z
  .object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z
      .string()
      .min(8, "Password must be at least 8 characters"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

type Step = "initial" | "verifyOtp" | "resetPassword" | "success";

// Animation variants for transitions
const contentVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
  exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
};

// Step tracker configuration
const steps = [
  { id: "initial", label: "Start" },
  { id: "verifyOtp", label: "Verify" },
  { id: "resetPassword", label: "Reset" },
  { id: "success", label: "Done" },
];

export default function PasswordModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user } = useAuth();
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState<Step>("initial");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Form for OTP verification
  const otpForm = useForm<z.infer<typeof OTPFormSchema>>({
    resolver: zodResolver(OTPFormSchema),
    defaultValues: {
      otp: "",
    },
  });

  // Form for password reset
  const passwordForm = useForm<z.infer<typeof PasswordFormSchema>>({
    resolver: zodResolver(PasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Reset state when dialog closes
  useEffect(() => {
    if (!open) {
      setStep("initial");
      setError("");
      otpForm.reset();
      passwordForm.reset();
      setShowPassword(false);
      setShowConfirmPassword(false);
    }
  }, [open, otpForm, passwordForm]);

  // Handle sending OTP
  const handleSendOTP = async () => {
    if (!user?.email) {
      setError("User email not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await requestPasswordReset(user.email);
      setStep("verifyOtp");
      toast.success("OTP sent to your email");
    } catch (err: unknown) {
      setError("Failed to send OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle OTP verification
  const onOtpSubmit = async (data: z.infer<typeof OTPFormSchema>) => {
    if (!user?.email) {
      setError("User email not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await validateOTP({
        email: user.email,
        otp: data.otp,
      });
      setStep("resetPassword");
    } catch (err: unknown) {
      setError("Invalid OTP");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle password reset
  const onPasswordSubmit = async (data: z.infer<typeof PasswordFormSchema>) => {
    if (!user?.email) {
      setError("User email not found");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await resetPassword({
        email: user.email,
        password: data.password,
      });
      setStep("success");
      toast.success("Password updated successfully");
    } catch (err: unknown) {
      setError("Failed to update password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="unstyled"
          size="unstyled"
          className="flex items-center justify-center gap-2 p-2"
        >
          {children}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader className="space-y-4">
          <DialogTitle>
            {step === "initial" && "Change Password"}
            {step === "verifyOtp" && "Verify OTP"}
            {step === "resetPassword" && "Set New Password"}
            {step === "success" && "Password Updated"}
          </DialogTitle>
          <Separator />

          {/* Step Tracker */}
          <div className="flex justify-between px-2 pt-2">
            {steps.map((s, index) => {
              const isActive = steps.findIndex((st) => st.id === step) >= index;
              return (
                <div key={s.id} className="relative flex flex-col items-center">
                  <div
                    className={`z-10 flex size-8 items-center justify-center rounded-full transition-colors ${isActive ? "bg-primary text-special-text" : "bg-gray-200 text-gray-500"}`}
                  >
                    {index + 1}
                  </div>
                  <span className="mt-1 text-xs">{s.label}</span>
                  {index < steps.length - 1 && (
                    <div
                      className={`absolute left-1/2 top-[30%] h-[2px] w-[100px] transition-colors ${isActive && steps.findIndex((st) => st.id === step) > index ? "bg-primary" : "bg-gray-200"}`}
                    />
                  )}
                  {index > 0 && (
                    <div
                      className={`absolute right-1/2 top-[30%] h-[2px] w-[100px] transition-colors ${isActive && steps.findIndex((st) => st.id === step) >= index ? "bg-primary" : "bg-gray-200"}`}
                    />
                  )}
                </div>
              );
            })}
          </div>

          <DialogDescription>
            {step === "initial" &&
              "To change your password you will be required to verify it's you by providing an OTP that will be sent to your email"}
            {step === "verifyOtp" &&
              "Enter the 6-digit OTP code sent to your email"}
            {step === "resetPassword" &&
              "Create a new password for your account"}
            {step === "success" &&
              "Your password has been updated successfully"}
          </DialogDescription>
        </DialogHeader>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="size-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <AnimatePresence mode="wait">
          {step === "verifyOtp" && (
            <motion.div
              key="verify-otp"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <Form {...otpForm}>
                <form
                  onSubmit={otpForm.handleSubmit(onOtpSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={otpForm.control}
                    name="otp"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>OTP Code</FormLabel>
                        <FormControl>
                          <Input placeholder="Enter 6-digit OTP" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Verifying..." : "Verify OTP"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === "resetPassword" && (
            <motion.div
              key="reset-password"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <Form {...passwordForm}>
                <form
                  onSubmit={passwordForm.handleSubmit(onPasswordSubmit)}
                  className="space-y-4"
                >
                  <FormField
                    control={passwordForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>New Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showPassword ? "text" : "password"}
                              placeholder="Enter new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() => setShowPassword(!showPassword)}
                            >
                              {showPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={passwordForm.control}
                    name="confirmPassword"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Confirm Password</FormLabel>
                        <FormControl>
                          <div className="relative">
                            <Input
                              type={showConfirmPassword ? "text" : "password"}
                              placeholder="Confirm new password"
                              {...field}
                            />
                            <Button
                              type="button"
                              variant="ghost"
                              size="icon"
                              className="absolute right-0 top-0 h-full px-3"
                              onClick={() =>
                                setShowConfirmPassword(!showConfirmPassword)
                              }
                            >
                              {showConfirmPassword ? (
                                <EyeOff className="size-4" />
                              ) : (
                                <Eye className="size-4" />
                              )}
                            </Button>
                          </div>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <Button
                    type="submit"
                    className="w-full rounded-full"
                    disabled={isLoading}
                  >
                    {isLoading ? "Updating..." : "Update Password"}
                  </Button>
                </form>
              </Form>
            </motion.div>
          )}

          {step === "initial" && (
            <motion.div
              key="initial"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <DialogFooter>
                <Button
                  className="w-full rounded-full"
                  onClick={handleSendOTP}
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Proceed to verify"}
                </Button>
              </DialogFooter>
            </motion.div>
          )}

          {step === "success" && (
            <motion.div
              key="success"
              initial="hidden"
              animate="visible"
              exit="exit"
              variants={contentVariants}
            >
              <div className="flex flex-col items-center justify-center py-6">
                <div className="mb-4 flex size-16 items-center justify-center rounded-full bg-green-100">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="size-8 text-green-600"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <h3 className="mb-2 text-lg font-medium">
                  Password Updated Successfully
                </h3>
                <p className="mb-6 text-center text-sm text-gray-500">
                  Your password has been changed. You can now use your new
                  password to log in.
                </p>
              </div>
              <DialogFooter>
                <DialogClose asChild>
                  <Button className="w-full rounded-full">Close</Button>
                </DialogClose>
              </DialogFooter>
            </motion.div>
          )}
        </AnimatePresence>
      </DialogContent>
    </Dialog>
  );
}
