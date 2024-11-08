"use client";
import Script from "next/script";

const DeferInstallPromptEvent = () => {
  return (
    <Script id="defer-install-prompt-event">
      {`
      console.log("object!!!!!!!!!!!!!!!!!!!!");
            window.addEventListener('beforeinstallprompt', (e) => {
            console.log("!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!");
                e.preventDefault();
                e.stopPropagation();
                e.stopImmediatePropagation();
                setTimeout(() => {
                  window.deferredPromptEvent = e;
                }, 500)
            });
     `}
    </Script>
  );
};

export default DeferInstallPromptEvent;
