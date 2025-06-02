// components/ui/newsletter-signup-form-wapo.tsx (renaming to avoid conflict, or replace existing)
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { motion, AnimatePresence } from "framer-motion";
import {
  Mail,
  AlertTriangle,
  CheckCircle,
  Loader2,
  ChevronRight,
  Check,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Checkbox } from "@/components/ui/checkbox"; // We'll style this carefully
import { cn } from "@/lib/utils";

// Zod schema for form validation
const formSchema = z.object({
  email: z.string().email({ message: "Please enter a valid email address." }),
  categories: z.array(z.string()).optional(), // For selecting newsletter topics
});

type NewsletterFormValues = z.infer<typeof formSchema>;

interface NewsletterSignUpFormProps {
  source?: string; // For tracking, can also influence offerTag
  offerTag?: string; // e.g., "LIMITED TIME" or "EXCLUSIVE"
  title?: string; // Main headline, e.g., "Subscribe to ZealNews"
  subtitle?: string; // Smaller text below title
  benefits?: string[]; // List of benefits, e.g., ["Daily updates", "Exclusive content"]
  emailInputLabel?: string; // e.g., "Add your email address"
  showCategories?: boolean;
  categoriesTitle?: string;
  availableCategories?: { id: string; label: string; description?: string }[];
  buttonText?: string;
  onSubmitSuccess?: () => void;
  onSubmitError?: (error: any) => void;
  className?: string;
}

