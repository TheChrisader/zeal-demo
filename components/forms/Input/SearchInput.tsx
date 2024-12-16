"use client";
import { useSearchParams } from "next/navigation";
import { usePathname } from "@/i18n/routing";
import { useRouter } from "@/app/_components/useRouter";
import SearchIcon from "@/assets/svgs/utils/SearchIcon";
import { Input } from "@/components/ui/input";

const SearchInput = ({
  className,
  placeholder,
  ...props
}: {
  className?: string;
  placeholder?: string;
  defaultValue?: string;
  onEnter?: (search: string) => void;
  onChange?: (search: string) => void;
}) => {
  const searchParams = useSearchParams();
  const pathname = usePathname();
  const { push } = useRouter();

  const handleSearch = (search: string) => {
    const params = new URLSearchParams(searchParams);

    if (search) {
      params.set("query", search);
    } else {
      params.delete("query");
    }

    push(`${pathname}?${params.toString()}`);
  };

  return (
    <label
      className={`relative flex items-center rounded-full bg-[#FAFAFA] px-3 shadow-basic has-[input:focus]:outline has-[input:focus]:outline-2 has-[input:focus]:outline-primary ${className}`}
    >
      <SearchIcon className="text-[#959595]" />
      <Input
        className="border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
        placeholder={placeholder}
        type="search"
        maxLength={512}
        onChange={(e) => {
          if (props.onChange && !props.onEnter) {
            props.onChange(e.currentTarget.value);
          }
        }}
        onKeyDown={(e) => {
          if (!props.onChange && e.key === "Enter") {
            if (props.onEnter) {
              props.onEnter(e.currentTarget.value);
            } else {
              handleSearch(e.currentTarget.value);
            }
          }
        }}
        defaultValue={
          props.defaultValue || searchParams.get("query")?.toString()
        }
      />
    </label>
  );
};

export default SearchInput;
