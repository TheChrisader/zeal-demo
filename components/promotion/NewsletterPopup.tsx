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
  FormLabel,
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
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Subscribe to our Newsletter</DialogTitle>
          <DialogDescription>
            Stay updated with the latest {category} news and insights.
          </DialogDescription>
        </DialogHeader>

        {submitSuccess ? (
          <div className="flex flex-col items-center justify-center py-8">
            <div className="mb-4 text-2xl">🎉</div>
            <p className="text-center text-lg font-medium">
              Thank you for subscribing!
            </p>
            <p className="mt-2 text-center text-muted-foreground">
              You&apos;ll receive updates on {category} content.
            </p>
          </div>
        ) : (
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="your@email.com"
                        {...field}
                        disabled={isSubmitting}
                      />
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

              <div className="flex flex-col gap-2 sm:flex-row sm:justify-end">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => onOpenChange(false)}
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button type="submit" disabled={isSubmitting}>
                  {isSubmitting ? "Subscribing..." : "Subscribe"}
                </Button>
              </div>
            </form>
          </Form>
        )}
      </DialogContent>
    </Dialog>
  );
}
