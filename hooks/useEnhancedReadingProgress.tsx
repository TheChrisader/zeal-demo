import useAuth from "@/context/auth/useAuth";
import { usePathname } from "@/i18n/routing";
import { updateReadingProgress } from "@/services/analytics.services";
import {
  calculateReadingSpeed,
  getDeviceType,
  getTimeOfDay,
} from "@/utils/analytics.utils";
import { useEffect, useState } from "react";

export const useEnhancedReadingProgress = (
  //   postId: string,
  //   wordCount: number,
  shouldRun: boolean,
) => {
  const [startTime] = useState<number>(Date.now());
  const [sessionId] = useState<string>(crypto.randomUUID());
  const { user } = useAuth();
  const userId = user?.id.toString();
  const postId = usePathname().split("/").pop();
  // const [highlights, setHighlights] = useState<string[]>([]);

  useEffect(() => {
    if (!shouldRun) return;

    const targetElement = document.getElementById("data-article-end");

    const calculateEnhancedMetrics = () => {
      const timeSpent = Math.floor((Date.now() - startTime) / 1000);
      const scrollDepth = Math.floor(
        (window.scrollY /
          (targetElement!.getBoundingClientRect().top +
            window.scrollY -
            window.innerHeight)) *
          100,
      );
      const readComplete = scrollDepth > 90;

      return {
        timeSpent,
        scrollDepth,
        readComplete,
        lastPosition: window.scrollY,
        // readingSpeed: calculateReadingSpeed(wordCount, timeSpent),
        timeOfDay: getTimeOfDay(),
        deviceType: getDeviceType(),
        readingSession: sessionId,
        interactions: {
          // highlightCount: highlights.length
        },
      };
    };

    const updateProgress = async () => {
      const metrics = calculateEnhancedMetrics();
      //   await updateReadingProgress({
      //     userId,
      //     postId,
      //     ...metrics,
      //   });
      console.log(metrics);
    };

    const intervalId: NodeJS.Timeout = setInterval(updateProgress, 12000);

    return () => {
      updateProgress();
      clearInterval(intervalId);
    };
  }, [userId, postId, startTime, sessionId, shouldRun]);

  // Return functions for tracking interactions
  // return {
  //   addHighlight: (text: string) => {
  //     setHighlights(prev => [...prev, text]);
  //   },
  //   getHighlights: () => highlights
  // };
};
