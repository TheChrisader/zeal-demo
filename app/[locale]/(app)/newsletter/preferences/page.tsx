"use client";

import { motion } from "framer-motion";
import {
  AlertCircle,
  CheckCircle,
  Loader2,
  Mail,
  Sparkles,
} from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { useRouter } from "@/app/_components/useRouter";
import { topLevelCategoryMap } from "@/categories";
import { CATEGORIES } from "@/categories/flattened";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import LoadingState from "./_components/LoadingState";

interface CategoryGroup {
  name: string;
  categories: string[];
  icon: string;
  color: string;
}

const getCategoryIcon = (categoryName: string): string => {
  const icons: Record<string, string> = {
    News: "📰",
    Business: "💼",
    Technology: "💻",
    Discovery: "🔍",
    Opinion: "💭",
    Lifestyle: "🌟",
    Entertainment: "🎭",
  };
  return icons[categoryName] || "📂";
};

const categoryGroups: CategoryGroup[] = Object.entries(topLevelCategoryMap).map(
  ([name, categoryKeys]) => ({
    name,
    categories: categoryKeys,
    icon: getCategoryIcon(name),
    color: "border-primary/20 hover:border-primary/40",
  }),
);

const filterValidCategories = (categories: string[]): string[] => {
  return categories.filter((cat) => CATEGORIES.includes(cat));
};

const getCookie = (name: string): string | null => {
  const value = `; ${document.cookie}`;
  const parts = value.split(`; ${name}=`);
  if (parts.length === 2) {
    return parts.pop()?.split(";").shift() || null;
  }
  return null;
};

