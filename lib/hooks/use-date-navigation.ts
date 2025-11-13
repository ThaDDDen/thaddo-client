import { useEffect, useState } from "react";
import { addDays, subDays } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { taskKeys } from "@/lib/hooks/use-tasks";
import { startOfDayUTC, endOfDayUTC } from "@/lib/utils/dates";
import { useSwipeable } from "react-swipeable";

export const useDateNavigation = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date());
  const [direction, setDirection] = useState<1 | -1>(1);
  const queryClient = useQueryClient();

  // Prefetch adjacent dates for smooth swiping
  useEffect(() => {
    const tomorrow = addDays(currentDate, 1);
    const yesterday = subDays(currentDate, 1);

    // Prefetch tomorrow
    queryClient.prefetchQuery({
      queryKey: taskKeys.list({
        startDate: startOfDayUTC(tomorrow),
        endDate: endOfDayUTC(tomorrow),
      }),
      queryFn: () =>
        apiClient.getTasks(startOfDayUTC(tomorrow), endOfDayUTC(tomorrow)),
    });

    // Prefetch yesterday
    queryClient.prefetchQuery({
      queryKey: taskKeys.list({
        startDate: startOfDayUTC(yesterday),
        endDate: endOfDayUTC(yesterday),
      }),
      queryFn: () =>
        apiClient.getTasks(startOfDayUTC(yesterday), endOfDayUTC(yesterday)),
    });
  }, [currentDate, queryClient]);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      // Swipe left = go forward = tomorrow
      // Content should exit left (-), new content enters from right (+)
      setDirection(1);
      setTimeout(() => {
        const nextDate = addDays(currentDate, 1);
        setCurrentDate(nextDate);
        setDisplayDate(nextDate);
      }, 0);
    },
    onSwipedRight: () => {
      // Swipe right = go backward = yesterday
      // Content should exit right (+), new content enters from left (-)
      setDirection(-1);
      setTimeout(() => {
        const prevDate = subDays(currentDate, 1);
        setCurrentDate(prevDate);
        setDisplayDate(prevDate);
      }, 0);
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 50,
  });

  return {
    currentDate,
    displayDate,
    direction,
    handlers,
  };
};
