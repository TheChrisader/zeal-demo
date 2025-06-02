// components/cta/email-wall-overlay.tsx
"use client";

import { useEffect } from "react"; // useEffect might not be strictly needed for Dialog visibility if controlled by parent
import { motion } from "framer-motion"; // For custom animations on DialogContent if desired
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  // DialogFooter, // If we need a footer
  // DialogClose, // If we add an explicit close button
} from "@/components/ui/dialog"; // Shadcn Dialog
import { LockKeyhole } from "lucide-react";
import { NewsletterSignUpForm } from ".";

interface EmailWallOverlayProps {
  articleTitle?: string;
  sourceName?: string;
  onSubscriptionSuccess: () => void;
  // open: boolean; // Controlled by ArticleDisplayManager's showWall state
  // onOpenChange: (open: boolean) => void; // To update showWall in parent
}
// The `open` and `onOpenChange` props will be implicitly handled by how
// ArticleDisplayManager renders this component conditionally with AnimatePresence.
// Shadcn Dialog itself doesn't need these if we're just mounting/unmounting it.

export function EmailWallOverlay({
  articleTitle,
  sourceName,
  onSubscriptionSuccess,
}: EmailWallOverlayProps) {
  // Shadcn's Dialog (Radix) handles focus trapping and Escape key.
  // It doesn't prevent scroll on body by default, ArticleDisplayManager does that.

  // Animation variants for the DialogContent itself if we want more than default
  const contentVariants = {
    hidden: { opacity: 0, y: 50, scale: 0.95 }, // Start slightly lower and smaller
    visible: {
      opacity: 1,
      y: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 30,
        duration: 0.4,
      },
    },
    exit: {
      opacity: 0,
      y: 30,
      scale: 0.98,
      transition: { duration: 0.2, ease: "easeIn" },
    },
  };
  console.log("wal!!!!!!!!!!!!");

  return (
    // The Dialog component from Shadcn.
    // Its visibility is controlled by whether ArticleDisplayManager renders it or not.
    // AnimatePresence in ArticleDisplayManager will handle the enter/exit of this whole component.
    // We can then animate DialogContent specifically if we want.
    <Dialog
      open={true}
      onOpenChange={() => {
        /* Parent controls this via conditional rendering */
      }}
    >
      {/* DialogOverlay is part of DialogContent in Shadcn's default styling via `fixed inset-0 z-50 bg-black/80 ... data-[state=open]:animate-in ...` */}
      {/* So we animate DialogContent directly */}
      <DialogContent
        className="overflow-hidden border-none p-0 shadow-2xl data-[state=closed]:slide-out-to-bottom-12 data-[state=open]:slide-in-from-bottom-12 sm:max-w-lg [&>button]:hidden"
        // To use Framer Motion for custom animation instead of Shadcn's default tailwind animations:
        // asChild // Important to allow motion.div to take over styling/animation
      >
        {/*
        // If using asChild with Framer Motion for DialogContent:
        <motion.div
            variants={contentVariants}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="bg-white dark:bg-neutral-900 p-0 rounded-lg shadow-xl overflow-hidden" // Base styles if asChild
        >
        */}
        {/* Using Shadcn's default animations (remove asChild and motion.div above if so) */}
        {/* The `className` on DialogContent already has slide-in-from-bottom. */}
        {/* We can adjust it if needed, or add more specific Framer Motion animations to inner elements. */}

        <div className="p-6 text-center sm:p-8">
          <LockKeyhole className="mx-auto mb-3 h-10 w-10 text-blue-600 dark:text-blue-500 sm:mb-4 sm:h-12 sm:w-12" />
          <DialogHeader className="mb-0 sm:mb-0">
            {" "}
            {/* Remove default spacing if title/desc handle it */}
            <DialogTitle className="mb-2 text-center font-serif text-2xl font-bold text-neutral-800 dark:text-neutral-100 sm:mb-3 sm:text-3xl">
              Read the Full Story
            </DialogTitle>
            {/* <DialogDescription className="mx-auto mb-6 max-w-md text-center text-sm text-neutral-600 dark:text-neutral-300 sm:mb-8 sm:text-base">
              Subscribe to ZealNews to unlock this article
              {articleTitle ? ` "${articleTitle}"` : ""} and gain
              unlimited access to all our content.
            </DialogDescription> */}
          </DialogHeader>

          <div className="mx-auto max-w-sm text-left">
            <NewsletterSignUpForm
              onSubmitSuccess={onSubscriptionSuccess}
              className="bg-transparent p-0 shadow-none"
            />
          </div>
          <p className="mt-6 text-xs text-neutral-500 dark:text-neutral-400">
            Free to join. Cancel anytime.
          </p>
        </div>
        {/* </motion.div> // If using asChild with Framer Motion */}
      </DialogContent>
    </Dialog>
  );
}
