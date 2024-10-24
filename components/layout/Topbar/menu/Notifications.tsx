import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverClose,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";

const NotificationsDropdown = ({ children }: { children: React.ReactNode }) => {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant={"outline"}
          className="flex h-auto items-center gap-2 rounded-full p-2"
        >
          {children}
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className="w-[400px] px-5 py-3"
        align="end"
        sideOffset={12}
      >
        <h3 className="text-lg font-semibold text-[#2F2D32]">Notifications</h3>
        <Separator className="my-3" />
        <span className="text-sm font-normal text-[#959595]">
          You have no new notifications
        </span>
      </PopoverContent>
    </Popover>
  );
};

export default NotificationsDropdown;
