import { TaskDto } from "@/lib/api/generated-client";
import { Card } from "../ui/card";
import TaskListItem from "./task-list-item";
import { Separator } from "../ui/separator";

interface TaskListProps {
  taskList: TaskDto[];
}

const TaskList = ({ taskList }: TaskListProps) => {
  return (
    <Card className="gap-0 p-0 overflow-hidden">
      {taskList &&
        taskList.length > 0 &&
        taskList.map((task, index) => (
          <div key={task.id}>
            <TaskListItem task={task} />
            {index != taskList.length && <Separator />}
          </div>
        ))}
    </Card>
  );
};

export default TaskList;
