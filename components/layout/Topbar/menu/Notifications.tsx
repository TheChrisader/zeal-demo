"use client";
import NotificationList from "@/app/[locale]/(app)/_components/_components/notifications/NotificationList";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { useNotificationContext } from "@/context/notifications/NotificationsProvider";
// import { useNotifications } from "@/hooks/useNotifications";

const NotificationsDropdown = ({ children }: { children: React.ReactNode }) => {
  const { notifications, markAsRead, markAllAsRead } = useNotificationContext();

  const hasMore = true;
  const fetchNotifications = () => {};

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="relative flex h-auto items-center gap-2 rounded-full p-2"
        >
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[700px] px-5 py-3"
        align="end"
        sideOffset={12}
      >
        <h3 className="text-foreground-alt text-lg font-semibold">
          Notifications
        </h3>
        <Separator className="my-3" />
        <NotificationList
          notifications={notifications}
          hasMore={hasMore}
          loadMore={fetchNotifications}
          markAsRead={markAsRead}
        />
        {/* <span className="text-sm font-normal text-[#959595]">
          You have no new notifications
        </span> */}
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
