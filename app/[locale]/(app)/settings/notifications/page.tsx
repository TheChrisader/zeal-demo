"use client";
import { useEffect, useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { updatePreferences } from "@/services/preferences.services";
import { usePreferences } from "@/hooks/usePreferences";

const NotificationsSettings = () => {
  const { preferences, initialized } = usePreferences();
  const [isLoading, setIsLoading] = useState(false);

  const [push, setPush] = useState(false);
  const [email, setEmail] = useState(false);
  const [inApp, setInApp] = useState(false);

  useEffect(() => {
    if (preferences) {
      setPush(preferences.notification_preferences.push_notification);
      setEmail(preferences.notification_preferences.email_notification);
      setInApp(preferences.notification_preferences.in_app_notification);
    }
  }, [preferences]);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      preferences!.notification_preferences = {
        push_notification: push,
        email_notification: email,
        in_app_notification: inApp,
      };
      await updatePreferences(preferences!);

      // revalidatePathAction("/settings/notifications");
    } catch (error) {
      console.log(error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="mb-4 flex w-full items-center justify-between">
        <div className="flex flex-col">
          <h3 className="text-lg font-bold text-foreground-alt">
            Notification Settings
          </h3>
          <span className="text-sm font-normal text-muted-alt">
            Configure your notification settings and preferences
          </span>
        </div>
      </div>
      <Separator className="mb-6" />
      <div className="flex w-full max-w-[40vw] flex-col gap-2 max-[500px]:max-w-full">
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-subtle-hover-bg">
          <div className="flex">
            <span className="text-sm font-normal text-foreground-alt">
              Push Notifications
            </span>
          </div>
          <Switch checked={push} onCheckedChange={() => setPush(!push)} />
        </label>
        {/* <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-subtle-hover-bg">
          <div className="flex">
            <span className="text-sm font-normal text-foreground-alt">
              In-App Notifications
            </span>
          </div>
          <Switch checked={inApp} onCheckedChange={() => setInApp(!inApp)} />
        </label> */}
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-subtle-hover-bg">
          <div className="flex">
            <span className="text-sm font-normal text-foreground-alt">
              Email Notifications
            </span>
          </div>
          <Switch checked={email} onCheckedChange={() => setEmail(!email)} />
        </label>
      </div>
      <div className="mt-9 flex w-full justify-end">
        <Button onClick={handleSaveChanges}>
          {isLoading ? "Saving..." : "Save Changes"}
        </Button>
      </div>
    </div>
  );
};

export default NotificationsSettings;
