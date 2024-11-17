"use client";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import useAuth from "@/context/auth/useAuth";
import { Separator } from "@/components/ui/separator";
import SearchInput from "@/components/forms/Input/SearchInput";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { updatePreferences } from "@/services/preferences.services";
import Categories from "@/categories";
import { flattenCategories } from "@/utils/category.utils";
import NewsTopic from "../../settings/preferences/_components/Topic";
import { PreferencesContext } from "../../settings/preferences/page";

const setPreferences = (categories: string[]) => {
  const preferences = categories
    .filter((category) => category !== "For you")
    .filter((category) => category !== "Headlines")
    .map((category) => {
      return {
        name: category,
        checked: false,
      };
    });

  return preferences;
};

const PreferencesPopup = () => {
  const [showDrawer, setShowDrawer] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      // Random timeout between 30 seconds and 2 minutes
      const timeout = Math.random() * (120000 - 30000) + 30000;
      // const timeout = 2000;

      const timer = setTimeout(() => {
        // Check if user hasn't seen the drawer today
        const lastShown = localStorage.getItem("lastDrawerShown");
        const today = new Date().toDateString();

        if (lastShown !== today) {
          // if (true) {
          setShowDrawer(true);
          localStorage.setItem("lastDrawerShown", today);
        }
      }, timeout);

      return () => clearTimeout(timer);
    }
  }, [user]);

  const handleClose = () => {
    setShowDrawer(false);
  };

  const { preferences: fetchedPreferences } = useAuth();
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
      handleClose();
    } catch (error) {
      console.log(error);

      if (error instanceof Error) {
        setError(error.message);
      }
    } finally {
      setIsLoading(false);
    }
  };

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

  return (
    <Drawer open={showDrawer} onOpenChange={setShowDrawer}>
      <DrawerContent>
        <div className="scrollbar-change chrollbar-change-mini mx-auto flex max-h-[calc(100vh-50px)] w-full flex-col overflow-auto px-4">
          <DrawerHeader>
            {/* <DrawerTitle>Welcome Back!</DrawerTitle>
            <DrawerDescription>
              We&apos;d love to hear your feedback about our platform.
            </DrawerDescription> */}
          </DrawerHeader>

          <PreferencesContext.Provider value={togglePreference}>
            <div className="mb-8 w-full">
              <div className="mb-4 flex w-full items-center justify-between">
                <div className="flex flex-col">
                  <h3 className="text-lg font-bold text-[#2F2D32]">
                    News Preferences
                  </h3>
                  <span className="text-sm font-normal text-[#696969]">
                    Select the news topics you wish to be featured on your home
                    page
                  </span>
                </div>
                <SearchInput
                  onChange={setSearchTerm}
                  placeholder="Search for any news topic"
                />
              </div>
              <Separator className="mb-6" />
              <div className="flex flex-wrap gap-4">
                {searchTerm
                  ? searchList.map((category) => {
                      return (
                        <NewsTopic category={category} key={category.name}>
                          <span className="text-sm font-normal text-current">
                            {category.name}
                          </span>
                        </NewsTopic>
                      );
                    })
                  : list.map((category) => {
                      return (
                        <NewsTopic category={category} key={category.name}>
                          <span className="text-sm font-normal text-current">
                            {category.name}
                          </span>
                        </NewsTopic>
                      );
                    })}
              </div>
              <div className="mt-9 flex w-full justify-end">
                <Button onClick={handleSaveChanges}>
                  {isLoading ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </div>
          </PreferencesContext.Provider>

          <DrawerFooter>
            {/* <Button onClick={handleClose}>Submit Feedback</Button>
            <DrawerClose asChild>
              <Button variant="outline">Maybe Later</Button>
            </DrawerClose> */}
          </DrawerFooter>
        </div>
      </DrawerContent>
    </Drawer>
  );
};

export default PreferencesPopup;
