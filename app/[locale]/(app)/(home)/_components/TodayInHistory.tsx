"use client";

import type React from "react";
import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar, ChevronLeft, ChevronRight, Clock, Star } from "lucide-react";
import { AnimatePresence, motion } from "framer-motion";

interface HistoricalEvent {
  event: string;
  year: string;
}

// Mock function to fetch historical data

export const TodayInHistory: React.FC = () => {
  const [events, setEvents] = useState<HistoricalEvent[]>([]);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const fetchTodayInHistory = async (): Promise<HistoricalEvent[]> => {
      const response = await fetch(`/api/v1/history`);
      const events: HistoricalEvent[] = await response.json();
      setEvents(events);
      return events;
    };

    fetchTodayInHistory();
  }, []);

  const handlePrev = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex > 0 ? prevIndex - 1 : events.length - 1,
    );
  };

  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < events.length - 1 ? prevIndex + 1 : 0,
    );
  };

  if (events.length === 0) {
    // return <div>Loading...</div>;
    return null;
  }

  return (
    <div className="w-full bg-gradient-to-r from-gray-100 to-gray-200 p-4 dark:from-gray-800 dark:to-gray-900 sm:p-6 md:p-8">
      <Card className="mx-auto w-full max-w-6xl overflow-hidden bg-white shadow-lg dark:bg-gray-800">
        <CardContent className="p-6">
          <div className="mb-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Calendar className="h-6 w-6 text-primary" />
              <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">
                Today in History
              </h2>
            </div>
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="icon" onClick={handlePrev}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="icon" onClick={handleNext}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="relative mb-8 h-1 rounded-full bg-gray-200 dark:bg-gray-700">
            <div
              className="absolute h-1 rounded-full bg-primary transition-all duration-300 ease-in-out"
              style={{
                width: `${((currentIndex + 1) / events.length) * 100}%`,
              }}
            />
          </div>

          <AnimatePresence mode="wait">
            <motion.div
              key={currentIndex}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
              className="flex flex-col items-start justify-between sm:flex-row sm:items-center"
            >
              <div className="mb-4 flex items-center space-x-4 sm:mb-0">
                <div className="rounded-lg bg-primary p-3 text-2xl font-bold text-white sm:text-3xl md:text-4xl">
                  {events[currentIndex]?.year}
                </div>
                <Clock className="h-8 w-8 text-gray-400" />
              </div>
              <p className="flex-1 text-lg text-gray-700 dark:text-gray-300 sm:ml-6 sm:text-xl md:text-2xl">
                {events[currentIndex]?.event}
              </p>
            </motion.div>
          </AnimatePresence>

          <div className="mt-8 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
            <div className="flex items-center space-x-2">
              <Star className="h-4 w-4" />
              <span>Use arrows to navigate</span>
            </div>
            <div>
              {currentIndex + 1} of {events.length}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
