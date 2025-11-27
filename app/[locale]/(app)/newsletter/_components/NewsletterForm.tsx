"use client";

import { zodResolver } from "@hookform/resolvers/zod";
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
import { Input } from "@/components/ui/input";
import { fetcher } from "@/lib/fetcher";
import { Link } from "@/i18n/routing";
import { Mail, CheckCircle, Sparkles } from "lucide-react";

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

interface NewsletterFormProps {
  onSubmit: (data: NewsletterFormValues) => Promise<void>;
  isSubmitting: boolean;
  submitError: string | null;
  category: string;
}

export function NewsletterForm({ onSubmit, isSubmitting, submitError, category }: NewsletterFormProps) {
  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  return (
    <>
      <div className="mb-8 text-center">
        {/* Enhanced icon container with animations */}
        <div className="relative group mx-auto mb-6">
          <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-2xl blur-xl opacity-75 group-hover:opacity-100 transition duration-1000"></div>
          <div className="relative flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 shadow-lg">
            <Mail className="h-7 w-7 text-primary" />
            <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-pulse"></div>
          </div>
        </div>

        <h1 className="mb-3 text-3xl font-bold bg-gradient-to-r from-foreground to-foreground/80 bg-clip-text text-transparent">
          Join Our Newsletter
        </h1>
        <p className="text-muted-foreground leading-relaxed max-w-sm mx-auto">
          Stay updated with the latest {category} insights delivered fresh to your inbox.
          <span className="flex items-center justify-center gap-1 mt-2 text-sm">
            <CheckCircle className="size-4 text-green-500" />
            No spam, unsubscribe anytime
          </span>
        </p>
      </div>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit)}
          className="space-y-6"
        >
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <div className="relative group">
                    {/* Enhanced input with gradient border on focus */}
                    <div className="absolute inset-0 bg-gradient-to-r from-primary/20 via-purple-500/20 to-primary/20 rounded-xl blur-lg opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    <div className="relative">
                      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                        <Mail className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors duration-300" />
                      </div>
                      <Input
                        placeholder="Enter your email address"
                        className="relative rounded-xl border-border/50 bg-background/50 backdrop-blur-sm py-5 pl-12 pr-4 text-base transition-all duration-300 hover:border-border hover:bg-background focus:border-primary/50 focus:shadow-lg focus:shadow-primary/10"
                        {...field}
                        disabled={isSubmitting}
                      />
                      <div className="absolute inset-y-0 right-0 flex items-center pr-3">
                        <div className="w-2 h-2 bg-muted-foreground/30 rounded-full group-hover:bg-green-400 transition-colors duration-300"></div>
                      </div>
                    </div>
                  </div>
                </FormControl>
                <FormMessage className="text-sm" />
              </FormItem>
            )}
          />

          {submitError && (
            <div className="rounded-lg border border-red-200/50 bg-red-50/50 p-3 text-center text-sm text-red-600 dark:border-red-800/30 dark:bg-red-950/20">
              {submitError}
            </div>
          )}

          <Button
            type="submit"
            disabled={isSubmitting}
            className="group relative w-full rounded-xl py-5 text-base font-medium transition-all duration-300 hover:shadow-lg hover:shadow-primary/10"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-primary via-primary/95 to-primary opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
            <div className="relative flex items-center justify-center gap-2">
              {isSubmitting ? (
                <>
                  <div className="h-4 w-4 animate-spin rounded-full border-2 border-current border-t-transparent"></div>
                  Subscribing...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  Subscribe Now
                </>
              )}
            </div>
          </Button>

          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <span className="w-full border-t border-border/30"></span>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-background px-2 text-muted-foreground">Secure subscription</span>
            </div>
          </div>

          <p className="text-center text-sm text-muted-foreground leading-relaxed">
            By subscribing, you agree to our{" "}
            <Link
              href="/info/privacy-policy"
              className="font-medium text-primary underline-offset-4 hover:underline"
            >
              Privacy Policy
            </Link>
            {" "}and consent to receive weekly updates.
          </p>

          <div className="flex justify-center">
            <Link
              href="/"
              className="group inline-flex items-center gap-2 text-sm text-muted-foreground underline-offset-4 transition-all duration-300 hover:text-foreground hover:underline"
            >
              <span className="transform transition-transform duration-300 group-hover:-translate-x-1">←</span>
              Back to homepage
            </Link>
          </div>
        </form>
      </Form>
    </>
  );
}