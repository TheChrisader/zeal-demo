"use client";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@/i18n/routing";
import { useRouter } from "@/app/_components/useRouter";
import { useForm } from "react-hook-form";
import { object, string, z } from "zod";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { InputWithLabel } from "@/components/forms/Input/InputWithLabel";
import { Button } from "@/components/ui/button";
import { Form, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { Separator } from "@/components/ui/separator";
import {
  SignInUserWithUsernameAndPassword,
  SignUserWithoutPassword,
} from "@/services/auth.services";
import AuthHeader from "../_components/AuthHeader";
import ContinueWithSeparator from "../_components/ContinueWithSeparator";
import SocialProviders from "../_components/SocialProviders";
import { useEffect, useState } from "react";
import { Loader2 } from "lucide-react";
import { decodeJWTResponse } from "@/utils/jwt.utils";
import { toast } from "sonner";

const SignInPage = () => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
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

  const SignInFormSchema = object({
    username: string().min(1, "Username is required"),
    password: string().min(1, "Password is required"),
  });

  const form = useForm<z.infer<typeof SignInFormSchema>>({
    resolver: zodResolver(SignInFormSchema),
    defaultValues: {
      username: "",
      password: "",
    },
    mode: "onTouched",
  });

  const onSubmit = async (data: z.infer<typeof SignInFormSchema>) => {
    const { username, password } = data;
    setIsLoading(true);
    try {
      await SignInUserWithUsernameAndPassword({
        username,
        password,
      });
      revalidatePathAction("/");
      router.push("/");
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
      <form className="flex flex-col" onSubmit={form.handleSubmit(onSubmit)}>
        <AuthHeader title="Sign In">
          <span className="text-sm font-normal text-[#9CA3AF]">
            Don&apos;t have an account?{" "}
            <Link className="font-bold text-[#2F7830]" href="/signup">
              Sign Up
            </Link>
          </span>
        </AuthHeader>
        <div className="mb-8 flex flex-col gap-[15px]">
          <FormField
            control={form.control}
            name="username"
            render={({ field }) => {
              return (
                <FormItem>
                  <InputWithLabel
                    label="User Name"
                    type="username"
                    id="username"
                    // placeholder="@ayeni.Bolu"
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
          {error && !isLoading && (
            <p className="-mt-1 font-bold text-red-500">{error}</p>
          )}
        </div>
        <Button
          className="w-full rounded-full"
          disabled={isLoading}
          type="submit"
        >
          {isLoading ? <Loader2 className="size-4 animate-spin" /> : "Sign In"}
        </Button>
        <ContinueWithSeparator />
        <SocialProviders />
        <Separator className="mb-4 mt-3" />
        <Link
          className="text-end font-bold text-[#2F7830]"
          href="/forgot-password"
        >
          Forgot Password?
        </Link>
      </form>
    </Form>
  );
};

export default SignInPage;
