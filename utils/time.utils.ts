import { formatDistanceToNowStrict } from "date-fns";

export function formatDistanceToNow(date: Date): string {
  return formatDistanceToNowStrict(date, { addSuffix: true });
}

// example time string "2024-08-23 10:44:59"
export const getPublishTimeStamp = (timestamp: string): string => {
  if (!timestamp) {
    return timestamp;
  }

  const date = new Date(timestamp);
  const now = new Date();

  const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  const intervals: { [key: string]: number } = {
    year: 31536000,
    month: 2592000,
    week: 604800,
    day: 86400,
    hour: 3600,
    minute: 60,
    second: 1,
  };

  for (const [key, value] of Object.entries(intervals)) {
    const count = Math.floor(seconds / value);
    if (count >= 1) {
      return `${count} ${key}${count > 1 ? "s" : ""} ago`;
    }
  }

  return "Just now";
};
