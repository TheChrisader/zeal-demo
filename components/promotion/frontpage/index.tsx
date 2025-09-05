import Image from "next/image";
import React from "react";
import { Button } from "@/components/ui/button";
import { cacheManager } from "@/lib/cache";
import { getRandomItem } from "@/utils/array.utils";
import {
  Promotion,
  PROMOTION_DETAIL_KEY_ENUMS,
  PROMOTION_DETAIL_MAP,
  PROMOTION_KEYS,
} from "../data";

export default async function FrontpagePromotion() {
  // const bannerKey =
  //   getRandomItem<(typeof PROMOTION_KEYS)[number]>(PROMOTION_KEYS);
  // const banner: Promotion =
  //   PROMOTION_DETAIL_MAP[bannerKey as PROMOTION_DETAIL_KEY_ENUMS];

  const banner = await cacheManager({
    key: "frontpagePromotion",
    fetcher: async () => {
      const bannerKey =
        getRandomItem<(typeof PROMOTION_KEYS)[number]>(PROMOTION_KEYS);
      const banner: Promotion =
        PROMOTION_DETAIL_MAP[bannerKey as PROMOTION_DETAIL_KEY_ENUMS];
      return banner;
    },
    options: {
      revalidate: 60 * 60 * 8,
      tags: ["frontpagePromotion"],
    },
  });

  return (
    <section className="bg-white font-sans">
      <div className="container mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:py-4">
        <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3 lg:gap-12">
          {/* Left Section (2/3 width on desktop) */}
          <div className="flex flex-col items-start space-y-3 lg:col-span-2">
            <div className="inline-block rounded-sm bg-[#1E6C45] px-5 py-2">
              <h2 className="text-sm font-bold text-white md:text-base">
                {banner.title}
              </h2>
            </div>

            <p className="text-sm text-gray-700">{banner.description}</p>

            <h1 className="text-xl font-extrabold tracking-tight text-[#1E6C45] md:text-2xl">
              <span className="underline decoration-2 underline-offset-8">
                {banner.subheading}
              </span>
            </h1>

            <p className="text-sm text-gray-700">{banner.statement}</p>

            <div className="w-full border-l-4 border-yellow-300 bg-[#FEF9E7] p-4">
              <p className="italic text-[#1E6C45]">“{banner.quote}”</p>
            </div>
          </div>

          {/* Right Section (1/3 width on desktop) */}
          <div className="flex flex-col items-center justify-center space-y-6">
            <div className="w-full max-w-[200px] rounded-sm border-4 border-[#FBF3D5]">
              <Image
                src={banner.image} // IMPORTANT: Replace with your image path
                alt="A family enjoying a meal together outdoors with a modern city skyline in the background"
                width={100}
                height={100}
                className="h-auto w-full object-cover"
              />
            </div>
            <Button
              size="lg"
              className="w-full max-w-xs rounded-full bg-[#1E6C45] px-10 py-6 text-base font-bold text-white shadow-lg transition-colors hover:bg-[#185637] sm:w-auto"
            >
              Join Here
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
