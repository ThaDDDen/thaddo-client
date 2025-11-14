"use client";

import { useTasks } from "@/lib/hooks/use-tasks";
import { endOfDayUTC, startOfDayUTC } from "@/lib/utils/dates";
import { Button } from "../ui/button";
import DateHeader from "./date-header";
import SwipeableTasksContainer from "./swipeable-tasks-container";
import TasksContent from "./tasks-content";
import { useDateNavigation } from "@/lib/hooks/use-date-navigation";
import AppDialog from "../shared/app-dialog";
import CreateTaskForm from "./forms/create-task-form";
import { useState } from "react";

const DailyTasks = () => {
  const { currentDate, displayDate, direction, handlers } = useDateNavigation();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

      <AppDialog
        isDialogOpen={isDialogOpen}
        setIsDialogOpen={setIsDialogOpen}
        dialogTrigger={
          <div className="bg-background w-full sticky  p-4">
            <Button className="rounded-full w-full">Add new task</Button>
          </div>
        }
        dialogTitle="Create Task"
        dialogDescription="Fill out the form to create a new task"
        dialogContent={<CreateTaskForm />}
        dialogFooter={
          <Button onClick={() => setIsDialogOpen(false)} variant="destructive">
            Cancel
          </Button>
        }
      />
    </>
  );
};

export default DailyTasks;
