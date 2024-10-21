import { CircleCheckBig } from "lucide-react";
import {
  ReadonlyURLSearchParams,
  usePathname,
  useSearchParams,
} from "next/navigation";
import { useRouter } from "next-nprogress-bar";
import React, { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { SOURCES } from "@/app/(auth)/onboarding/_components/SourcesForm";
import SearchInput from "@/components/forms/Input/SearchInput";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
// import { Categories } from "@/types/utils/category.type";
import useSWR from "swr";
import { fetcher } from "@/lib/fetcher";
import useAuth from "@/context/auth/useAuth";
import { flattenCategories } from "@/utils/category.utils";
import Categories from "@/categories";

type FiltersContext = {
  filterParams: ReadonlyURLSearchParams;
  topics: {
    filters: string[];
    setFilters: React.Dispatch<React.SetStateAction<string[]>>;
  };
  sources: {
    filters: string[];
    setFilters: React.Dispatch<React.SetStateAction<string[]>>;
  };
};

export const FiltersContext = React.createContext<FiltersContext | null>(null);

const useFiltersContext = () => {
  const context = React.useContext(FiltersContext);
  if (context === null || context === undefined) {
    throw new Error("useFilters must be used within a FiltersProvider");
  }
  return context;
};

const Topics = ({
  set,
  type,
}: {
  set: string[];
  type: "topics" | "sources";
}) => {
  const [list, setList] = useState(set);
  const [searchTerm, setSearchTerm] = useState("");

  const { filterParams, ...rest } = useFiltersContext();
  const { filters, setFilters } = rest[type];

  const onRenderMap = useRef<Record<string, boolean>>({});

  const checkAfterReload = (filter: string) => {
    const filterSearch = filter.toLowerCase();

    const params = new URLSearchParams(filterParams);
    const queryParams = params.get(type)?.split(",");

    if (queryParams && queryParams.includes(filterSearch)) {
      onRenderMap.current[filter] = true;
    }
  };

  const syncChecksOnReload = () => {
    const filtersAfterReload = Object.keys(onRenderMap.current);
    setFilters(filtersAfterReload);
  };

  useEffect(syncChecksOnReload, [setFilters]);

  useEffect(() => {
    const filteredList = set.filter((item) => {
      return item.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setList(filteredList);
  }, [set, searchTerm]);

  const handleChange = (checked: boolean | "indeterminate", item: string) => {
    if (checked) {
      setFilters([...filters, item]);
    } else {
      setFilters(filters.filter((filter) => filter !== item));
    }
  };

  return (
    <>
      <SearchInput onChange={setSearchTerm} defaultValue="" className="mb-5" />
      <div className="scrollbar-change scrollbar-change-mini mb-5 flex max-h-40 w-full flex-col overflow-auto">
        {list.map((item) => {
          checkAfterReload(item);
          return (
            <label
              key={item}
              className="flex w-full cursor-pointer justify-between p-2 text-sm font-normal text-[#696969]"
            >
              <span>{item}</span>
              <Checkbox
                value={item}
                checked={filters.includes(item)}
                onCheckedChange={(checked) => handleChange(checked, item)}
                disabled={filters.length === 5 && !filters.includes(item)}
              />
            </label>
          );
        })}
      </div>
    </>
  );
};

const FiltersDropdown = ({ children }: { children: React.ReactNode }) => {
  const [topicsFilters, setTopicsFilters] = useState<string[]>([]);
  const [sourcesFilters, setSourcesFilters] = useState<string[]>([]);

  const pathname = usePathname();
  const filterParams = useSearchParams();
  const { push } = useRouter();

  // const { user } = useAuth();

  // const fetcher = (url: string) => fetch(url).then((res) => res.json());
  // const { data, error } = useSWR(
  //   `/api/v1/sources?country=${user?.country}`,
  //   fetcher,
  //   {
  //     revalidateIfStale: false,
  //     revalidateOnFocus: false,
  //     revalidateOnReconnect: false,
  //     shouldRetryOnError: false,
  //     dedupingInterval: 1000 * 60 * 60 * 24, // 1 day
  //   },
  // );

  // const SourcesList = data?.results?.map(
  //   (source: { name: string; id: string }) => {
  //     return source.name;
  //   },
  // );

  const filtersContextValue = {
    filterParams,
    topics: { filters: topicsFilters, setFilters: setTopicsFilters },
    sources: { filters: sourcesFilters, setFilters: setSourcesFilters },
  };

  const handleFilters = (topicsFilters: string[], sourcesFilters: string[]) => {
    const topics = topicsFilters
      .map((topic) => {
        return topic.toLowerCase();
      })
      .join(",");

    const sources = sourcesFilters
      .map((source) => {
        return source.toLowerCase();
      })
      .join(",");

    const params = new URLSearchParams(filterParams);

    if (topics) {
      params.set("topics", topics);
    } else {
      params.delete("topics");
    }

    if (sources) {
      params.set("sources", sources);
    } else {
      params.delete("sources");
    }

    push(`${pathname}?${params.toString()}`);

    toast.success("Filters applied successfully", {
      icon: <CircleCheckBig className="stroke-primary" />,
      classNames: {
        toast: "flex gap-4 items-center w-fit",
      },
    });
  };

  return (
    <Popover modal>
      <PopoverTrigger asChild>
        <Button
          className="size-fit items-center justify-center rounded-full p-2"
          variant="outline"
          size="icon"
        >
          {children}
        </Button>
      </PopoverTrigger>
      <FiltersContext.Provider value={filtersContextValue}>
        <PopoverContent
          className="w-[400px] px-5 py-3 max-[410px]:w-screen"
          align="end"
          sideOffset={12}
        >
          <h3 className="text-lg font-semibold text-[#2F2D32]">Filter</h3>
          <Separator />
          <Accordion
            defaultValue="item-1"
            type="single"
            collapsible
            className="mb-4 w-full"
          >
            <AccordionItem value="item-1">
              <AccordionTrigger className="text-sm font-normal text-[#2F2D32] hover:no-underline">
                By News Topic
              </AccordionTrigger>
              <AccordionContent className="p-1">
                <Topics
                  set={flattenCategories(Categories).filter(
                    (cat) => cat !== "For you",
                  )}
                  type="topics"
                />
              </AccordionContent>
            </AccordionItem>
            {/* <AccordionItem value="item-2">
              <AccordionTrigger className="text-sm font-normal text-[#2F2D32] hover:no-underline">
                By News Source (Select up to 5)
              </AccordionTrigger>
              <AccordionContent className="p-1">
                <Topics
                  //  set={SOURCES}
                  set={SourcesList}
                  type="sources"
                />
              </AccordionContent>
            </AccordionItem> */}
          </Accordion>
          <PopoverClose asChild>
            <Button
              className="w-full rounded-full"
              type="submit"
              onClick={() => {
                handleFilters(topicsFilters, sourcesFilters);
              }}
            >
              Apply
            </Button>
          </PopoverClose>
        </PopoverContent>
      </FiltersContext.Provider>
    </Popover>
  );
};

export default FiltersDropdown;