export default function NewsletterPreferencesPage() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [email, setEmail] = useState<string>("");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Check if preferences have already been selected
    const preferencesSelected = getCookie("zealnews_preferences_selected");

    if (preferencesSelected === "true") {
      // Redirect to homepage if preferences already selected
      router.push("/");
      return;
    }

    const emailParam = searchParams.get("email");
    if (emailParam) {
      setEmail(emailParam);
    }

    // Set loading to false after checks
    setIsLoading(false);
  }, [searchParams, router]);

  const handleCategoryToggle = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category)
        ? prev.filter((c) => c !== category)
        : [...prev, category],
    );
  };

  const handleGroupToggle = (group: CategoryGroup) => {
    const validCategories = filterValidCategories(group.categories);
    const allSelected = validCategories.every((cat) =>
      selectedCategories.includes(cat),
    );

    if (allSelected) {
      setSelectedCategories((prev) =>
        prev.filter((c) => !validCategories.includes(c)),
      );
    } else {
      setSelectedCategories((prev) => [
        ...new Set([...prev, ...validCategories]),
      ]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error("Email address is required");
      return;
    }

    if (selectedCategories.length === 0) {
      toast.error("Please select at least one category");
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/v1/newsletter/subscription", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email_address: email,
          list_ids: selectedCategories,
        }),
      });

      const data = await response.json();

      if (response.ok) {
        setIsSubmitted(true);
        toast.success(
          `Successfully subscribed to ${data.successfulSubscriptions} categories!`,
        );
      } else {
        if (data.message === "Subscriber not found") {
          setError(
            "This email address is not found in our system. Please make sure you've subscribed to our newsletter first.",
          );
        } else {
          setError(data.message || "Failed to update preferences");
        }
      }
    } catch (err) {
      setError("Network error. Please try again.");
      toast.error("Failed to update preferences");
    } finally {
      setIsSubmitting(false);
    }
  };

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
      },
    },
  };

  if (isSubmitted) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 to-slate-100 p-4">
        <motion.div
          initial={{ scale: 0.9, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", duration: 0.5 }}
          className="w-full max-w-md"
        >
          <Card className="p-8 text-center">
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
              className="mx-auto mb-4 flex size-16 items-center justify-center rounded-full bg-green-100"
            >
              <CheckCircle className="size-8 text-green-600" />
            </motion.div>
            <CardTitle className="mb-2 text-2xl">
              Preferences Updated!
            </CardTitle>
            <CardDescription className="mb-6 text-base">
              Your newsletter preferences have been successfully updated.
              You&apos;ll now receive emails for your selected categories.
            </CardDescription>
            <Badge variant="secondary" className="mb-4 text-sm">
              {selectedCategories.length} categories selected
            </Badge>
          </Card>
        </motion.div>
      </div>
    );
  }

  // Show loading state while checking for cookie
  if (isLoading) {
    return <LoadingState />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 px-4 py-8">
      <div className="mx-auto max-w-4xl">
        <motion.div
          initial={{ y: -20, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="mb-8 text-center"
        >
          <div className="mb-4 flex items-center justify-center">
            <Mail className="mr-3 size-8 text-primary" />
            <h1 className="bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-4xl font-bold text-transparent">
              Newsletter Preferences
            </h1>
          </div>
          <p className="mb-2 text-lg text-muted-foreground">
            Customize your news feed with topics that matter to you
          </p>
          {email && (
            <div className="flex items-center justify-center text-sm text-muted-foreground">
              <Sparkles className="mr-1 size-4" />
              Updating preferences for:{" "}
              <span className="ml-1 font-medium">{email}</span>
            </div>
          )}
        </motion.div>

        <form onSubmit={handleSubmit}>
          <motion.div
            variants={containerVariants}
            initial="hidden"
            animate="visible"
            className="space-y-6"
          >
            {categoryGroups.map((group) => {
              const validCategories = filterValidCategories(group.categories);
              if (validCategories.length === 0) return null;

              const selectedCount = validCategories.filter((cat) =>
                selectedCategories.includes(cat),
              ).length;
              const isAllSelected = selectedCount === validCategories.length;

              return (
                <motion.div key={group.name} variants={itemVariants}>
                  <Card
                    className={`border-2 transition-all duration-200 border-${group.color} bg-background`}
                  >
                    <CardHeader>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <span className="text-2xl">{group.icon}</span>
                          <div>
                            <CardTitle className="text-lg">
                              {group.name}
                            </CardTitle>
                            <CardDescription>
                              {selectedCount} of {validCategories.length}{" "}
                              selected
                            </CardDescription>
                          </div>
                        </div>
                        <Button
                          type="button"
                          variant="outline"
                          size="sm"
                          onClick={() => handleGroupToggle(group)}
                          className="whitespace-nowrap"
                        >
                          {isAllSelected ? "Deselect All" : "Select All"}
                        </Button>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
                        {validCategories.map((category) => (
                          <motion.div
                            key={category}
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                          >
                            <Label
                              htmlFor={`${category}-checkbox`}
                              className={`flex cursor-pointer items-center space-x-2 rounded-lg border p-3 transition-all ${
                                selectedCategories.includes(category)
                                  ? "border-primary bg-primary/5"
                                  : "border-border hover:border-primary/50"
                              }`}
                            >
                              <Checkbox
                                id={`${category}-checkbox`}
                                checked={selectedCategories.includes(category)}
                                onCheckedChange={() =>
                                  handleCategoryToggle(category)
                                }
                              />
                              <span className="flex-1 cursor-pointer text-sm font-medium">
                                {category}
                              </span>
                            </Label>
                          </motion.div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              );
            })}
          </motion.div>

          {error && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-6"
            >
              <Card className="border-red-200 bg-red-50">
                <CardContent className="pt-6">
                  <div className="flex items-start space-x-3">
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-red-600" />
                    <div>
                      <h4 className="font-medium text-red-800">Error</h4>
                      <p className="mt-1 text-sm text-red-600">{error}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col items-center justify-between gap-4 sm:flex-row"
          >
            <div className="text-sm text-muted-foreground">
              {selectedCategories.length} categories selected
            </div>
            <Button
              type="submit"
              size="lg"
              disabled={
                isSubmitting || !email || selectedCategories.length === 0
              }
              className="min-w-[140px]"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="mr-2 size-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Preferences"
              )}
            </Button>
          </motion.div>
        </form>
      </div>
    </div>
  );
}
