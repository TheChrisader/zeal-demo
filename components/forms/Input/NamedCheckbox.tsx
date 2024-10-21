"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

const NamedCheckbox = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
>(({ className, children, ...props }, ref) => {
  return (
    <Label className="flex cursor-pointer items-center justify-between rounded-md p-2 transition-colors hover:bg-gray-100 has-[button:focus-visible]:outline has-[button:focus]:outline-2 has-[button:focus]:outline-primary">
      {children}
      <CheckboxPrimitive.Root
        ref={ref}
        className={cn(
          "peer size-6 focus:outline-0 focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=checked]:text-primary",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="size-6" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </Label>
  );
});

NamedCheckbox.displayName = "NamedCheckbox";

export default NamedCheckbox;
