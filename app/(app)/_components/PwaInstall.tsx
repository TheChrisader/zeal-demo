"use client";

import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/react-legacy";
import React, { MutableRefObject, useEffect } from "react";

declare global {
  interface Window {
    // @eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   promptEvent: any;
  }
}

const getBrowser = () => {
  const ua = navigator.userAgent;
  if (ua.indexOf("Firefox") > -1) {
    return "firefox";
  } else if (ua.indexOf("Chrome") > -1) {
    return "chrome";
  } else if (ua.indexOf("Safari") > -1) {
    return "safari";
  } else if (ua.indexOf("Edge") > -1) {
    return "edge";
  } else {
    return "other";
  }
};

const getScreen = (): "mobile" | "tablet" | "desktop" => {
  const width = window.innerWidth;
  if (width < 768) {
    return "mobile";
  } else if (width < 1024) {
    return "tablet";
  } else {
    return "desktop";
  }
};

const PwaInstall = React.forwardRef<PWAInstallElement>(({}, ref) => {
  // console.log((ref as MutableRefObject<PWAInstallElement>)?.current);
  // console.log(getBrowser(), getScreen());
  useEffect(() => {
    setTimeout(() => {
      const $ = (selector: string) => document.querySelector(selector);

      const pwaChromeMobile = $("pwa-install")?.shadowRoot;

      if (pwaChromeMobile) {
        (
          pwaChromeMobile.querySelector(
            "div.install-dialog.chrome.mobile.available",
          ) as HTMLElement
        )?.style.setProperty("--translateY", "translateY(192px)");
      }
    }, 2500);
  }, []);

  return (
    <PWAInstall
      useLocalStorage
      ref={ref}
      manifestUrl="/manifest.json"
    ></PWAInstall>
  );
});

PwaInstall.displayName = "PwaInstall";

export default PwaInstall;
