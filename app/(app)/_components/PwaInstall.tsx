"use client";

import { PWAInstallElement } from "@khmyznikov/pwa-install";
import PWAInstall from "@khmyznikov/pwa-install/react-legacy";
import React from "react";

declare global {
  interface Window {
    // @eslint-disable-next-line @typescript-eslint/no-explicit-any
    //   promptEvent: any;
  }
}

const PwaInstall = React.forwardRef<PWAInstallElement>(({}, ref) => {
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
