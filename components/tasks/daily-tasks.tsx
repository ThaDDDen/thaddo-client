"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { endOfDayUTC, startOfDayUTC } from "@/lib/utils/dates";
import { Button } from "../ui/button";
import DateHeader from "./date-header";
import SwipeableTasksContainer from "./swipeable-tasks-container";
import TasksContent from "./tasks-content";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";

const DailyTasks = () => {
  const { currentDate, displayDate, direction, handlers } = useDateNavigation();

  const startDate = startOfDayUTC(currentDate);
  const endDate = endOfDayUTC(currentDate);

  const { data: tasks, isLoading } = useTasks(startDate, endDate);

  if (isLoading && !tasks) return <span>Loading..</span>;

  return (
    <>
      <DateHeader date={displayDate} />

      <SwipeableTasksContainer
        currentDate={currentDate}
        direction={direction}
        handlers={handlers}
      >
        <TasksContent tasks={tasks} />
      </SwipeableTasksContainer>

      <Button className="w-full rounded-full sticky bottom-4">
        Add new task
      </Button>
    </>
  );
};

export default DailyTasks;