export function NewsletterSignUpForm({
  source,
  offerTag,
  title = "Subscribe to Zeal News Africa",
  subtitle = "Unlock unparalleled insights and analysis from our team of dedicated journalists. Subscribe for free.",
  benefits = [
    "Exclusive in-depth articles",
    "Curated content from expert journalists",
    "Early access to special reports",
    // "Minimal ads, focused reading experience",
  ],
  emailInputLabel = "Enter your email to subscribe",
  showCategories = false,
  categoriesTitle = "Choose your newsletters:",
  availableCategories = [],
  buttonText = "Subscribe",
  onSubmitSuccess,
  onSubmitError,
  className,
}: NewsletterSignUpFormProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [submissionStatus, setSubmissionStatus] = useState<{
    message: string;
    type: "success" | "error";
  } | null>(null);

  const form = useForm<NewsletterFormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      categories: [],
    },
  });

  async function onSubmit(data: NewsletterFormValues) {
    setIsLoading(true);
    setSubmissionStatus(null);

    try {
      // Simulate network delay if you want to always see the loader briefly
      // await new Promise(resolve => setTimeout(resolve, 700));

      const response = await fetch("/api/v1/newsletter/subscribe", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: data.email,
          categories: data.categories,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || "Something went wrong.");
      }

      setSubmissionStatus({
        message: result.message || "Subscription successful!",
        type: "success",
      });
      form.reset(); // Reset form on success
      if (onSubmitSuccess) {
        onSubmitSuccess();
      }
    } catch (error: any) {
      setSubmissionStatus({
        message: error.message || "An error occurred. Please try again.",
        type: "error",
      });
      if (onSubmitError) {
        onSubmitError(error);
      }
    } finally {
      setIsLoading(false);
    }
  }

  const messageVariants = {
    hidden: { opacity: 0, height: 0, marginTop: 0, marginBottom: 0 },
    visible: {
      opacity: 1,
      height: "auto",
      marginTop: "0.75rem",
      marginBottom: "0.75rem",
    }, // mt-3 mb-3
  };

  return (
    <div
      className={cn("w-full bg-white p-6 text-neutral-800 sm:p-8", className)}
    >
      {offerTag && (
        <div className="mb-4">
          <span className="inline-block border border-neutral-800 px-2 py-1 text-xs font-semibold tracking-wider text-neutral-800">
            {offerTag}
          </span>
        </div>
      )}

      <h1 className="mb-2 font-serif text-3xl font-bold text-neutral-900 sm:text-4xl">
        {title}
      </h1>
      {subtitle && (
        <p className="mb-6 text-sm text-neutral-600 sm:text-base">{subtitle}</p>
      )}

      {benefits && benefits.length > 0 && (
        <ul className="mb-6 space-y-2 sm:mb-8">
          {benefits.map((benefit, index) => (
            <li
              key={index}
              className="flex items-center text-sm text-neutral-700"
            >
              <Check className="mr-2 h-5 w-5 flex-shrink-0 text-primary" />
              {benefit}
            </li>
          ))}
        </ul>
      )}

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                {emailInputLabel && (
                  <FormLabel className="mb-1 block text-sm font-medium text-neutral-700">
                    {emailInputLabel}
                  </FormLabel>
                )}
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-neutral-400" />
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="you@example.com"
                      {...field}
                      disabled={isLoading}
                      className="w-full rounded-sm border-neutral-300 py-3 pl-10 pr-4 text-base shadow-sm focus:border-blue-500 focus:ring-blue-500"
                    />
                  </FormControl>
                </div>
                <FormMessage className="mt-1 text-xs text-red-600" />
              </FormItem>
            )}
          />

          {showCategories && availableCategories.length > 0 && (
            <div className="space-y-3">
              {categoriesTitle && (
                <h3 className="text-base font-medium text-neutral-800">
                  {categoriesTitle}
                </h3>
              )}
              {availableCategories.map((item) => (
                <FormField
                  key={item.id}
                  control={form.control}
                  name="categories"
                  render={({ field }) => {
                    const isChecked = field.value?.includes(item.id);
                    return (
                      <FormItem
                        className={cn(
                          "flex cursor-pointer items-center rounded-sm border p-3 transition-all duration-150 ease-in-out",
                          isChecked
                            ? "border-blue-600 bg-blue-50 ring-2 ring-blue-500 ring-offset-1"
                            : "border-neutral-300 bg-white hover:border-neutral-400",
                          isLoading ? "cursor-not-allowed opacity-70" : "",
                        )}
                        onClick={() => {
                          if (!isLoading) {
                            const newValue = isChecked
                              ? (field.value || []).filter(
                                  (value) => value !== item.id,
                                )
                              : [...(field.value || []), item.id];
                            field.onChange(newValue);
                          }
                        }}
                      >
                        <FormControl>
                          {/* Actual checkbox is visually hidden but accessible, control is via parent click & style */}
                          <Checkbox
                            checked={isChecked}
                            onCheckedChange={(checked) => {
                              // This ensures programmatic changes also reflect
                              const newValue = checked
                                ? [...(field.value || []), item.id]
                                : (field.value || []).filter(
                                    (value) => value !== item.id,
                                  );
                              field.onChange(newValue);
                            }}
                            disabled={isLoading}
                            className="sr-only" // Visually hide, rely on parent styling
                          />
                        </FormControl>
                        {/* Custom check indicator */}
                        <div
                          className={cn(
                            "mr-3 flex h-5 w-5 flex-shrink-0 items-center justify-center rounded-full border-2",
                            isChecked
                              ? "border-blue-600 bg-blue-600"
                              : "border-neutral-400 bg-white group-hover:border-neutral-500",
                          )}
                        >
                          {isChecked && (
                            <Check className="h-3 w-3 text-white" />
                          )}
                        </div>
                        <div className="flex-grow">
                          <FormLabel
                            className={cn(
                              "text-sm font-medium",
                              isChecked ? "text-blue-700" : "text-neutral-700",
                              "cursor-pointer",
                            )}
                          >
                            {item.label}
                          </FormLabel>
                          {item.description && (
                            <p
                              className={cn(
                                "text-xs",
                                isChecked
                                  ? "text-blue-600"
                                  : "text-neutral-500",
                              )}
                            >
                              {item.description}
                            </p>
                          )}
                        </div>
                      </FormItem>
                    );
                  }}
                />
              ))}
              <FormMessage
                //   name="categories"
                className="mt-1 text-xs text-red-600"
              />{" "}
              {/* For array-level errors */}
            </div>
          )}

          <AnimatePresence>
            {submissionStatus && (
              <motion.div
                key="submission-message"
                variants={messageVariants}
                initial="hidden"
                animate="visible"
                exit="hidden" // Use hidden for exit as well to collapse space
                className={cn(
                  "flex items-start rounded-sm p-3 text-sm",
                  submissionStatus.type === "success"
                    ? "border border-green-200 bg-green-50 text-green-700"
                    : "border border-red-200 bg-red-50 text-red-700",
                )}
              >
                {submissionStatus.type === "success" ? (
                  <CheckCircle className="mr-2 h-5 w-5 flex-shrink-0" />
                ) : (
                  <AlertTriangle className="mr-2 h-5 w-5 flex-shrink-0" />
                )}
                <span className="flex-grow">{submissionStatus.message}</span>
              </motion.div>
            )}
          </AnimatePresence>

          <Button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-sm bg-primary py-3 text-base font-semibold text-white shadow-sm hover:bg-primary/80 focus:ring-2 focus:ring-primary focus:ring-offset-2"
          >
            {isLoading ? (
              <motion.span
                className="flex items-center justify-center"
                animate={{ rotate: 360 }}
                transition={{ duration: 0.8, repeat: Infinity, ease: "linear" }}
              >
                <Loader2 className="h-5 w-5" />
              </motion.span>
            ) : (
              buttonText
            )}
          </Button>
        </form>
      </Form>
    </div>
  );
}
