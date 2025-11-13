"use client";

import { useState } from "react";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "framer-motion";
import { addDays, subDays, startOfDay, endOfDay, format } from "date-fns";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import { useTasks } from "@/lib/hooks/use-tasks";

function formatDateString(date: Date): string {
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

function getDateTitle(date: Date): string {
  const today = startOfDay(new Date());
  const targetDate = startOfDay(date);

  const daysDiff = Math.floor(
    (targetDate.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
  );

  if (daysDiff === 0) return "Todays Tasks";
  if (daysDiff === 1) return "Tomorrows Tasks";
  if (daysDiff === -1) return "Yesterdays Tasks";

  return `Tasks for ${format(date, "EEEE")}`;
}

export default function Home() {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [swipeDirection, setSwipeDirection] = useState<"left" | "right" | null>(
    null
  );

  const startDate = startOfDay(currentDate);
  const endDate = endOfDay(currentDate);

  const { data: tasks, isLoading } = useTasks(startDate, endDate);

  const handlers = useSwipeable({
    onSwipedLeft: () => {
      setSwipeDirection("left");
      setCurrentDate((d) => addDays(d, 1));
    },
    onSwipedRight: () => {
      setSwipeDirection("right");
      setCurrentDate((d) => subDays(d, 1));
    },
    preventScrollOnSwipe: false,
    trackMouse: false,
    delta: 50,
  });

  if (isLoading) return <span>Loading..</span>;

  return (
    <main className="h-full w-full flex flex-col relative">
      <div className="flex flex-col pt-8 pb-16 items-center gap-4 sticky top-0">
        <h3 className="mx-auto text-white font-semibold w-fit">
          {formatDateString(currentDate)}
        </h3>
        <h1 className="text-white text-4xl font-bold">{getDateTitle(currentDate)}</h1>
      </div>
      <div
        {...handlers}
        className="bg-background flex-1 px-4 flex flex-col relative"
      >
        <div className="-mt-10 relative flex-1">
          <div className="absolute inset-0 overflow-y-scroll">
            <AnimatePresence mode="wait" initial={false}>
              <motion.div
                key={currentDate.toISOString()}
                initial={{
                  x: swipeDirection === "left" ? 300 : swipeDirection === "right" ? -300 : 0,
                  opacity: 0,
                }}
                animate={{ x: 0, opacity: 1 }}
                exit={{
                  x: swipeDirection === "left" ? -300 : swipeDirection === "right" ? 300 : 0,
                  opacity: 0,
                }}
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
