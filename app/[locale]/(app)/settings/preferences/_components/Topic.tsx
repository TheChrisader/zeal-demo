"use client";

import * as CheckboxPrimitive from "@radix-ui/react-checkbox";
import { AnimatePresence, motion } from "framer-motion";
import { Check, Sparkles } from "lucide-react";
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
  Props
>(({ className, children, category, ...props }, ref) => {
  const MotionLabel = React.useMemo(() => motion(Label), []);
  const togglePreference = usePreferencesContext();

  return (
    <MotionLabel
      layout
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.5 }}
      className={cn(
        "group relative flex cursor-pointer items-center justify-between gap-3 overflow-hidden rounded-xl border bg-gradient-to-br p-4 px-2 transition-colors duration-300",
        category?.checked
          ? "border-primary/30 from-primary/10 via-primary/5 to-background shadow-sm hover:border-primary/50 hover:shadow-md"
          : "border-border/40 from-background via-background to-muted/10 hover:border-border/60 hover:from-muted/5 hover:to-muted/20",
        className,
      )}
    >
      {/* Gradient overlay for checked state */}
      <AnimatePresence>
        {category?.checked && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="pointer-events-none absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent"
          />
        )}
      </AnimatePresence>

      <div className="relative flex items-center gap-3">
        {/* <div
          className={cn(
            "rounded-lg p-1 transition-colors duration-300",
            category?.checked
              ? "bg-primary/20 text-primary"
              : "bg-muted/50 text-muted-foreground group-hover:bg-muted/70",
          )}
        >
          <Sparkles
            className={cn(
              "size-3 transition-all duration-300",
              category?.checked && "animate-pulse",
            )}
          />
        </div> */}
        <span
          className={cn(
            "text-sm font-medium transition-colors duration-300",
            category?.checked
              ? "text-primary"
              : "text-foreground/80 group-hover:text-foreground",
          )}
        >
          {children}
        </span>
      </div>

      <CheckboxPrimitive.Root
        ref={ref}
        checked={category?.checked}
        onCheckedChange={() => togglePreference(category!.name)}
        className={cn(
          "relative size-5 shrink-0 rounded-md border-2 transition-all duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          category?.checked
            ? "border-primary bg-primary text-primary-foreground"
            : "border-border bg-background hover:border-primary/50",
          className,
        )}
        {...props}
      >
        <CheckboxPrimitive.Indicator className="flex items-center justify-center text-current">
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            transition={{ duration: 0.2 }}
          >
            <Check className="size-3" />
          </motion.div>
        </CheckboxPrimitive.Indicator>
      </CheckboxPrimitive.Root>

      {/* Hover effect border */}
      <div
        className={cn(
          "pointer-events-none absolute inset-0 rounded-xl border-2 opacity-0 transition-opacity duration-300",
          category?.checked
            ? "border-primary/30"
            : "border-primary/20 group-hover:opacity-100",
        )}
      />
    </MotionLabel>
  );
});

NewsTopic.displayName = "NewsTopic";

export default NewsTopic;
