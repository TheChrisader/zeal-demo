import { useCallback, useEffect, useState } from "react";
import { type Notification } from "@/types/notification.type";
// import { PushSubscription } from "web-push";

// export interface INotification {
//   id: string;
//   type: string;
//   message: string;
//   timestamp: string;
//   // options?: NotificationOptions;
// }

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

const fetchNotifications = async () => {
  try {
    const response = await fetch("/api/v1/notifications");
    const data = await response.json();
    return data;
  } catch (error) {
    console.error("Error fetching notifications:", error);
  }
};

const markAsReadOnServer = async (id: string) => {
  await fetch(`/api/v1/notifications/${id}`, {
    method: "PATCH",
    body: JSON.stringify({
      action: "markAsRead",
    }),
  });
};

const markAllAsReadOnServer = async () => {
  await fetch(`/api/v1/notifications/mark-all-read`, {
    method: "POST",
  });
};

export function useNotifications(userId?: string) {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [unread, setUnread] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [pushEnabled, setPushEnabled] = useState(false);

  useEffect(() => {
    setUnread(notifications.filter((n) => !n.status.isRead).length);
  }, [notifications]);

  useEffect(() => {
    if (!userId) return;

    const fetchNotifications = async () => {
      try {
        const response = await fetch("/api/v1/notifications");
        const data = await response.json();
        const { notifications, pagination } = data;
        setNotifications(notifications);
      } catch (error) {
        console.error("Error fetching notifications:", error);
      }
    };

    fetchNotifications();

    const eventSource = new EventSource(`/api/v1/notifications/connect`, {
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
      setNotifications((prevNotifications) => [data, ...prevNotifications]);
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
      prevNotifications.filter(
        (notification) => notification._id!.toString() !== id,
      ),
    );
  };

  const markAsRead = useCallback((id: string) => {
    if (!id) return;
    setNotifications((prev) =>
      prev.map((notif) =>
        notif._id?.toString() === id
          ? {
              ...notif,
              status: { ...notif.status, isRead: true, readAt: new Date() },
            }
          : notif,
      ),
    );
    markAsReadOnServer(id);
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({
        ...notif,
        status: { ...notif.status, isRead: true, readAt: new Date() },
      })),
    );
    markAllAsReadOnServer();
  }, []);

  return {
    notifications,
    unread,
    clearNotifications,
    error,
    isConnected,
    removeNotifications,
    pushEnabled,
    markAsRead,
    markAllAsRead,
  };
}
