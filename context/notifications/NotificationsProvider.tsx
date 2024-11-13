import React, { createContext, useContext } from "react";
import { INotification, useNotifications } from "@/hooks/useNotifications";

interface NotificationsContextValue {
  notifications: INotification[];
  clearNotifications: () => void;
  error: string | null;
  isConnected: boolean;
  removeNotifications: (id: string) => void;
}

const NotificationContext = createContext<NotificationsContextValue | null>(
  null,
);

export function NotificationProvider({
  children,
  userId,
}: {
  children: React.ReactNode;
  userId: string;
}) {
  const notificationData = useNotifications(userId);

  return (
    <NotificationContext.Provider value={notificationData}>
      {children}
    </NotificationContext.Provider>
  );
}

export const useNotificationContext = () => {
  const context = useContext(NotificationContext);
  if (context === null) {
    throw new Error(
      "useNotificationContext must be used within a NotificationProvider",
    );
  }
  return context;
};
