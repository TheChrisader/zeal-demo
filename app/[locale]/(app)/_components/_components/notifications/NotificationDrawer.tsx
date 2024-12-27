import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import NotificationList from "./NotificationList";
import { MarkAllAsReadButton } from "./MarkAllAsReadButton";
import { useNotificationContext } from "@/context/notifications/NotificationsProvider";

interface NotificationDrawerProps {
  isOpen: boolean;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

export function NotificationDrawer({
  isOpen,
  setOpen,
}: NotificationDrawerProps) {
  const {
    notifications,
    // hasMore,
    // fetchNotifications,
    markAsRead,
    markAllAsRead,
    unread,
  } = useNotificationContext();

  const hasMore = true;
  const fetchNotifications = () => {};
  // const markAsRead = () => {};
  // const markAllAsRead = () => {};

  return (
    <Drawer open={isOpen} onOpenChange={setOpen}>
      <DrawerContent className="h-[85vh] sm:max-h-[85vh]">
        <DrawerHeader className="flex flex-row items-center justify-between">
          <DrawerTitle>Notifications</DrawerTitle>
          <MarkAllAsReadButton
            onClick={markAllAsRead}
            disabled={unread === 0}
          />
        </DrawerHeader>
        <NotificationList
          notifications={notifications}
          hasMore={hasMore}
          loadMore={fetchNotifications}
          markAsRead={markAsRead}
        />
      </DrawerContent>
    </Drawer>
  );
}
