"use client";
import { Bell, Mail, Smartphone } from "lucide-react";
import { Loader2, Save } from "lucide-react";
import { useEffect, useState } from "react";
import revalidatePathAction from "@/app/actions/revalidatePath";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { usePreferences } from "@/hooks/usePreferences";
import { updatePreferences } from "@/services/preferences.services";

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
    <TooltipProvider>
      <div className="w-full space-y-4 p-4 sm:mx-auto sm:max-w-4xl sm:space-y-6 sm:p-0">
        {/* Header */}
        <Card className="w-full border-0 bg-transparent shadow-none">
          <CardHeader className="space-y-4 p-0 pb-4 sm:pb-6">
            <div className="flex flex-col space-y-3 sm:flex-row sm:items-center sm:justify-between sm:space-y-0">
              <div>
                <CardTitle className="text-xl font-bold text-foreground/80 sm:text-2xl">
                  Notification Settings
                </CardTitle>
                <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 text-xs text-muted-foreground/70">
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      Ctrl+S
                    </kbd>
                    save
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="rounded bg-muted/60 px-1.5 py-0.5 text-[10px]">
                      Esc
                    </kbd>
                    cancel
                  </span>
                </div>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-4 p-0 sm:space-y-2">
            <div className="grid gap-6 sm:gap-8">
              <div className="space-y-6">
                <Card className="border-0 bg-gradient-to-br from-background via-background to-muted/20 shadow-sm">
                  <CardHeader className="px-0 pb-4">
                    <div className="flex items-center justify-between">
                      <div className="space-y-1">
                        <CardTitle className="flex items-center gap-2 text-xl font-semibold">
                          <Bell className="size-5 text-muted-foreground" />
                          Notification Preferences
                        </CardTitle>
                        <p className="text-sm text-muted-foreground">
                          Choose how you want to receive notifications
                        </p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-0.5 px-0 sm:px-6">
                    <div className="space-y-0.5">
                      {/* Push Notifications */}
                      <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-blue-500/5 p-2 transition-all duration-200 group-hover:bg-blue-500/10">
                              <Smartphone className="size-4 text-blue-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  Push Notifications
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                                {push && (
                                  <Badge
                                    variant="secondary"
                                    className="h-4 gap-1 px-1.5 text-[10px]"
                                  >
                                    <span className="size-1.5 rounded-full bg-blue-500" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/75">
                                Receive push notifications on your mobile device
                                for important updates and announcements.
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 shrink-0">
                            <Switch
                              checked={push}
                              onCheckedChange={() => setPush(!push)}
                              className="data-[state=checked]:bg-blue-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* Email Notifications */}
                      <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-green-500/5 p-2 transition-all duration-200 group-hover:bg-green-500/10">
                              <Mail className="size-4 text-green-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  Email Notifications
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                                {email && (
                                  <Badge
                                    variant="secondary"
                                    className="h-4 gap-1 px-1.5 text-[10px]"
                                  >
                                    <span className="size-1.5 rounded-full bg-green-500" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/75">
                                Get email updates about your account activity,
                                new features, and important announcements.
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 shrink-0">
                            <Switch
                              checked={email}
                              onCheckedChange={() => setEmail(!email)}
                              className="data-[state=checked]:bg-green-600"
                            />
                          </div>
                        </div>
                      </div>

                      {/* In-App Notifications (Commented out for now, but styled for future use) */}
                      {/* <div className="group relative rounded-lg border border-border/40 bg-gradient-to-r from-background/80 to-muted/5 p-4 transition-all duration-200 hover:border-primary/15 hover:bg-muted/10">
                        <div className="relative flex items-center justify-between">
                          <div className="flex items-start gap-3">
                            <div className="shrink-0 rounded-lg bg-purple-500/5 p-2 transition-all duration-200 group-hover:bg-purple-500/10">
                              <Bell className="size-4 text-purple-600" />
                            </div>
                            <div className="min-w-0 flex-1 space-y-1">
                              <div className="flex items-center gap-2">
                                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground/70">
                                  In-App Notifications
                                </p>
                                <div className="h-px flex-1 bg-border/30" />
                                {inApp && (
                                  <Badge variant="secondary" className="h-4 gap-1 px-1.5 text-[10px]">
                                    <span className="size-1.5 rounded-full bg-purple-500" />
                                    Active
                                  </Badge>
                                )}
                              </div>
                              <p className="text-sm leading-relaxed text-foreground/75">
                                See notifications within the app when you're actively using it.
                              </p>
                            </div>
                          </div>
                          <div className="ml-4 shrink-0">
                            <Switch
                              checked={inApp}
                              onCheckedChange={() => setInApp(!inApp)}
                              className="data-[state=checked]:bg-purple-600"
                            />
                          </div>
                        </div>
                      </div> */}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Save Button */}
        <div className="mb-8 mt-10 flex w-full justify-end px-4 sm:mx-auto sm:mb-16 sm:max-w-4xl sm:px-0 sm:pb-16">
          <Button
            onClick={handleSaveChanges}
            disabled={isLoading}
            className="relative h-10 min-w-[120px] gap-2 px-6 transition-all duration-200 hover:scale-[1.02]"
          >
            {isLoading ? (
              <>
                <Loader2 className="size-4 animate-spin" />
                <span>Saving...</span>
              </>
            ) : (
              <>
                <Save className="size-4" />
                <span>Save Changes</span>
              </>
            )}
          </Button>
        </div>
      </div>
    </TooltipProvider>
  );
};

export default NotificationsSettings;
