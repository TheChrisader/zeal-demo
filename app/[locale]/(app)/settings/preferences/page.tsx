"use client";
import { LayoutGroup } from "framer-motion";
import { AlertCircle, CheckCircle2, Loader2, Sparkles } from "lucide-react";
import React, { useEffect, useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import Categories from "@/categories";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useAuth } from "@/hooks/useAuth";
import { usePreferences } from "@/hooks/usePreferences";
import { updatePreferences } from "@/services/preferences.services";
// import { Categories } from "@/types/utils/category.type";
import { flattenCategories } from "@/utils/category.utils";
import NewsTopic from "./_components/Topic";

const setPreferences = (categories: string[]) => {
  const preferences = categories
    .filter((category) => category !== "Home")
    .filter((category) => category !== "Headlines")
    .map((category) => {
      return {
        name: category,
        checked: false,
      };
    });

  return preferences;
};

export const PreferencesContext = React.createContext<
  (categoryName: string) => void
>(() => {});

export const usePreferencesContext = () => {
  const context = React.useContext(PreferencesContext);

  if (context === undefined) {
    throw new Error(
      "usePreferencesContext must be used within a PreferencesContextProvider",
    );
  }

  return context;
};

const PreferencesSettings = () => {
  const { preferences: fetchedPreferences } = usePreferences();
  const preferences = setPreferences(flattenCategories(Categories));
  // const [list, setList] = useState(Categories);
  const [list, setList] = useState(preferences);
  const [searchList, setSearchList] = useState(list);
  const [searchTerm, setSearchTerm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      const preferences = list
        .filter((item) => item.checked)
        .map((item) => item.name);

      if (preferences.length < 5) {
        throw new Error("Please select at least 5 categories");
      }

      fetchedPreferences!.category_updates = preferences;

      await updatePreferences(fetchedPreferences!);

      revalidatePathAction("/settings/preferences");
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

  // Skeleton loading component
  const PreferencesSkeleton = () => (
    <div className="mx-auto max-w-4xl space-y-8 p-0">
      <div className="space-y-4">
        <div className="h-8 w-48 animate-pulse rounded-lg bg-muted" />
        <div className="h-px bg-muted" />
      </div>
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
        {Array.from({ length: 12 }).map((_, i) => (
          <div key={i} className="h-20 animate-pulse rounded-lg bg-muted" />
        ))}
      </div>
    </div>
  );

  const togglePreference = React.useCallback((categoryName: string) => {
    setList((prevList) =>
      prevList
        .map((item) =>
          item.name === categoryName
            ? { ...item, checked: !item.checked }
            : item,
        )
        .sort((a, b) => {
          if (a.checked === b.checked) {
            return a.name.localeCompare(b.name);
          }
          return a.checked ? -1 : 1;
        }),
    );

    setSearchList((prevList) =>
      prevList
        .map((item) =>
          item.name === categoryName
            ? { ...item, checked: !item.checked }
            : item,
        )
        .sort((a, b) => {
          if (a.checked === b.checked) {
            return a.name.localeCompare(b.name);
          }
          return a.checked ? -1 : 1;
        }),
    );
  }, []);

  useEffect(() => {
    const filteredList = preferences.filter((item) => {
      return item.name.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setSearchList(
      filteredList.map((item) => {
        const found = list.find((listItem) => listItem.name === item.name);
        if (found?.checked) {
          return { ...item, checked: true };
        }
        return item;
      }),
    );
  }, [searchTerm]);

  useEffect(() => {
    const checkedCategories = list.map((item) => {
      item.checked = !!fetchedPreferences?.category_updates.includes(item.name);
      return item;
    });

    setList(
      checkedCategories.sort((a, b) => {
        if (a.checked === b.checked) {
          return a.name.localeCompare(b.name);
        }
        return a.checked ? -1 : 1;
      }),
    );
  }, []);

  const selectedCount = list.filter((item) => item.checked).length;

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ctrl/Cmd + S to save
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        if (!isLoading && selectedCount >= 5) {
          handleSaveChanges();
        }
      }
      // / to focus search
      if (e.key === "/" && !searchTerm) {
        e.preventDefault();
        // Focus the search input
        const searchInput = document.querySelector(
          'input[placeholder*="Search"]',
        );
        if (searchInput) {
          (searchInput as HTMLInputElement).focus();
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isLoading, selectedCount, searchTerm]);

  if (!fetchedPreferences) return <PreferencesSkeleton />;

  return (
    <PreferencesContext.Provider value={togglePreference}>
      <div className="w-full space-y-3 py-4 sm:mx-auto sm:max-w-4xl sm:space-y-4 sm:p-0">
        <Card className="w-full border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-3 p-0 pb-3 sm:pb-4">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="flex items-center gap-2 text-xl font-bold text-foreground/80 sm:text-2xl">
                  <Sparkles className="size-5 text-primary" />
                  News Preferences
                </CardTitle>
                <p className="mt-2 text-sm text-muted-foreground">
                  Select the news topics you wish to be featured on your home
                  page
                </p>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      Ctrl+S
                    </kbd>
                    save
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      /
                    </kbd>
                    search
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-0">
            {/* Search Section */}
            <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="relative">
                  <SearchInput
                    onChange={setSearchTerm}
                    placeholder="Search for any news topic (press '/' to focus)"
                    className="w-full"
                  />
                </div>
              </CardContent>
            </Card>

            {/* Selection Summary */}
            <Card className="border-0 bg-gradient-to-br from-primary/5 via-background to-muted/10 shadow-sm">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="rounded-lg bg-primary/10 p-2">
                      <Sparkles className="size-4 text-primary" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-foreground/80">
                        {selectedCount} topics selected
                      </p>
                      <p className="text-xs text-muted-foreground/60">
                        {selectedCount < 5
                          ? `Select ${5 - selectedCount} more to continue`
                          : "You've met the minimum requirement"}
                      </p>
                    </div>
                  </div>
                  <Badge
                    variant={selectedCount >= 5 ? "default" : "secondary"}
                    className="h-6 px-2 text-xs"
                  >
                    {selectedCount >= 5 ? (
                      <CheckCircle2 className="mr-1 size-3" />
                    ) : (
                      <AlertCircle className="mr-1 size-3" />
                    )}
                    {selectedCount >= 5 ? "Ready" : "Need 5+"}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Error State */}
            {error && (
              <Card className="border-red-200/50 bg-red-50/50 dark:border-red-800/50 dark:bg-red-900/10">
                <CardContent className="p-3">
                  <div className="flex items-center gap-2">
                    <AlertCircle className="size-4 shrink-0 text-red-500" />
                    <span className="text-sm text-red-600 dark:text-red-400">
                      {error}
                    </span>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Topics Grid */}
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {/* <div className="flex flex-wrap gap-4"> */}
              {(searchTerm ? searchList : list).map((category) => (
                <NewsTopic category={category} key={category.name}>
                  <span className="text-sm font-medium text-current">
                    {category.name}
                  </span>
                </NewsTopic>
              ))}
              {/* {list.map((category) => (
                <NewsTopic category={category} key={category.name}>
                  <span className="text-sm font-medium text-current">
                    {category.name}
                  </span>
                </NewsTopic>
              ))} */}
            </div>

            {/* Save Section */}
            <div className="flex items-center justify-between border-t pt-4">
              <p className="text-xs text-muted-foreground/60">
                Selected topics will appear on your home page feed
              </p>
              <Button
                onClick={handleSaveChanges}
                disabled={isLoading || selectedCount < 5}
                className="min-w-[120px] gap-2 transition-all duration-200 hover:scale-105"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="size-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Sparkles className="size-4" />
                    Save Changes
                  </>
                )}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PreferencesContext.Provider>
  );
};

export default PreferencesSettings;
