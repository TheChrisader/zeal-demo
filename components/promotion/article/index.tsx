import React from "react";
import { Button } from "@/components/ui/button"; // Adjust the import path if needed
import { Promotion, PROMOTION_DETAIL_MAP } from "../data";

export default function ArticlePromotion() {
  const banner: Promotion = PROMOTION_DETAIL_MAP["Diaspora Connect"];
  return (
    <section className="w-full bg-white font-sans">
      <div className="container mx-auto flex flex-col items-center justify-between gap-4 px-4 py-3 md:flex-row md:gap-6">
        {/* Left: Badge */}
        <div className="flex-shrink-0 rounded-md bg-[#1E6C45] px-5 py-2.5">
          <p className="text-base font-bold text-white"> {banner.title} </p>
        </div>

        {/* Center: Text Content */}
        <div className="flex-grow text-center">
          <h3 className="text-xl font-bold text-[#1E6C45] sm:text-2xl">
            {banner.subheading}
          </h3>
          <p className="mt-1 text-sm text-slate-700">{banner.statement}</p>
        </div>

        {/* Right: Subscribe Button */}
        <div className="flex-shrink-0">
          <Button
            className="rounded-full bg-[#1E6C45] px-6 py-2.5 text-xs font-semibold text-white shadow-sm transition-colors hover:bg-[#185637]"
            size="sm"
          >
            click to subscribe
          </Button>
        </div>
      </div>
    </section>
  );
}
