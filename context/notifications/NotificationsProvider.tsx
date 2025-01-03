"use client";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { useNotifications } from "@/hooks/useNotifications";
import { Notification } from "@/types/notification.type";
import useAuth from "../auth/useAuth";

interface NotificationContextType {
  notifications: Notification[];
  unread: number;
  clearNotifications: () => void;
  removeNotification: (id: string) => void;
  error: string | null;
  isConnected: boolean;
  pushEnabled: boolean;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(
  undefined,
);

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
};

interface NotificationProviderProps {
  children: ReactNode;
  // userId: string;
}

export const NotificationProvider = ({
  children,
  // userId,
}: NotificationProviderProps) => {
  const { user } = useAuth();
  const {
    notifications,
    unread,
    clearNotifications,
    removeNotifications: removeNotification,
    error,
    isConnected,
    pushEnabled,
    markAsRead,
    markAllAsRead,
  } = useNotifications(user?.id.toString());

  useEffect(() => {
    if (!isConnected) return;
    const heartbeatInterval = setInterval(async () => {
      await fetch("/api/v1/heartbeat", { method: "POST" });
    }, 60000);

    return () => clearInterval(heartbeatInterval);
  }, [isConnected]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        unread,
        clearNotifications,
        removeNotification,
        error,
        isConnected,
        pushEnabled,
        markAsRead,
        markAllAsRead,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};
