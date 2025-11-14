import * as z from "zod";
import { TaskPriority } from "../api/generated-client";

export const createTaskSchema = z.object({
  title: z.string().min(1, "Title is required"),
  description: z.string().optional(),
  priority: z.nativeEnum(TaskPriority),
  dueDate: z.date({ message: "Due date is required" }),
});
