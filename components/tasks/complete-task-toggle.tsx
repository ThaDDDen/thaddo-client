"use client";

import { TaskDto } from "@/lib/api/generated-client";
import { useToggleCompleted } from "@/lib/hooks/use-tasks";
import { Checkbox } from "../ui/checkbox";

interface CompleteTaskToggleProps {
  task: TaskDto;
}

const CompleteTaskToggle = ({ task }: CompleteTaskToggleProps) => {
  const { mutate: toggleCompleted, isPending } = useToggleCompleted();

  const handleToggle = (completed: boolean) => {
    toggleCompleted({
      id: task.id!,
      request: {
        id: task.id,
        completed: completed,
      },
    });
  };
  return (
    <Checkbox
      className="w-6 h-6"
      checked={task.completed}
      onCheckedChange={handleToggle}
      disabled={isPending}
    />
  );
};

export default CompleteTaskToggle;
