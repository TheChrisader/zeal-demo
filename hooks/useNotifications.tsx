import { useEffect, useState } from "react";
// import { PushSubscription } from "web-push";

export interface INotification {
  id: string;
  type: string;
  message: string;
  timestamp: string;
  // options?: NotificationOptions;
}

function convertBase64URLToBase64(base64url: string) {
  // Replace URL-safe characters with standard Base64 characters
  let base64 = base64url.replace(/-/g, "+").replace(/_/g, "/");

  // Add padding if necessary
  while (base64.length % 4 !== 0) {
    base64 += "=";
  }

  return base64;
}

const subscribeToPush = async (
  registration: ServiceWorkerRegistration,
): Promise<PushSubscription> => {
  try {
    const response = await fetch("/api/v1/push/vapid-public-key");
    const { vapidPublicKey } = await response.json();

    console.log(vapidPublicKey);

    const vapidKey = Uint8Array.from(
      atob((vapidPublicKey as string).replace(/-/g, "+").replace(/_/g, "/")),
      (c) => c.charCodeAt(0),
    );

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: vapidKey,
    });

    await fetch("/api/v1/push/subscribe", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(subscription),
    });

    return subscription;
  } catch (error) {
    console.error("Error subscribing to push notifications:", error);
    return Promise.reject(error);
  }
};

export function useNotifications(userId: string) {
  const [notifications, setNotifications] = useState<INotification[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const eventSource = new EventSource(`/api/v1/notifications/`, {
      withCredentials: true,
    });

    eventSource.onopen = () => {
      setIsConnected(true);
      setError(null);
    };

    eventSource.onmessage = (event) => {
      const data = JSON.parse(event.data);
      if (data.type === "connection") {
        console.log(data.message);
        setIsConnected(true);
        return;
      }
      setNotifications((prevNotifications) => [...prevNotifications, data]);
    };

    eventSource.onerror = (error) => {
      console.error("SSE error:", error);
      setError("Connection error. Retrying...");
      setIsConnected(false);
    };

    if ("Notification" in window && "serviceWorker" in navigator) {
      Notification.requestPermission()
        .then((permission) => {
          if (permission === "granted") {
            return navigator.serviceWorker.getRegistration();
          }
        })
        .then((registration) => {
          if (registration) {
            subscribeToPush(registration);
            setPushEnabled(true);
          }
        })
        .catch(console.error);
    }

    return () => {
      eventSource.close();
      setIsConnected(false);
    };
  }, [userId]);

  const clearNotifications = () => {
    setNotifications([]);
  };

  const removeNotifications = (id: string) => {
    setNotifications((prevNotifications) =>
      prevNotifications.filter((notification) => notification.id !== id),
    );
  };

  return {
    notifications,
    clearNotifications,
    error,
    isConnected,
    removeNotifications,
  };
}
