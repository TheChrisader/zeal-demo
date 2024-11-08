"use client";

import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/react-legacy";
import React, { MutableRefObject, useEffect, useState } from "react";

declare global {
  interface Window {
    deferredPromptEvent: BeforeInstallPromptEvent;
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
  const [promptEvent, setPromptEvent] =
    useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    setTimeout(() => {
      const $ = (selector: string) => document.querySelector(selector);

      const pwaChromeMobile = $("pwa-install")?.shadowRoot;

      setTimeout(() => {
        pwaChromeMobile
          ?.querySelector(
            "div.install-dialog.chrome.mobile.available > div > pwa-bottom-sheet > div.body-header > button",
          )
          ?.addEventListener("click", () => {
            const browser = getBrowser();
            if (browser === "chrome" || browser === "edge") {
              console.log(browser);
              window.deferredPromptEvent.prompt();
              (
                ref as MutableRefObject<PWAInstallElement>
              )?.current.hideDialog();
            } else {
              console.log(browser);
            }
          });
      }, 1500);

      if (pwaChromeMobile) {
        (
          pwaChromeMobile.querySelector(
            "div.install-dialog.chrome.mobile.available",
          ) as HTMLElement
        )?.style.setProperty("--translateY", "translateY(192px)");
      }
    }, 2500);
  }, []);

  useEffect(() => {
    let lastPromptEvent = window.deferredPromptEvent;

    const intervalId = setInterval(() => {
      if (window.deferredPromptEvent !== lastPromptEvent) {
        lastPromptEvent = window.deferredPromptEvent;
        setPromptEvent(window.deferredPromptEvent);
      }
    }, 100);
    return () => {
      clearInterval(intervalId);
    };
  }, []);

  return (
    <PWAInstall
      useLocalStorage
      ref={ref}
      manifestUrl="/manifest.json"
      externalPromptEvent={promptEvent}
      onPwaInstallAvailableEvent={(event) => console.log(event)}
    ></PWAInstall>
  );
});

PwaInstall.displayName = "PwaInstall";

export default PwaInstall;
