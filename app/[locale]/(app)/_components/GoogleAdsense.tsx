"use client";

import Script from "next/script";
import { useEffect, useState } from "react";

type Props = {
  pId: string;
};

const GoogleAdsense: React.FC<Props> = ({ pId }) => {
  const [hasConsent, setHasConsent] = useState(false);

  useEffect(() => {
    const cookieChoice = localStorage.getItem("cookieChoice");
    setHasConsent(cookieChoice === "accepted");
  }, []);

  if (process.env.NODE_ENV !== "production" || !hasConsent) {
    return null;
  }

  return (
    <Script
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-${pId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
};

export default GoogleAdsense;
