import { CountryIconList } from "@/app/[locale]/(auth)/onboarding/_utils/svgs";
import revalidateTagAction from "@/app/actions/revalidateTag";
import NamedCheckbox from "@/components/forms/Input/NamedCheckbox";
import SearchInput from "@/components/forms/Input/SearchInput";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import useAuth from "@/context/auth/useAuth";
import { useRouter } from "@/i18n/routing";
import { CheckedState } from "@radix-ui/react-checkbox";
import { createContext, useContext, useEffect, useState } from "react";

interface CountryContextType {
  country: string;
}

const CountryContext = createContext<CountryContextType | undefined>(undefined);

export const useCountryContext = () => {
  const context = useContext(CountryContext);
  if (context === null || context === undefined) {
    throw new Error("useCountry must be used within a CountryProvider");
  }
  return context;
};

const CountryDropdown = ({ children }: { children: React.ReactNode }) => {
  const { user, preferences } = useAuth();
  const [userCountry, setUserCountry] = useState<string | undefined>(
    preferences?.country,
  );
  const router = useRouter();

  if (!preferences || !user) return null;

  const handleChange = async (country: string, checked: CheckedState) => {
    if (!checked) return;
    setUserCountry(country);

    const newPreferences = {
      ...preferences,
      country,
    };

    await fetch(`/api/v1/preferences`, {
      method: "PUT",
      body: JSON.stringify(newPreferences),
    });

    revalidateTagAction(`Headlines-${user.id.toString()}`);
    router.refresh();
    window.location.reload();
  };

  // const userCountry = preferences.country;
  // || user.country;

  return (
    <CountryContext.Provider value={{ country: userCountry as string }}>
      <Popover>
        <PopoverTrigger asChild>
          <Button
            variant={"outline"}
            className="flex h-auto items-center gap-2 rounded-xl px-2 py-0"
          >
            {children}
          </Button>
        </PopoverTrigger>
        <PopoverContent
          className="h-fit w-[307px] px-5 py-3"
          align="end"
          sideOffset={12}
        >
          <h3 className="text-lg font-semibold text-[#2F2D32]">
            News Location Preference
          </h3>
          <Separator className="my-3" />
          <SearchInput className="mb-4" placeholder="Search for country" />
          <div className="mb-4">
            {CountryIconList.map((country) => (
              <NamedCheckbox
                checked={country.name === userCountry}
                key={country.name}
                onCheckedChange={(checked) =>
                  handleChange(country.name, checked)
                }
              >
                <div className="flex items-center gap-2">
                  <country.Icon className="size-6 rounded-full" />
                  <span className="text-sm font-normal text-[#959595]">
                    {country.name}
                  </span>
                </div>
              </NamedCheckbox>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </CountryContext.Provider>
  );
};

export default CountryDropdown;
