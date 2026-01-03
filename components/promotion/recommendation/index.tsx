"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Link } from "@/i18n/routing";
import { getRandomItem } from "@/utils/array.utils";
import {
  Promotion,
  PROMOTION_DETAIL_KEY_ENUMS,
  PROMOTION_DETAIL_MAP,
  PROMOTION_KEYS,
} from "../data";

export default function RecommendedPromotion() {
  const [banner, setBanner] = useState<Promotion | null>(null);
  // const banner: Promotion = PROMOTION_DETAIL_MAP["Diaspora Connect"];

  useEffect(() => {
    const bannerKey =
      getRandomItem<(typeof PROMOTION_KEYS)[number]>(PROMOTION_KEYS);
    const bannerData: Promotion =
      PROMOTION_DETAIL_MAP[bannerKey as PROMOTION_DETAIL_KEY_ENUMS];

    setBanner(bannerData);
  }, []);

  if (!banner) {
    return null;
  }

  return (
    <Link href="/newsletter">
      <section className="bg-white p-4 font-sans dark:bg-card-alt-bg">
        <div className="mx-auto w-full max-w-md space-y-4">
          {/* Badge */}
          <div className="inline-block rounded-md bg-primary px-4 py-1.5">
            <p className="text-sm font-semibold text-primary-foreground">
              {banner.title}
            </p>
          </div>

          {/* Text Content */}
          <div className="space-y-2">
            <h2 className="text-2xl font-bold text-primary">
              {banner.subheading}
            </h2>
            <p className="text-base text-muted-foreground">
              {banner.statement}
            </p>
          </div>

          {/* Quote and Image Block */}
          <div className="border-l-4 border-yellow-300 dark:border-yellow-500">
            <div className="bg-yellow-50 py-3 pl-4 pr-3 dark:bg-subtle-bg">
              <p className="text-sm italic text-primary dark:text-success">
                “{banner.quote}”
              </p>
            </div>
            <div className="mt-0">
              {" "}
              {/* mt-0 to ensure image is flush with quote box */}
              <Image
                src={banner.image} // IMPORTANT: Replace with your image path
                alt="A family in vibrant African attire enjoying a meal together outdoors"
                width={500}
                height={400}
                className="h-auto w-full object-cover"
              />
            </div>
          </div>
        </div>
      </section>
    </Link>
  );
}
