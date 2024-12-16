export const calculateReadingSpeed = (
  wordCount: number,
  timeSpent: number,
): number => {
  const minutes = timeSpent / 60;
  return Math.round(wordCount / minutes);
};

export const getTimeOfDay = (): string => {
  const hour = new Date().getHours();
  if (hour < 6) return "Night";
  if (hour < 12) return "Morning";
  if (hour < 18) return "Afternoon";
  return "Evening";
};

export const getDeviceType = (): string => {
  const ua = navigator.userAgent;
  if (/(tablet|ipad|playbook|silk)|(android(?!.*mobi))/i.test(ua)) {
    return "Tablet";
  }
  if (
    /Mobile|Android|iP(hone|od)|IEMobile|BlackBerry|Kindle|Silk-Accelerated/i.test(
      ua,
    )
  ) {
    return "Mobile";
  }
  return "Desktop";
};
