import { Bell } from "lucide-react";

export function EmptyState() {
  return (
    <div className="flex h-[50vh] flex-col items-center justify-center text-center">
      <Bell className="mb-4 h-12 w-12 text-muted-foreground" />
      <h3 className="text-lg font-semibold">No notifications</h3>
      <p className="mt-2 text-sm text-muted-foreground">
        You're all caught up! Check back later for new notifications.
      </p>
    </div>
  );
}
