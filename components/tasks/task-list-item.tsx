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
        <CardTitle>{task.title}</CardTitle>
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
