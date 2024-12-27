"use client";
import { createContext, ReactNode, useContext } from "react";
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
