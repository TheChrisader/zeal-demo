"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/hooks/useAuth";
import { fetcher } from "@/lib/fetcher";

const newsletterSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address" }),
});

type NewsletterFormValues = z.infer<typeof newsletterSchema>;

interface NewsletterPopupProps {
  category: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function NewsletterPopup({
  category,
  open,
  onOpenChange,
}: NewsletterPopupProps) {
  const { isAuthenticated } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(newsletterSchema),
    defaultValues: {
      email: "",
    },
  });

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
        setSubmitSuccess(true);
        form.reset();
        // Close the modal after 2 seconds
        setTimeout(() => {
          onOpenChange(false);
          setSubmitSuccess(false);
        }, 2000);
      }
    } catch (error: unknown) {
      setSubmitError("An error occurred. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  // Reset states when modal opens/closes
  useEffect(() => {
    if (!open) {
      form.reset();
      setSubmitSuccess(false);
      setSubmitError(null);
      setIsSubmitting(false);
    }
  }, [open, form]);

  // Don't show popup if user is authenticated
  if (isAuthenticated) {
    return null;
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="overflow-hidden rounded-lg shadow-xl sm:max-w-md">
        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center px-4 py-8">
            <div className="mb-4 text-4xl">🎉</div>
            <DialogTitle className="text-center text-2xl font-bold">
              You&apos;re Subscribed!
            </DialogTitle>
            <DialogDescription className="mt-2 text-center text-muted-foreground">
              Thank you for joining our newsletter.
            </DialogDescription>
            <p className="mt-4 text-center text-muted-foreground">
              You&apos;ll receive updates on {category} content.
            </p>
          </div>
        ) : (
          <div className="p-2">
            <DialogHeader className="text-left">
              <div className="mx-auto mb-4 mt-2 flex h-16 w-16 items-center justify-center rounded-full bg-primary/10">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-8 w-8 text-primary"
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
              <DialogTitle className="text-center text-2xl font-bold">
                Join Our Newsletter
              </DialogTitle>
              <DialogDescription className="text-center">
                Stay updated with the latest {category} news and insights. No
                spam, unsubscribe at any time.
              </DialogDescription>
            </DialogHeader>

            <Form {...form}>
              <form
                onSubmit={form.handleSubmit(onSubmit)}
                className="mt-6 space-y-4"
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
                            placeholder="your@email.com"
                            className="rounded-lg py-6 pl-10 text-base"
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
                  className="w-full rounded-lg py-6 text-base font-medium"
                >
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>

                <p className="text-center text-xs text-muted-foreground">
                  By subscribing, you agree to our Privacy Policy and consent to
                  receive updates.
                </p>

                <div className="flex justify-center">
                  <Button
                    type="button"
                    variant="ghost"
                    onClick={() => onOpenChange(false)}
                    disabled={isSubmitting}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    Not now
                  </Button>
                </div>
              </form>
            </Form>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
