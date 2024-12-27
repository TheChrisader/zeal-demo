import { useEffect, useRef, useCallback } from "react";
import { Notification } from "@/types/notification.type";
import { GroupedNotifications } from "./GroupedNotifications";
import { EmptyState } from "./EmptyState";

interface NotificationListProps {
  notifications: Notification[];
  hasMore: boolean;
  loadMore: () => void;
  markAsRead: (id: string) => void;
}

function NotificationList({
  notifications,
  hasMore,
  loadMore,
  markAsRead,
}: NotificationListProps) {
  const observer = useRef<IntersectionObserver | null>(null);
  const lastNotificationRef = useCallback(
    (node: HTMLDivElement) => {
      if (observer.current) observer.current.disconnect();
      observer.current = new IntersectionObserver((entries) => {
        if (!entries[0]) return;
        if (entries[0].isIntersecting && hasMore) {
          loadMore();
        }
      });
      if (node) observer.current.observe(node);
    },
    [hasMore, loadMore],
  );

  useEffect(() => {
    return () => {
      if (observer.current) {
        observer.current.disconnect();
      }
    };
  }, []);

  if (notifications.length === 0) {
    return <EmptyState />;
  }

  return (
    <div className="mt-4 max-h-[calc(85vh-10rem)] space-y-4 overflow-y-auto px-4">
      <GroupedNotifications
        notifications={notifications}
        markAsRead={markAsRead}
      />
      <div ref={lastNotificationRef} className="h-1" />
    </div>
  );
}

export default NotificationList;
