"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
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

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

export default function NewsletterPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  // Default to "News" category if no specific category is needed
  const category = "News";

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

  // Check if user is already subscribed using cookies
  useEffect(() => {
    const hasSubscribed = document.cookie
      .split("; ")
      .find((row) => row.startsWith("zealnews_subscribed_newsletter="));
    
    if (hasSubscribed) {
      setSubmitSuccess(true);
    }
  }, []);

  async function onSubmit(data: NewsletterFormValues) {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const response = await fetcher("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          categories: [category],
        }),
      });

      if (response.message) {
        // Set cookie to indicate user has subscribed
        document.cookie =
          "zealnews_subscribed_newsletter=true; path=/; max-age=31536000"; // 1 year
        setSubmitSuccess(true);
        form.reset();
      }
    } catch (error: unknown) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset states when leaving the page
  useEffect(() => {
    return () => {
      form.reset();
      setSubmitSuccess(false);
      setSubmitError(null);
      setIsSubmitting(false);
    };
  }, [form]);

  return (
    <div className="flex min-h-[calc(100vh-62px)] items-center justify-center bg-gradient-to-br from-primary/5 to-secondary/5 p-4">
      <div className="mx-auto grid w-full max-w-4xl grid-cols-1 items-center gap-12 lg:grid-cols-2">
        {/* Left side - Content/illustration */}
        <div className="hidden flex-col items-center justify-center space-y-6 lg:flex">
          <div className="relative flex h-64 w-64 items-center justify-center">
            <div className="absolute inset-0 rounded-full bg-primary/20 blur-xl"></div>
            <div className="relative flex h-fit w-64 flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-2xl">
              <div className="mb-4 rounded-full bg-primary/10 p-6">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="size-6 text-primary"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              </div>
              <h2 className="text-center text-2xl font-bold">Stay Updated</h2>
              <p className="mt-2 text-center text-muted-foreground">
                Get the latest news and insights delivered to your inbox
              </p>
            </div>
          </div>
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold">Join our newsletter</h2>
            <p className="text-lg text-muted-foreground">
              Discover curated content, industry updates, and exclusive insights
            </p>
          </div>
        </div>

        {/* Right side - Form */}
        <div className="mx-auto w-full max-w-md">
          <div className="rounded-2xl border border-border bg-card p-8 shadow-xl">
            {submitSuccess ? (
              <div className="flex flex-col items-center justify-center py-8 text-center">
                <div className="mb-6 text-6xl">🎉</div>
                <h1 className="mb-3 text-3xl font-bold">
                  You&apos;re Subscribed!
                </h1>
                <p className="mb-2 text-lg text-muted-foreground">
                  Thank you for joining our newsletter.
                </p>
                {/* <p className="mb-6 text-muted-foreground">
                  You&apos;ll receive updates on {category} content.
                </p> */}
                <div className="flex gap-3">
                  <Link
                    href="/"
                    className="rounded-lg bg-primary px-4 py-2 text-primary-foreground transition-colors hover:bg-primary/90"
                  >
                    Back to Homepage
                  </Link>
                  {/* <Link
                    href="/for-you"
                    className="rounded-lg border border-input bg-background px-4 py-2 transition-colors hover:bg-accent hover:text-accent-foreground"
                  >
                    Explore Content
                  </Link> */}
                </div>
              </div>
            ) : (
              <>
                <div className="mb-8 text-center">
                  <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      className="h-6 w-6 text-primary"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  </div>
                  <h1 className="mb-2 text-2xl font-bold">
                    Join Our Newsletter
                  </h1>
                  <p className="text-muted-foreground">
                    Stay updated with the latest {category} news and insights.
                    No spam, unsubscribe at any time.
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
                            <div className="relative">
                              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  className="h-5 w-5 text-muted-foreground"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                                  <polyline points="22,6 12,13 2,6" />
                                </svg>
                              </div>
                              <Input
                                placeholder="Enter your email address"
                                className="rounded-lg py-5 pl-10 text-base"
                                {...field}
                                disabled={isSubmitting}
                              />
                            </div>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    {submitError && (
                      <div className="text-center text-sm text-red-500">
                        {submitError}
                      </div>
                    )}

                    <Button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full rounded-lg py-5 text-base font-medium"
                    >
                      {isSubmitting ? "Subscribing..." : "Subscribe Now"}
                    </Button>

                    <p className="text-center text-sm text-muted-foreground">
                      By subscribing, you agree to our{" "}
                      <Link 
                        href="/info/privacy-policy" 
                        className="underline underline-offset-4 hover:text-primary"
                      >
                        Privacy Policy
                      </Link>{" "}
                      and consent to receive updates.
                    </p>

                    <div className="flex justify-center">
                      <Link
                        href="/"
                        className="text-sm text-muted-foreground underline-offset-4 hover:text-foreground hover:underline"
                      >
                        Back to homepage
                      </Link>
                    </div>
                  </form>
                </Form>
              </>
            )}
          </div>

          {/* Features list */}
          {!submitSuccess && (
            <div className="mt-8 grid grid-cols-3 gap-4 text-center">
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="font-bold text-primary">Weekly</div>
                <div className="text-xs text-muted-foreground">Updates</div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="font-bold text-primary">Curated</div>
                <div className="text-xs text-muted-foreground">Content</div>
              </div>
              <div className="rounded-lg bg-secondary/30 p-3">
                <div className="font-bold text-primary">Unlimited</div>
                <div className="text-xs text-muted-foreground">Access</div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
