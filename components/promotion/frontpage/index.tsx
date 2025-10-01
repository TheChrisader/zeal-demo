"use client";

import Image from "next/image";
import React, { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { getRandomItem } from "@/utils/array.utils";
import {
  IMAGE_TYPE,
  Promotion,
  PROMOTION_DETAIL_KEY_ENUMS,
  PROMOTION_DETAIL_MAP,
  PROMOTION_KEYS,
} from "../data";
import { NewsletterPopup } from "../NewsletterPopup";
import { Link } from "@/i18n/routing";

export default function FrontpagePromotion() {
  const [banner, setBanner] = useState<Promotion | null>(null);

  useEffect(() => {
    const fetchBanner = async () => {
      const bannerKey =
        getRandomItem<(typeof PROMOTION_KEYS)[number]>(PROMOTION_KEYS);
      const bannerData: Promotion =
        PROMOTION_DETAIL_MAP[bannerKey as PROMOTION_DETAIL_KEY_ENUMS];

      setBanner(bannerData);
    };

    fetchBanner();
  }, []);

  if (!banner) {
    return null;
  }

  return (
    <Link className="flex justify-center" href={`/newsletter`}>
      <Image
        src={`${banner.imagePath}/${IMAGE_TYPE.D_970x250}`}
        alt={banner.title}
        width={970}
        height={250}
      />
    </Link>
  );
}

// export function FrontpagePromotions() {
//   const [banner, setBanner] = useState<Promotion | null>(null);
//   const [showPopup, setShowPopup] = useState(false);
//   const { isAuthenticated, initialized } = useAuth();
//   const [canShowPopup, setCanShowPopup] = useState(false);

//   useEffect(() => {
//     const fetchBanner = async () => {
//       const bannerKey =
//         getRandomItem<(typeof PROMOTION_KEYS)[number]>(PROMOTION_KEYS);
//       const bannerData: Promotion =
//         PROMOTION_DETAIL_MAP[bannerKey as PROMOTION_DETAIL_KEY_ENUMS];

//       setBanner(bannerData);
//     };

//     fetchBanner();
//   }, []);

//   // Check if we should show the popup (no user logged in and cookie doesn't exist)
//   useEffect(() => {
//     if (!initialized || !banner) return;

//     const hasSubscribed = document.cookie
//       .split("; ")
//       .find((row) => row.startsWith("zealnews_subscribed_newsletter="));

//     if (!isAuthenticated && !hasSubscribed) {
//       // Small delay to ensure page is loaded
//       const timer = setTimeout(() => {
//         setCanShowPopup(true);
//       }, 5000);
//       return () => clearTimeout(timer);
//     }
//   }, [isAuthenticated, initialized, banner]);

//   // useEffect(() => {
//   //   if (canShowPopup) {
//   //     setShowPopup(true);
//   //   }
//   // }, [canShowPopup]);

//   if (!banner) {
//     return null;
//   }

//   return (
//     <>
//       <section className="bg-white font-sans dark:bg-card-alt-bg">
//         <div className="container mx-auto max-w-7xl px-4 py-2 sm:px-6 lg:py-4">
//           <div className="grid grid-cols-1 items-center gap-8 lg:grid-cols-3 lg:gap-12">
//             {/* Left Section (2/3 width on desktop) */}
//             <div className="flex flex-col items-start space-y-3 lg:col-span-2">
//               <div className="inline-block rounded-sm bg-primary px-5 py-2">
//                 <h2 className="text-sm font-bold text-primary-foreground md:text-base">
//                   {banner.title}
//                 </h2>
//               </div>

//               <p className="text-sm text-muted-foreground">
//                 {banner.description}
//               </p>

//               <h1 className="text-xl font-extrabold tracking-tight text-primary md:text-2xl">
//                 <span className="underline decoration-2 underline-offset-8">
//                   {banner.subheading}
//                 </span>
//               </h1>

//               <p className="text-sm text-muted-foreground">
//                 {banner.statement}
//               </p>

//               <div className="w-full border-l-4 border-yellow-300 bg-yellow-50 p-4 dark:border-yellow-500 dark:bg-subtle-bg">
//                 <p className="italic text-primary dark:text-success">
//                   “{banner.quote}”
//                 </p>
//               </div>
//             </div>

//             {/* Right Section (1/3 width on desktop) */}
//             <div className="flex flex-col items-center justify-center space-y-6">
//               <div className="dark:border-subtle-bg-alt w-full max-w-[200px] rounded-sm border-4 border-yellow-100">
//                 <Image
//                   src={banner.image}
//                   alt="A family enjoying a meal together outdoors with a modern city skyline in the background"
//                   width={100}
//                   height={100}
//                   className="h-auto w-full object-cover"
//                 />
//               </div>
//               {canShowPopup && (
//                 <Button
//                   size="lg"
//                   className="w-full max-w-xs rounded-full bg-primary px-10 py-6 text-base font-bold text-primary-foreground shadow-lg transition-colors hover:bg-success-hover-bg sm:w-auto"
//                   onClick={() => setShowPopup(true)}
//                 >
//                   Join Here
//                 </Button>
//               )}
//             </div>
//           </div>
//         </div>
//       </section>

//       <NewsletterPopup
//         category={banner.title}
//         open={showPopup}
//         onOpenChange={setShowPopup}
//       />
//     </>
//   );
// }
