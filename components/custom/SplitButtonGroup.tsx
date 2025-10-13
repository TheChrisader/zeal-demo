"use client";

import { ChevronDownIcon } from "lucide-react";
import { forwardRef, useState } from "react";

import { Button, ButtonProps } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface SplitButtonGroupProps extends Omit<ButtonProps, "onClick"> {
  height: string | number;
  overrideDisabled?: string[];
  options: {
    label: string;
    render?: React.ReactNode;
    description?: string;
    action: () => void;
  }[];
}

// const options = [
//   {
//     label: 'Merge pull request',
//     description: 'All commits from this branch will be added to the base branch via a commit version.'
//   },
//   {
//     label: 'Squash and merge',
//     description: 'The 6 commits from this branch will be combined into one commit in the base branch.'
//   },
//   {
//     label: 'Rebase and merge',
//     description: 'The 6 commits from this branch will be rebased and added to the base branch.'
//   }
// ]

const SplitButtonGroup = forwardRef<HTMLButtonElement, SplitButtonGroupProps>(
  ({ options, height, overrideDisabled, ...buttonProps }, ref) => {
    const [selectedIndex, setSelectedIndex] = useState("0");

    const isCurrentLabelOverridden = overrideDisabled?.includes(
      options[Number(selectedIndex)]?.label || "",
    );
    const effectiveDisabled = isCurrentLabelOverridden
      ? false
      : buttonProps.disabled;

    return (
      <div
        className="shadow-xs inline-flex w-fit divide-x divide-primary-foreground/30 rounded-md"
        style={{ height }}
      >
        <Button
          ref={ref}
          {...buttonProps}
          disabled={effectiveDisabled}
          className="h-full w-fit rounded-none rounded-l-md px-4 py-2 shadow-none focus-visible:ring-0 focus-visible:ring-offset-0"
          onClick={() => options[Number(selectedIndex)]?.action()}
        >
          {options[Number(selectedIndex)]?.render ||
            options[Number(selectedIndex)]?.label}
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button
              size="icon"
              className="h-full w-fit rounded-none rounded-r-md p-0 px-1 focus-visible:ring-0 focus-visible:ring-offset-0"
            >
              <ChevronDownIcon size={12} />
              <span className="sr-only">Select option</span>
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent
            side="bottom"
            sideOffset={4}
            align="end"
            className="md:max-w-xs! max-w-64"
          >
            <DropdownMenuRadioGroup
              value={selectedIndex}
              onValueChange={setSelectedIndex}
            >
              {options.map((option, index) => (
                <DropdownMenuRadioItem
                  key={option.label}
                  value={String(index)}
                  className="items-start [&>span]:pt-1.5"
                >
                  <div className="flex flex-col gap-1">
                    <div className="text-sm font-medium">{option.label}</div>
                    <span className="text-xs text-muted-foreground">
                      {option.description}
                    </span>
                  </div>
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    );
  },
);

SplitButtonGroup.displayName = "SplitButtonGroup";

export default SplitButtonGroup;
