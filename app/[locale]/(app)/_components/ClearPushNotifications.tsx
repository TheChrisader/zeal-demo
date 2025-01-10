"use client";
import { useEffect } from "react";

const ClearPushNotifications = () => {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.ready.then((reg) => {
        reg.getNotifications().then((notifications) => {
          for (let i = 0; i < notifications.length; i += 1) {
            notifications[i]?.close();
            //   console.log(notifications[i])
          }
        });
      });
    }
  }, []);

  return null;
};

export default ClearPushNotifications;
