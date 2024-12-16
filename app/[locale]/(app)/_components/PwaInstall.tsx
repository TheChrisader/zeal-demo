"use client";

import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/react-legacy";
import platform from "platform";
import React, { MutableRefObject, useEffect, useState } from "react";
import AddToHomescreen from "./AddToHomescreen";

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

const sendFetch = async (
  eventType: "prompt_shown" | "prompt_accepted" | "prompt_dismissed",
) => {
  try {
    await fetch("/api/v1/analytics/install", {
      method: "POST",
      body: JSON.stringify({
        eventType,
        deviceInfo: {
          platform: platform.name,
          os: platform.product ?? platform.os?.family,
          device: platform.description,
        },
      }),
    });
  } catch (error) {
    console.error(error);
  }
};

const PwaInstall = React.forwardRef<PWAInstallElement>(({}, ref) => {
  // console.log((ref as MutableRefObject<PWAInstallElement>)?.current);
  // console.log(getBrowser(), getScreen());
  const [open, setOpen] = useState(false);
  const isFirefoxDesktop =
    getBrowser() === "firefox" && getScreen() !== "mobile";

  useEffect(() => {
    sendFetch("prompt_shown");
  }, []);

  useEffect(() => {
    if (isFirefoxDesktop) return;

    setTimeout(() => {
      const $ = (selector: string) => document.querySelector(selector);

      const pwaChromeMobile = $("pwa-install")?.shadowRoot;

      setTimeout(() => {
        pwaChromeMobile
          ?.querySelector(
            "div.install-dialog.chrome.mobile.available > div > pwa-bottom-sheet > div.body-header > button",
          )
          ?.addEventListener("click", () => {
            sendFetch("prompt_accepted");
            const browser = getBrowser();
            if (browser === "chrome" && window.deferredPromptEvent) {
              window.deferredPromptEvent.prompt();
              (
                ref as MutableRefObject<PWAInstallElement>
              )?.current.hideDialog();
            } else {
              (
                ref as MutableRefObject<PWAInstallElement>
              )?.current.hideDialog();
              setOpen(true);
            }
          });

        pwaChromeMobile
          ?.querySelector(
            "#pwa-install-element > div:nth-child(1) > div > div.action-buttons > button.material-button.primary.install",
          )
          ?.addEventListener("click", () => {
            sendFetch("prompt_accepted");
            const browser = getBrowser();
            if (browser === "chrome" && window.deferredPromptEvent) {
              window.deferredPromptEvent.prompt();
              (
                ref as MutableRefObject<PWAInstallElement>
              )?.current.hideDialog();
            } else {
              (
                ref as MutableRefObject<PWAInstallElement>
              )?.current.hideDialog();
              setOpen(true);
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
  }, [isFirefoxDesktop, ref]);

  if (isFirefoxDesktop) return null;

  return (
    <>
      <PWAInstall
        useLocalStorage
        ref={ref}
        manifestUrl="/manifest.json"
        onPwaInstallAvailableEvent={(event) => console.log(event)}
      ></PWAInstall>
      <AddToHomescreen open={open} setOpen={setOpen} />
    </>
  );
});

PwaInstall.displayName = "PwaInstall";

export default PwaInstall;
