import React from "react";
import Image from "next/image";

export default function RecommendedPromotion() {
  return (
    <section className="bg-white p-4 font-sans">
      <div className="mx-auto w-full max-w-md space-y-4">
        {/* Badge */}
        <div className="inline-block rounded-md bg-[#1E6C45] px-4 py-1.5">
          <p className="text-sm font-semibold text-white">Diaspora Connect</p>
        </div>

        {/* Text Content */}
        <div className="space-y-2">
          <h2 className="text-2xl font-bold text-[#1E6C45]">
            Stay Connected to Home
          </h2>
          <p className="text-base text-gray-700">
            From Lagos to London, Accra to Atlanta — We Cover It All.
          </p>
        </div>

        {/* Quote and Image Block */}
        <div className="border-l-4 border-[#FDE68A]">
          <div className="bg-[#FEF9E7] py-3 pl-4 pr-3">
            <p className="text-sm italic text-[#1E6C45]">
              “No matter the distance, your roots still run deep.”
            </p>
          </div>
          <div className="mt-0">
            {" "}
            {/* mt-0 to ensure image is flush with quote box */}
            <Image
              src="/diaspora-connect.png" // IMPORTANT: Replace with your image path
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
