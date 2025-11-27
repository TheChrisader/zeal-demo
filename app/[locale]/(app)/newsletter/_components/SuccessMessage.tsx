"use client";

import { ArrowLeft, CheckCircle, Mail, Star } from "lucide-react";
import { Link } from "@/i18n/routing";

export function SuccessMessage() {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      {/* Simple success icon */}
      <div className="relative mb-8">
        <div className="relative">
          <div className="absolute inset-0 animate-pulse rounded-full bg-green-500/20 blur-lg"></div>
          <div className="relative flex size-20 items-center justify-center rounded-full bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg">
            <CheckCircle className="size-10" />
          </div>
        </div>
      </div>

      <h1 className="mb-6 text-4xl font-bold">You&apos;re Subscribed!</h1>

      <p className="mb-8 max-w-2xl text-lg leading-relaxed text-muted-foreground">
        Thank you for joining our newsletter. Check your inbox for the follow-up
        instructions to complete the process.
      </p>

      {/* Status indicators */}
      <div className="mb-8 flex flex-wrap justify-center gap-4">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <CheckCircle className="size-5 text-green-500" />
          <span>Successfully Subscribed</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Mail className="size-5 text-blue-500" />
          <span>Check Your Email</span>
        </div>
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <Star className="size-5 text-yellow-500" />
          <span>Premium Content</span>
        </div>
      </div>

      {/* Action button */}
      <Link
        href="/"
        className="group inline-flex items-center gap-2 rounded-lg bg-primary px-6 py-3 text-sm font-medium text-primary-foreground transition-all duration-300 hover:bg-primary/90 hover:shadow-lg"
      >
        <ArrowLeft className="size-4 transition-transform duration-300 group-hover:-translate-x-1" />
        Back to Homepage
      </Link>
    </div>
  );
}
