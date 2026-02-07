"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { boolean, object, string, z } from "zod";
import { useRouter } from "@/app/_components/useRouter";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { useReferralClient } from "@/hooks/useReferralClient";
import { Link } from "@/i18n/routing";
import {
  SignInUserWithUsernameAndPassword,
  SignUpUserWithEmailAndPassword,
  SignUserWithoutPassword,
} from "@/services/auth.services";
import { decodeJWTResponse } from "@/utils/jwt.utils";
import AuthHeader from "../_components/AuthHeader";
import ContinueWithSeparator from "../_components/ContinueWithSeparator";
import SocialProviders from "../_components/SocialProviders";

const SignUpPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { referralCode } = useReferralClient();

  // Check if this is a promo signup
  const isPromo = searchParams?.get("promo") === "true";

  useEffect(() => {
    const script = document.createElement("script");
    script.id = "google-signin-script";
    script.src = "https://accounts.google.com/gsi/client";
    script.async = true;
    script.defer = true;
    script.onload = () => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        callback: async (data: { credential: string; select_by: string }) => {
          const user = decodeJWTResponse(data.credential);
          const res = await SignUserWithoutPassword({
            email: user.email,
            display_name: user.name,
            username: user.email.split("@")[0],
            has_email_verified: true,
            has_password: false,
            avatar: user.picture,
          });

          revalidatePathAction("/");
          if (res.message === "Created") {
            router.push("/onboarding");
          } else {
            router.push("/");
          }
        },
      });

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (window as any).google.accounts.id.prompt();
    };

    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, [router]);

  const SignUpFormSchema = object({
    name: string().min(1, "Name is required"),
    username: string().min(1, "Username is required"),
    email: string()
      .email("Must be a valid email address")
      .min(1, "Email is required"),
    password: string().min(1, "Password is required"),
    referral_code: string().optional(),
    newsletter_opt_in: boolean().optional().default(false),
  });

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
      referral_code: referralCode || "",
      newsletter_opt_in: false,
    },
    mode: "onTouched",
  });

  // Store promo mode in sessionStorage for later redirect
  useEffect(() => {
    if (isPromo) {
      sessionStorage.setItem("promo_signup", "true");
    }
  }, [isPromo]);

  // Update form when referral code is loaded
  useEffect(() => {
    if (referralCode) {
      form.setValue("referral_code", referralCode);
    }
  }, [referralCode, form]);

  // Receive transferred data from sessionStorage if from referral promo
  useEffect(() => {
    const transferredData = sessionStorage.getItem("referral_signup_data");
    if (transferredData) {
      try {
        const data = JSON.parse(transferredData);
        // Pre-fill relevant fields
        if (data.fullName) form.setValue("name", data.fullName);
        if (data.email) form.setValue("email", data.email);
        if (data.referral_code)
          form.setValue("referral_code", data.referral_code);
        if (data.newsletter_opt_in !== undefined)
          form.setValue("newsletter_opt_in", data.newsletter_opt_in);
        // Clear the transferred data after using it
        sessionStorage.removeItem("referral_signup_data");
      } catch (error) {
        console.error("Failed to parse transferred data:", error);
      }
    }
  }, [form]);

  // Watch the referral code input value to compare with the original referral code
  const currentReferralCode = form.watch("referral_code");

  const onSubmit = async (data: z.infer<typeof SignUpFormSchema>) => {
    const {
      name,
      username,
      email,
      password,
      referral_code,
      newsletter_opt_in,
    } = data;
    setIsLoading(true);
    try {
      // Get transferred referral metadata from sessionStorage
      const transferredDataRaw = sessionStorage.getItem(
        "referral_signup_metadata",
      );
      const transferredData = transferredDataRaw
        ? JSON.parse(transferredDataRaw)
        : {};

      await SignUpUserWithEmailAndPassword({
        display_name: name,
        username,
        email,
        password,
        ...(referral_code && { referral_code }),
        newsletter_opt_in,
        phone: transferredData.phone,
        source: transferredData.source,
        terms_accepted: transferredData.terms_accepted,
      });

      // await SignInUserWithUsernameAndPassword({
      //   username,
      //   password,
      // });

      // Clear the transferred metadata after using it
      sessionStorage.removeItem("referral_signup_metadata");

      router.push("/verify-email");
    } catch (error) {
      console.log(error);
      // @ts-expect-error - error object from API may have status property
      if (error.status === 500) toast.error("Something went wrong");
      // @ts-expect-error - error object from API may have message property
      setError(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AuthHeader title="Sign Up">
          <span className="text-sm font-normal text-[#9CA3AF]">
            Already have an account?{" "}
            <Link className="font-bold text-success" href="/signin">
              Sign In
            </Link>
          </span>
        </AuthHeader>
        <div className="mb-5 flex flex-col gap-[15px]">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="Full Name"
                    type="text"
                    id="name"
                    // placeholder="Ayeni Boluwatife"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
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
                    // placeholder="AyeniBolu@gmail.com"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="User Name"
                    type="text"
                    id="username"
                    // placeholder="@ayeni.bolu"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="password"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="Password"
                    type="password"
                    id="password"
                    // placeholder="Password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="referral_code"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="Referral Code (Optional)"
                    type="text"
                    id="referral_code"
                    placeholder="Enter referral code"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          <FormField
            control={form.control}
            name="newsletter_opt_in"
            render={({ field }) => {
              return (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-4">
                  <Checkbox
                    id="newsletter_opt_in"
                    checked={field.value}
                    onCheckedChange={field.onChange}
                  />
                  <div className="space-y-1 leading-none">
                    <label
                      htmlFor="newsletter_opt_in"
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      Send me daily news highlights
                    </label>
                    <p className="text-xs text-muted-foreground">
                      Get the top stories delivered to your inbox every week.
                    </p>
                  </div>
                  <FormMessage />
                </FormItem>
              );
            }}
          />
          {referralCode && currentReferralCode === referralCode && (
            <div className="rounded-lg border border-green-200 bg-green-50 p-3">
              <p className="text-sm text-green-800">
                <strong>Referral Applied:</strong> You&apos;re signing up with
                referral code{" "}
                <span className="font-mono font-bold">{referralCode}</span>
              </p>
            </div>
          )}
          {error && !isLoading && (
            <p className="-mt-1 font-bold text-red-500">{error}</p>
          )}
        </div>
        <Button
          className="w-full rounded-full"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign Up"}
        </Button>
        <ContinueWithSeparator />
        <SocialProviders />
      </form>
    </Form>
  );
};

export default SignUpPage;
