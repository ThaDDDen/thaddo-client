import { TaskPriority } from "../api/generated-client";

export const getPriorityVariant = (
  priority: TaskPriority,
): "default" | "secondary" | "destructive" => {
  switch (priority) {
    case TaskPriority.Low:
      return "secondary";
    case TaskPriority.Medium:
      return "default";
    case TaskPriority.High:
      return "destructive";
    default:
      return "default";
  }
};

export const getPriorityLabel = (priority: TaskPriority) => {
  switch (priority) {
    case TaskPriority.Low:
      return "Low";
    case TaskPriority.Medium:
      return "Medium";
    case TaskPriority.High:
      return "High";
    default:
      return "Unknown";
  }
};
