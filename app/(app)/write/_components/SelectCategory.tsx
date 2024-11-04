"use client";

import { Check, ChevronsUpDown } from "lucide-react";

import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import useActionHandler from "../_context/action-handler/useActionHandler";
import Categories from "@/categories";
import { flattenCategories } from "@/utils/category.utils";
import { useEffect, useState } from "react";

const categories = flattenCategories(Categories);

function SelectCategory({ draftCategory }: { draftCategory?: string }) {
  const [open, setOpen] = useState(false);
  const { category, setCategory } = useActionHandler();

  useEffect(() => {
    if (!draftCategory) return;
    setCategory(draftCategory);
  }, [draftCategory]);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          role="combobox"
          aria-expanded={open}
          className="w-[200px] justify-between"
        >
          {category
            ? categories.find((cat) => cat === category)
            : "Select category..."}
          <ChevronsUpDown className="ml-2 size-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Search categories..." />
          <CommandList className="scrollbar-change">
            <CommandEmpty>No category found.</CommandEmpty>
            <CommandGroup>
              {categories.map((cat) => (
                <CommandItem
                  key={cat}
                  value={cat}
                  onSelect={(currentCategory) => {
                    setCategory(
                      currentCategory === category ? "" : currentCategory,
                    );
                    setOpen(false);
                  }}
                >
                  <Check
                    className={cn(
                      "mr-2 h-4 w-4",
                      category === cat ? "opacity-100" : "opacity-0",
                    )}
                  />
                  {cat}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  );
}

export default SelectCategory;
