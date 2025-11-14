import { TaskDto } from "@/lib/api/generated-client";
import { cn } from "@/lib/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { motion } from "framer-motion";
import { useState } from "react";
import { Badge } from "../ui/badge";
import { getPriorityVariant } from "@/lib/utils/priority";
import { Checkbox } from "../ui/checkbox";
import CompleteTaskToggle from "./complete-task-toggle";
import { FaRepeat } from "react-icons/fa6";

interface TaskListItemProps extends React.HTMLAttributes<HTMLElement> {
  task: TaskDto;
}
const TaskListItem = ({
  task,
  className = "",
  ...props
}: TaskListItemProps) => {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <Card
      className={cn(
        "ring-0 rounded-none border-none cursor-pointer",
        className,
      )}
      onClick={() => setIsExpanded(!isExpanded)}
      {...props}
    >
      <CardHeader>
        <CardTitle className="flex">
          <div className="flex items-center gap-2 me-auto">
            <span>{task.title}</span>
            <Badge
              variant={getPriorityVariant(task.priority!)}
              className="h-4 w-4 min-w-0 p-0"
            />
            {task.recurrenceRuleId && <FaRepeat />}
          </div>
          <CompleteTaskToggle task={task} />
        </CardTitle>
        <CardDescription>{task.description}</CardDescription>
      </CardHeader>
      <motion.div
        initial={false}
        animate={{
          height: isExpanded ? "auto" : 0,
          opacity: isExpanded ? 1 : 0,
        }}
        transition={{ duration: 0.2, ease: "easeInOut" }}
        style={{ overflow: "hidden" }}
      >
        <CardContent>{task.recurrenceRuleId && "reccuring"}</CardContent>
      </motion.div>
    </Card>
  );
};

export default TaskListItem;
