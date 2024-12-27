import { Notification } from "@/types/notification.type";
import { NotificationItem } from "./NotificationItem";
import { format } from "date-fns";

interface GroupedNotificationsProps {
  notifications: Notification[];
  markAsRead: (id: string) => void;
}

export function GroupedNotifications({
  notifications,
  markAsRead,
}: GroupedNotificationsProps) {
  const groupedNotifications = notifications.reduce(
    (groups, notification) => {
      const date = format(new Date(notification.created_at), "yyyy-MM-dd");
      if (!groups[date]) {
        groups[date] = [];
      }
      groups[date].push(notification);
      return groups;
    },
    {} as Record<string, Notification[]>,
  );

  return (
    <div className="space-y-6">
      {Object.entries(groupedNotifications).map(([date, notifs]) => (
        <div key={date} className="space-y-2">
          <h3 className="sticky top-0 z-10 bg-background py-2 text-sm font-medium text-muted-foreground">
            {format(new Date(date), "MMMM d, yyyy")}
          </h3>
          {notifs.map((notification) => (
            <NotificationItem
              key={notification._id?.toString()}
              notification={notification}
              markAsRead={markAsRead}
            />
          ))}
        </div>
      ))}
    </div>
  );
}
