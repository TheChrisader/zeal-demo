import Image from "next/image";
import React from "react";
import { Promotion, PROMOTION_DETAIL_MAP } from "../data";

export default function RecommendedPromotion() {
  const banner: Promotion = PROMOTION_DETAIL_MAP["Diaspora Connect"];
  return (
    <section className="bg-white p-4 font-sans">
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* Badge */}
        <div className="inline-block rounded-md bg-[#1E6C45] px-4 py-1.5">
          <p className="text-sm font-semibold text-white">{banner.title}</p>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1E6C45]">
            {banner.subheading}
          </h2>
          <p className="text-base text-gray-700">{banner.statement}</p>
        </div>

        {/* Quote and Image Block */}
        <div className="border-l-4 border-[#FDE68A]">
          <div className="bg-[#FEF9E7] py-3 pl-4 pr-3">
            <p className="text-sm italic text-[#1E6C45]">“{banner.quote}”</p>
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
  );
}
