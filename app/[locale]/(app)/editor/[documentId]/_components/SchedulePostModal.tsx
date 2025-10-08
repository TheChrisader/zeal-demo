"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from "date-fns";
import { CalendarIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import { IDraft } from "@/types/draft.type";
import { toast } from "sonner";
import { schedulePost } from "@/services/scheduledPost.services";
import { useAuth } from "@/hooks/useAuth";

interface SchedulePostModalProps {
  document: IDraft;
  onClose: () => void;
  onSave: (scheduledPost: any) => void;
}

const SchedulePostModal: React.FC<SchedulePostModalProps> = ({
  document,
  onClose,
  onSave,
}) => {
  const { user } = useAuth();
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [time, setTime] = useState<string>("12:00");
  const [loading, setLoading] = useState(false);

  // Get next available hour (rounded up to the next hour)
  useEffect(() => {
    const now = new Date();
    const nextHour = new Date(now);
    nextHour.setHours(now.getHours() + 1);
    nextHour.setMinutes(0);
    nextHour.setSeconds(0);
    setDate(nextHour);
    setTime(`${nextHour.getHours().toString().padStart(2, "0")}:00`);
  }, []);

  const handleSchedule = async () => {
    if (!date) {
      toast.error("Please select a date");
      return;
    }

    try {
      setLoading(true);

      // Combine date and time
      const [hours, minutes] = time.split(":").map(Number);
      const scheduledDateTime = new Date(date);
      scheduledDateTime.setHours(hours, minutes, 0, 0);

      // Check if scheduled time is in the past
      if (scheduledDateTime <= new Date()) {
        toast.error("Scheduled time must be in the future");
        return;
      }

      const result = await schedulePost(
        {
          draftId: document._id?.toString() || document.id?.toString(),
          scheduled_at: scheduledDateTime.toISOString(),
        },
        user?.role,
      );

      onSave(result);

      // Show different success messages based on user role
      if (user?.role === "freelance_writer") {
        toast.success("Draft scheduled for approval!");
      } else {
        toast.success("Post scheduled successfully!");
      }

      onClose();
    } catch (error) {
      console.error("Error scheduling post:", error);
      toast.error("Failed to schedule post");
    } finally {
      setLoading(false);
    }
  };

  // Check if a time option should be disabled
  const isTimeDisabled = (timeValue: string) => {
    if (!date) return false;

    const now = new Date();
    const isToday = date.toDateString() === now.toDateString();

    if (!isToday) return false;

    const [hours] = timeValue.split(":").map(Number);
    const currentHour = now.getHours();

    return hours <= currentHour;
  };

  // Generate time options for every hour
  const timeOptions = Array.from({ length: 24 }, (_, i) => {
    const hour = i.toString().padStart(2, "0");
    const timeValue = `${hour}:00`;
    return {
      value: timeValue,
      label: timeValue,
      disabled: isTimeDisabled(timeValue),
    };
  });

  const isFreelanceWriter = user?.role === "freelance_writer";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="w-full max-w-md rounded-lg bg-background p-6">
        <h2 className="mb-4 text-xl font-bold">
          {isFreelanceWriter ? "Schedule Draft for Approval" : "Schedule Post"}
        </h2>

        <div className="mb-4 rounded-md bg-muted p-3">
          <p className="text-sm text-muted-foreground">
            {isFreelanceWriter
              ? "Your draft will be scheduled for approval. Once the scheduled time arrives, it will be submitted for review."
              : "Your post will be published automatically at the scheduled time."}
          </p>
        </div>

        <div className="space-y-4">
          <div>
            <label className="mb-2 block text-sm font-medium">Date</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant={"outline"}
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !date && "text-muted-foreground",
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "PPP") : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent
                className="w-auto overflow-auto p-0"
                align="start"
                side="bottom"
              >
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  captionLayout="dropdown"
                  disabled={{ before: new Date() }}
                  className="w-64 rounded-sm border p-1 shadow-sm"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div>
            <label className="mb-2 block text-sm font-medium">
              Time (Hourly)
            </label>
            <Select value={time} onValueChange={setTime} disabled={loading}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Select a time" />
              </SelectTrigger>
              <SelectContent
                position="popper"
                side="bottom"
                align="start"
                className="max-h-[350px] overflow-auto"
                avoidCollisions={true}
              >
                {timeOptions.map((timeOption) => (
                  <SelectItem
                    key={timeOption.value}
                    value={timeOption.value}
                    disabled={timeOption.disabled}
                  >
                    {timeOption.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={onClose} disabled={loading}>
              Cancel
            </Button>
            <Button onClick={handleSchedule} disabled={loading}>
              {loading
                ? "Scheduling..."
                : isFreelanceWriter
                  ? "Schedule for Approval"
                  : "Schedule Post"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SchedulePostModal;
