"use client";

import { apiClient } from "@/lib/api/client";
import { taskKeys, useTasks } from "@/lib/hooks/use-tasks";
import {
  endOfDayUTC,
  formatDateString,
  getDateTitle,
  startOfDayUTC,
} from "@/lib/utils/dates";
import { useQueryClient } from "@tanstack/react-query";
import { addDays, subDays } from "date-fns";
import { useEffect, useState } from "react";
import { useSwipeable } from "react-swipeable";
import { Button } from "../ui/button";

import { motion, AnimatePresence } from "framer-motion";
import TaskList from "./task-list";
import { Card } from "../ui/card";

const DailyTasks = () => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [displayDate, setDisplayDate] = useState(new Date()); // Separate state for display
  const [direction, setDirection] = useState<1 | -1>(1);
  const queryClient = useQueryClient();

  const startDate = startOfDayUTC(currentDate);
  const endDate = endOfDayUTC(currentDate);

  const { data: tasks, isLoading } = useTasks(startDate, endDate);

  const unfinishedTasks = tasks?.filter((t) => !t.completed);
  const finishedTasks = tasks?.filter((t) => t.completed);

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
    <>
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
                    {unfinishedTasks && unfinishedTasks.length > 0 && (
                      <TaskList taskList={unfinishedTasks} />
                    )}
                    {finishedTasks && finishedTasks.length > 0 && (
                      <>
                        <div className="py-4 flex justify-center">
                          <span>Completed</span>
                        </div>
                        <TaskList taskList={finishedTasks} />
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
    </>
  );
};

export default DailyTasks;
