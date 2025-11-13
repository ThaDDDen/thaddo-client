"use client";

import { useState, useEffect } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, subDays, format } from "date-fns";
import { useQueryClient } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTasks, taskKeys } from "@/lib/hooks/use-tasks";
import { apiClient } from "@/lib/api/client";
import { startOfDayUTC, endOfDayUTC } from "@/lib/utils/dates";

function formatDateString(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateTitle(date: Date): string {
  const today = startOfDayUTC(new Date());
  const targetDate = startOfDayUTC(date);

  const daysDiff = Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (daysDiff === 0) return "Todays Tasks";
  if (daysDiff === 1) return "Tomorrows Tasks";
  if (daysDiff === -1) return "Yesterdays Tasks";

  return `Tasks for ${format(date, "EEEE")}`;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date()); // Separate state for display
  const [direction, setDirection] = useState<1 | -1>(1);
  const queryClient = useQueryClient();

  const startDate = startOfDayUTC(currentDate);
  const endDate = endOfDayUTC(currentDate);

  const { data: tasks, isLoading, isPlaceholderData } = useTasks(startDate, endDate);

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

  // Only show loading on initial mount, not during navigation
  if (isLoading && !tasks) return <span>Loading..</span>;

  return (
    <main className="h-full w-full flex flex-col relative">
      <div className="flex flex-col pt-8 pb-16 items-center gap-4 sticky top-0">
        <h3 className="mx-auto text-white font-semibold w-fit">
          {formatDateString(displayDate)}
        </h3>
        <h1 className="text-white text-4xl font-bold">
          {getDateTitle(displayDate)}
        </h1>
      </div>
      <div
        {...handlers}
        className="bg-background flex-1 px-4 flex flex-col relative"
      >
        <div className="-mt-10 relative flex-1">
          <div className="absolute inset-0 overflow-y-scroll">
            <AnimatePresence initial={false} custom={direction} mode="wait">
              <motion.div
                key={currentDate.toISOString()}
                custom={direction}
                variants={{
                  enter: (dir: number) => ({
                    x: dir * 300,
                    opacity: 0,
                  }),
                  center: {
                    x: 0,
                    opacity: 1,
                  },
                  exit: (dir: number) => ({
                    x: dir * -300,
                    opacity: 0,
                  }),
                }}
                initial="enter"
                animate="center"
                exit="exit"
                transition={{ duration: 0.3, ease: "easeInOut" }}
              >
                {tasks && tasks.length > 0 ? (
                  <>
                    <Card className="gap-0 p-0 overflow-hidden">
                      {tasks
                        .filter((t) => !t.completed)
                        .map((task) => (
                          <div key={task.id}>
                            <Card className="ring-0 rounded-none border-none">
                              <CardHeader>
                                <CardTitle>{task.title}</CardTitle>
                                <CardDescription>
                                  {task.description}
                                </CardDescription>
                              </CardHeader>
                              <CardContent>
                                {task.recurrenceRuleId && "reccuring"}
                              </CardContent>
                            </Card>
                            <Separator />
                          </div>
                        ))}
                    </Card>
                    {tasks.filter((t) => t.completed).length > 0 && (
                      <>
                        <div className="py-4">Completed</div>
                        <Card className="gap-0 p-0 overflow-hidden">
                          {tasks
                            .filter((t) => t.completed)
                            .map((task) => (
                              <div key={task.id}>
                                <div className="p-4 w-full line-through">
                                  {task.title}
                                </div>
                                <Separator />
                              </div>
                            ))}
                        </Card>
                      </>
                    )}
                  </>
                ) : (
                  <Card className="p-8 text-center text-muted-foreground">
                    No tasks for this day
                  </Card>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
        <Button className="w-full rounded-full sticky bottom-4">
          Add new task
        </Button>
      </div>
    </main>
  );
}
