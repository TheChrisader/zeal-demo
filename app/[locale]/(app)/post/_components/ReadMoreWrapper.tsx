"use client";

import { PWAInstallElement } from "@khmyznikov/pwa-install";
import React, { useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import PwaInstall from "../../_components/PwaInstall";
import { useEnhancedReadingProgress } from "@/hooks/useEnhancedReadingProgress";
import { ArticleDisplayManager } from "@/components/layout/NewsletterForm/ArticleDisplayManager";
import { usePathname } from "@/i18n/routing";
import { getArticleBySlug } from "../_actions/getArticleBySlug";
import { IPost } from "@/types/post.type";

function getPWADisplayMode() {
  if (document.referrer.startsWith("android-app://")) return "twa";
  if (window.matchMedia("(display-mode: browser)").matches) return "browser";
  if (window.matchMedia("(display-mode: standalone)").matches)
    return "standalone";
  if (window.matchMedia("(display-mode: minimal-ui)").matches)
    return "minimal-ui";
  if (window.matchMedia("(display-mode: fullscreen)").matches)
    return "fullscreen";
  if (window.matchMedia("(display-mode: window-controls-overlay)").matches)
    return "window-controls-overlay";

  return "unknown";
}

function setWithExpiry(key: string, value: unknown, ttl: number) {
  const now = new Date();

  // `item` is an object which contains the original value
  // as well as the time when it's supposed to expire
  const item = {
    value: value,
    expiry: now.getTime() + ttl,
  };
  localStorage.setItem(key, JSON.stringify(item));
}

function getWithExpiry(key: string) {
  const itemStr = localStorage.getItem(key);
  // if the item doesn't exist, return null
  if (!itemStr) {
    return null;
  }
  const item = JSON.parse(itemStr);
  const now = new Date();
  // compare the expiry time of the item with the current time
  if (now.getTime() > item.expiry) {
    // If the item is expired, delete the item from storage
    // and return null
    localStorage.removeItem(key);
    return null;
  }
  return item.value;
}

const ReadMoreWrapper = ({
  children,
  isSubscribedInitially,
}: {
  children: React.ReactNode;
  isSubscribedInitially?: boolean;
}) => {
  const [open, setOpen] = React.useState(false);
  const [post, setPost] = React.useState<IPost | null>(null);
  const pwaInstallRef = useRef<PWAInstallElement>(null);
  const handleOpen = () => {
    setOpen(true);
  };

  const pathname = usePathname();
  const slug = pathname.split("/")[2];

  useEffect(() => {
    const getAricle = async () => {
      const article = await getArticleBySlug(slug || "");
      setPost(article);
    };

    getAricle();
  }, [slug]);

  useEnhancedReadingProgress(open);

  useEffect(() => {
    const shouldHidePWA = localStorage.getItem("pwa-hide-install") === "true";
    if (open && !shouldHidePWA) {
      if (getPWADisplayMode() === "standalone") return;

      setTimeout(() => {
        if (getWithExpiry("pwa-install-prompt")) {
          return;
        }

        pwaInstallRef.current?.showDialog(true);
        setWithExpiry("pwa-install-prompt", true, 1000 * 60 * 60 * 24);
      }, 1000);
    }
  }, [open]);

  if (open) {
    return (
      <div>
        {children}
        <ArticleDisplayManager
          shouldDisplayWall={post?.shouldShowCTA || true}
          isSubscribedInitially={isSubscribedInitially || false}
        />
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
      >
        Continue Reading
      </Button>
      {children}
    </div>
  );
};

export default ReadMoreWrapper;
