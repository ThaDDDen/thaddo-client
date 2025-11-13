import { TaskDto } from "@/lib/api/generated-client";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";

interface TaskListItemProps extends React.HTMLAttributes<HTMLElement> {
  task: TaskDto;
}
const TaskListItem = ({
  task,
  className = "",
  ...props
}: TaskListItemProps) => {
  return (
    <Card
      className={cn("ring-0 rounded-none border-none", className)}
      {...props}
    >
      <CardHeader>
        <CardTitle>{task.title}</CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <CardContent>{task.recurrenceRuleId && "reccuring"}</CardContent>
    </Card>
  );
};

export default TaskListItem;
