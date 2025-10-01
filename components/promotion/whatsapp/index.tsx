import { useEffect, useState } from "react";
import {
  IMAGE_TYPE,
  Promotion,
  PROMOTION_DETAIL_KEY_ENUMS,
  PROMOTION_DETAIL_MAP,
  PROMOTION_KEYS,
} from "../data";
import { getRandomItem } from "@/utils/array.utils";
import { Link } from "@/i18n/routing";
import Image from "next/image";

export default function WhatsappPromotion() {
  return (
    <Link
      className="flex"
      href={`https://whatsapp.com/channel/0029VauJGl7H5JLyeFUDGj1G`}
    >
      <Image
        src="/ads/whatsapp/D_Whatsapp.png"
        alt="Whatsapp promotion"
        width={728}
        height={100}
      />
    </Link>
  );
}
