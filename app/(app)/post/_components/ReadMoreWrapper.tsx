"use client";

import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import PwaInstall from "../../_components/PwaInstall";
import { PWAInstallElement } from "@khmyznikov/pwa-install";

const ReadMoreWrapper = ({ children }: { children: React.ReactNode }) => {
  const [open, setOpen] = React.useState(false);
  const pwaInstallRef = useRef<PWAInstallElement>(null);
  const handleOpen = () => {
    setOpen(true);
  };

  useEffect(() => {
    // get value from local storage
    const shouldHidePWA = localStorage.getItem("pwa-hide-install") === "true";
    if (open && !shouldHidePWA) {
      pwaInstallRef.current?.showDialog(true);
    }
  }, [open]);

  if (open) {
    return (
      <div>
        {children}
        <PwaInstall ref={pwaInstallRef} />
      </div>
    );
  }

  return (
    <div className="relative h-[600px] overflow-hidden">
      <div className="absolute size-full bg-gradient-to-b from-transparent to-white"></div>
      <Button
        className="absolute bottom-0 left-1/2 -translate-x-1/2"
        onClick={handleOpen}
        // variant="link"
      >
        Continue Reading
      </Button>
      {children}
    </div>
  );
};

export default ReadMoreWrapper;
