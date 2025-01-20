"use client";
import React, { useEffect, useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/context/auth/useAuth";
import { updatePreferences } from "@/services/preferences.services";
// import { Categories } from "@/types/utils/category.type";
import Categories from "@/categories";
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
    <PreferencesContext.Provider value={togglePreference}>
      <div className="mb-8 w-full">
        <div className="mb-4 flex w-full items-center justify-between">
          <div className="flex flex-col">
            <h3 className="text-lg font-bold text-[#2F2D32]">
              News Preferences
            </h3>
            <span className="text-sm font-normal text-[#696969]">
              Select the news topics you wish to be featured on your home page
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
  );
};

export default PreferencesSettings;
