"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { object, string, z } from "zod";
import { useRouter } from "@/app/_components/useRouter";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { resetPassword } from "@/services/password-reset.services";
import AuthHeader from "../_components/AuthHeader";

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();

  // Extract userId and email from URL parameters
  const email = searchParams.get("email");

  // Check if required parameters are present
  useEffect(() => {
    if (!email) {
      toast.error("Invalid password reset link");
      setError("Invalid password reset link. Please request a new one.");
    }
  }, [email]);

  const ResetPasswordFormSchema = object({
    password: string().min(1, "Password is required"),
    confirmPassword: string().min(1, "Confirm Password is required"),
  }).refine((data) => data.password === data.confirmPassword, {
    path: ["confirmPassword"],
    message: "Passwords do not match",
  });

  const form = useForm<z.infer<typeof ResetPasswordFormSchema>>({
    resolver: zodResolver(ResetPasswordFormSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof ResetPasswordFormSchema>) => {
    console.log(data);
    setIsLoading(true);

    // Check if required parameters are present
    if (!email) {
      setError("Invalid password reset link. Please request a new one.");
      toast.error("Invalid password reset link");
      setIsLoading(false);
      return;
    }

    try {
      // Call the resetPassword function from the password-reset service
      const response = await resetPassword({
        email,
        password: data.password,
      });

      // Show success message
      toast.success(response.message || "Password reset successful");

      // Redirect to sign-in page
      router.push("/signin");
    } catch (error: unknown) {
      console.error("Error resetting password:", error);
      // if (error.status === 500) {
      //   toast.error("Something went wrong");
      // } else {
      //   toast.error(error.message || "Failed to reset password");
      // }
      toast.error("Failed to reset password");
      setError("Failed to reset password");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <AuthHeader title="Reset Password">
          <Button
            variant={"link"}
            size={"unstyled"}
            onClick={() => router.back()}
            className="cursor-pointer text-sm font-normal text-[#9CA3AF] underline"
          >
            Go back
          </Button>
        </AuthHeader>
        <span className="text-muted-alt mb-6 text-sm font-normal">
          Kindly provide your new password
        </span>
        {error && (
          <div className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-500">
            {error}
          </div>
        )}
        <div className="mb-8 flex flex-col gap-7">
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="New Password"
                    type="password"
                    id="new-password"
                    placeholder="Ayeni.B"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="confirmPassword"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="Confirm Password"
                    type="password"
                    id="confirm-password"
                    placeholder="Ayeni.B"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <Button
          className="mb-6 w-full rounded-full"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Save New Password"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordPage;
