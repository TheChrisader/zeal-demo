import { Notification } from "@/types/notification.type";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import {
  Award,
  Bell,
  Heart,
  MessageSquare,
  Share2,
  User,
  Zap,
} from "lucide-react";
import { formatDistanceToNow } from "@/utils/time.utils";
import { useRouter } from "@/app/_components/useRouter";

interface NotificationItemProps {
  notification: Notification;
  markAsRead: (id: string) => void;
}

export function NotificationItem({
  notification,
  markAsRead,
}: NotificationItemProps) {
  const { _id, type, subtype, content, status, created_at, targetObject } =
    notification;
  const router = useRouter();

  const getIcon = () => {
    switch (type) {
      case "INTERACTION":
        return subtype === "POST_LIKE" ? (
          <Heart className="h-4 w-4" />
        ) : subtype === "SHARED_POST" ? (
          <Share2 className="h-4 w-4" />
        ) : (
          <MessageSquare className="h-4 w-4" />
        );
      case "RECOMMENDATION":
        return <Zap className="h-4 w-4" />;
      case "SYSTEM":
        return <Bell className="h-4 w-4" />;
      case "ACHIEVEMENT":
        return <Award className="h-4 w-4" />;
      case "REMINDER":
        return <Bell className="h-4 w-4" />;
      case "MENTION":
        return <User className="h-4 w-4" />;
      default:
        return <Bell className="h-4 w-4" />;
    }
  };

  const handleClick = () => {
    if (!status.isRead) {
      markAsRead(_id!.toString());
    }
    // Handle navigation or action based on notification type
    if (content.url) {
      // window.open(content.url, "_blank");
      if (type === "RECOMMENDATION") {
        router.push(`/post/${targetObject.slug}`);
      }
    }
  };

  return (
    <Card
      className={`cursor-pointer transition-all duration-300 ease-in-out ${
        status.isRead
          ? "border-muted bg-background"
          : "border-primary bg-accent shadow-md"
      }`}
      onClick={handleClick}
    >
      <CardContent className="flex items-start space-x-4 p-4">
        <Avatar className={`h-10 w-10 ${status.isRead ? "opacity-50" : ""}`}>
          <AvatarImage src={content.thumbnail} alt={content.title} />
          <AvatarFallback>{getIcon()}</AvatarFallback>
        </Avatar>
        <div className="flex-1 space-y-1">
          <p
            className={`text-sm font-medium ${status.isRead ? "text-muted-foreground" : "text-foreground"}`}
          >
            {content.title}
          </p>
          {/* <p
            className={`text-sm ${status.isRead ? "text-muted-foreground" : "text-foreground"}`}
          >
            {content.body}
          </p> */}
        </div>
        <Badge variant={status.isRead ? "outline" : "default"}>{type}</Badge>
      </CardContent>
      <CardFooter className="justify-between px-4 py-2 text-xs text-muted-foreground">
        <span>{formatDistanceToNow(created_at)}</span>
        {!status.isRead && (
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              markAsRead(_id!.toString());
            }}
            className="hover:bg-primary hover:text-primary-foreground"
          >
            Mark as read
          </Button>
        )}
      </CardFooter>
    </Card>
  );
}
