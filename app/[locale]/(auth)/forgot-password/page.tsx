"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "@/app/_components/useRouter";
import { useForm } from "react-hook-form";
import { object, string, z } from "zod";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import AuthHeader from "../_components/AuthHeader";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ForgotPasswordPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const ForgotPasswordFormSchema = object({
    email: string()
      .email("Must be a valid email address")
      .min(1, "Email is required"),
  }).required();

  const form = useForm({
    resolver: zodResolver(ForgotPasswordFormSchema),
    defaultValues: {
      email: "",
    },
  });

  const onSubmit = (data: z.infer<typeof ForgotPasswordFormSchema>) => {
    console.log(data);
    setIsLoading(true);
    try {
    } catch (error) {
      // @ts-ignore
      if (error.status === 500) toast.error("Something went wrong");
      // @ts-ignore
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
    // router.push("/verify-email?forgot_password=true");
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <AuthHeader title="Forgot Password">
          <Button
            variant={"link"}
            size={"unstyled"}
            onClick={() => router.back()}
            className="cursor-pointer text-sm font-normal text-[#9CA3AF] underline"
          >
            Go back
          </Button>
        </AuthHeader>
        <span className="text-muted-alt mb-7 text-sm font-normal">
          Kindly provide your email address to reset your password
        </span>
        <div className="mb-7">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="Email Address"
                    type="email"
                    id="email"
                    placeholder="AyeniBolu@gmail.com"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
        </div>
        <Button className="mb-6 w-full rounded-full" disabled={isLoading}>
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Verify Email"
          )}
        </Button>
      </form>
    </Form>
  );
};

export default ForgotPasswordPage;
