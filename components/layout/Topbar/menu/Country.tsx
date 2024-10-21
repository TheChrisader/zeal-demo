import { CountryIconList } from "@/app/(auth)/onboarding/_utils/svgs";
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

const CountryDropdown = ({ children }: { children: React.ReactNode }) => {
  const { user } = useAuth();
  const userCountry = user?.country;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="flex h-auto items-center gap-2 rounded-full px-2 py-0"
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
  );
};

export default CountryDropdown;
