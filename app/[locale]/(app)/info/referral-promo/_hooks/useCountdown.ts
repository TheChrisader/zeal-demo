"use client";
import { useState, useEffect } from "react";

interface TimeLeft {
  hours: number;
  minutes: number;
  seconds: number;
}

export const useCountdown = (targetDate: Date) => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({
    hours: 0,
    minutes: 0,
    seconds: 0,
  });

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = Math.max(0, targetDate - new Date());

      const hours = Math.floor(difference / (1000 * 60 * 60));
      const minutes = Math.floor((difference / (1000 * 60)) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      setTimeLeft({
        hours,
        minutes,
        seconds,
      });
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  const formattedTime = `${String(timeLeft.hours).padStart(2, "0")}:${String(
    timeLeft.minutes
  ).padStart(2, "0")}:${String(timeLeft.seconds).padStart(2, "0")}`;

  return {
    timeLeft,
    formattedTime,
  };
};

export const getNextFridayFivePM = (): Date => {
  const now = new Date();
  const target = new Date(now);
  const day = now.getDay();
  const daysUntilFriday = (5 - day + 7) % 7 || 7;
  target.setDate(now.getDate() + daysUntilFriday);
  target.setHours(17, 0, 0, 0);
  return target;
};