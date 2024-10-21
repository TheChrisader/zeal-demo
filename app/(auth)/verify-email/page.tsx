"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { useSearchParams } from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import {
  InputOTP,
  InputOTPGroup,
  InputOTPSlot,
} from "@/components/ui/input-otp";
import AuthHeader from "../_components/AuthHeader";
import { VerifyEmail } from "@/services/auth.services";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

const ConfirmEmailPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const forgotPasswordParam = useSearchParams().get("forgot_password");

  const FormSchema = z
    .object({
      otp: z
        .string()
        .min(6, { message: "OTP must be 6 characters long" })
        .max(6, { message: "OTP must be 6 characters long" }),
    })
    .required();

  const form = useForm<z.infer<typeof FormSchema>>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      otp: "",
    },
  });

  const onSubmit = async (data: z.infer<typeof FormSchema>) => {
    setIsLoading(true);
    const { otp } = data;
    try {
      await VerifyEmail(otp);
      if (forgotPasswordParam) {
        router.push("/reset-password");
      } else {
        router.push("/onboarding");
      }
    } catch (err) {
      console.log(err);
      // @ts-ignore
      if (err.status === 500) toast.error("Something went wrong");
      // @ts-ignore
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <AuthHeader title="Verify Email">
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
          Kindly provide the OTP that has been sent to the provided email
        </span>
        <div className="mb-10 flex w-full flex-col justify-center">
          <FormField
            control={form.control}
            name="otp"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <InputOTP maxLength={6} {...field}>
                    <InputOTPGroup>
                      <InputOTPSlot index={0} />
                      <InputOTPSlot index={1} />
                      <InputOTPSlot index={2} />
                      <InputOTPSlot index={3} />
                      <InputOTPSlot index={4} />
                      <InputOTPSlot index={5} />
                    </InputOTPGroup>
                  </InputOTP>
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {error && !isLoading && (
            <p className="-mt-1 font-bold text-red-500">{error}</p>
          )}
        </div>
        <Button
          className="mb-6 w-full rounded-full"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? (
            <Loader2 className="size-4 animate-spin" />
          ) : (
            "Verify Email"
          )}
        </Button>
        <span className="mb-4 text-center text-sm font-normal text-[#959595]">
          Didn’t get a mail?{" "}
          <span className="font-bold text-[#2F7830]">Resend</span>
        </span>
      </form>
    </Form>
  );
};

export default ConfirmEmailPage;
