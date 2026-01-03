"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "@/app/_components/useRouter";
import { Button } from "@/components/ui/button";
import {
  Promotion,
  PROMOTION_DETAIL_KEY_ENUMS,
  PROMOTION_DETAIL_MAP,
  PROMOTION_KEYS,
} from "../data";

interface ArticlePromotionProps {
  category: PROMOTION_DETAIL_KEY_ENUMS;
}

export default function ArticlePromotion({ category }: ArticlePromotionProps) {
  const router = useRouter();

  if (PROMOTION_KEYS.indexOf(category) === -1) {
    return null;
  }

  const banner: Promotion = PROMOTION_DETAIL_MAP[category];

  return (
    <>
      <section className="w-full rounded-lg border-2 border-dashed border-primary/70 bg-white font-sans dark:bg-card-alt-bg">
        <div className="container mx-auto flex flex-col items-center justify-between gap-2 px-4 py-3 lg:flex-row lg:gap-6">
          {/* Left: Badge */}
          <div className="shrink-0 rounded-md bg-primary px-5 py-1 text-center md:py-2.5">
            <p className="break-words text-base font-bold text-primary-foreground">
              {" "}
              {banner.title}{" "}
            </p>
          </div>

          {/* Center: Text Content */}
          <div className="grow text-center">
            <h3 className="text-xl font-bold text-primary sm:text-2xl">
              {banner.subheading}
            </h3>
            <p className="text-sm text-muted-foreground">{banner.statement}</p>
          </div>

          {/* Right: Subscribe Button */}
          <div className="shrink-0">
            <Button
              className="rounded-full bg-primary px-6 py-1 text-xs font-semibold text-primary-foreground shadow-sm transition-colors hover:bg-success-hover-bg md:py-2.5"
              size="sm"
              onClick={() => router.push("/newsletter")}
            >
              Join Now
            </Button>
          </div>
        </div>
      </section>
    </>
  );
}
