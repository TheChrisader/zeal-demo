"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/app/_components/useRouter";
import { useForm } from "react-hook-form";
import { object, string, z } from "zod";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AuthHeader from "../_components/AuthHeader";
import { Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

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

  const onSubmit = (data: z.infer<typeof ResetPasswordFormSchema>) => {
    console.log(data);
    setIsLoading(true);
    try {
      // router.push("/signin");
    } catch (error) {
      // @ts-ignore
      if (error.status === 500) toast.error("Something went wrong");
      // @ts-ignore
      setError(error.message);
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
        <span className="mb-6 text-sm font-normal text-[#696969]">
          Kindly provide your new password
        </span>
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
