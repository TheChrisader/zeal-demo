"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { Loader2 } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next-nprogress-bar";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { object, string, z } from "zod";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  SignInUserWithUsernameAndPassword,
  SignUpUserWithEmailAndPassword,
  SignUserWithoutPassword,
} from "@/services/auth.services";
import { decodeJWTResponse } from "@/utils/jwt.utils";
import AuthHeader from "../_components/AuthHeader";
import ContinueWithSeparator from "../_components/ContinueWithSeparator";
import SocialProviders from "../_components/SocialProviders";
import { toast } from "sonner";

const SignUpPage = () => {
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const router = useRouter();

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
  }, []);

  const SignUpFormSchema = object({
    name: string().min(1, "Name is required"),
    username: string().min(1, "Username is required"),
    email: string()
      .email("Must be a valid email address")
      .min(1, "Email is required"),
    password: string().min(1, "Password is required"),
  });

  const form = useForm<z.infer<typeof SignUpFormSchema>>({
    resolver: zodResolver(SignUpFormSchema),
    defaultValues: {
      name: "",
      username: "",
      email: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: z.infer<typeof SignUpFormSchema>) => {
    const { name, username, email, password } = data;
    setIsLoading(true);
    try {
      await SignUpUserWithEmailAndPassword({
        display_name: name,
        username,
        email,
        password,
      });

      await SignInUserWithUsernameAndPassword({
        username,
        password,
      });

      router.push("/verify-email");
    } catch (error) {
      console.log(error);
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
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <AuthHeader title="Sign Up">
          <span className="text-sm font-normal text-[#9CA3AF]">
            Already have an account?{" "}
            <Link className="font-bold text-[#2F7830]" href="/signin">
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
                    placeholder="Ayeni Boluwatife"
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
                    placeholder="AyeniBolu@gmail.com"
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
                    placeholder="@ayeni.bolu"
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
                    placeholder="Password"
                    {...field}
                  />
                  <FormMessage />
                </FormItem>
              );
            }}
          />
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
