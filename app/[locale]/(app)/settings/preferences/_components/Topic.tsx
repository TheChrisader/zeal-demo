"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { Check } from "lucide-react";
import { motion } from "framer-motion";
import * as React from "react";

import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";
import { usePreferencesContext } from "../page";

type Props = React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root> & {
  category?: {
    name: string;
    checked: boolean;
  };
};

const NewsTopic = React.forwardRef<
  React.ElementRef<typeof CheckboxPrimitive.Root>,
  // React.ComponentPropsWithoutRef<typeof CheckboxPrimitive.Root>
  Props
>(({ className, children, category, ...props }, ref) => {
  const MotionLabel = React.useMemo(() => motion(Label), []);
  const togglePreference = usePreferencesContext();
  return (
    <MotionLabel
      layout
      className="hover:bg-subtle-hover-bg flex cursor-pointer items-center justify-between gap-3 rounded-full px-4 py-2 outline outline-2 outline-gray-200 transition-colors has-[button[data-state=checked]]:text-primary has-[button:focus]:outline-2 has-[button:focus]:outline-primary has-[button[data-state=checked]]:outline-primary"
    >
      {children}
      <CheckboxPrimitive.Root
        ref={ref}
        checked={category?.checked}
        onCheckedChange={() => togglePreference(category!.name)}
        className={cn(
          "peer size-4 focus:outline-0 focus-visible:outline-0 disabled:cursor-not-allowed disabled:opacity-50 data-[state=unchecked]:hidden data-[state=checked]:text-primary",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator
          className={cn("flex items-center justify-center text-current")}
        >
          <Check className="size-4" />
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>
    </MotionLabel>
  );
});

NewsTopic.displayName = "NewsTopic";

export default NewsTopic;
