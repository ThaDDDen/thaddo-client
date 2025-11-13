import { TaskDto } from "@/lib/api/generated-client";
import { Card } from "../ui/card";
import TaskList from "./task-list";

interface TasksContentProps {
  tasks: TaskDto[] | undefined;
}

const TasksContent = ({ tasks }: TasksContentProps) => {
  const unfinishedTasks = tasks?.filter((t) => !t.completed);
  const finishedTasks = tasks?.filter((t) => t.completed);

  if (!tasks || tasks.length === 0) {
    return (
      <Card className="p-8 text-center text-muted-foreground">
        No tasks for this day
      </Card>
    );
  }

  return (
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
  );
};

export default TasksContent;
