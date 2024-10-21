"use client";
import { useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import useAuth from "@/context/auth/useAuth";
import { updatePreferences } from "@/services/preferences.services";

const NotificationsSettings = () => {
  const { preferences } = useAuth();
  const [isLoading, setIsLoading] = useState(false);

  const {
    notification_preferences: {
      push_notification,
      email_notification,
      in_app_notification,
    },
  } = preferences!;

  const [push, setPush] = useState(push_notification);
  const [email, setEmail] = useState(email_notification);
  const [inApp, setInApp] = useState(in_app_notification);

  const handleSaveChanges = async () => {
    setIsLoading(true);
    try {
      preferences!.notification_preferences = {
        push_notification: push,
        email_notification: email,
        in_app_notification: inApp,
      };
      // console.log(preferences);
      await updatePreferences(preferences!);

      revalidatePathAction("/settings/notifications");
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
          <h3 className="text-lg font-bold text-[#2F2D32]">
            Notification Settings
          </h3>
          <span className="text-sm font-normal text-[#696969]">
            Configure your notification settings and preferences
          </span>
        </div>
      </div>
      <Separator className="mb-6" />
      <div className="flex w-full max-w-[40vw] flex-col gap-2 max-[500px]:max-w-full">
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-gray-100">
          <div className="flex">
            <span className="text-sm font-normal text-[#2F2D32]">
              Push Notifications
            </span>
          </div>
          <Switch checked={push} onCheckedChange={() => setPush(!push)} />
        </label>
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-gray-100">
          <div className="flex">
            <span className="text-sm font-normal text-[#2F2D32]">
              In-App Notifications
            </span>
          </div>
          <Switch checked={inApp} onCheckedChange={() => setInApp(!inApp)} />
        </label>
        <label className="flex cursor-pointer items-center justify-between py-2 hover:bg-gray-100">
          <div className="flex">
            <span className="text-sm font-normal text-[#2F2D32]">
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
