"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useCreateTask } from "@/lib/hooks/use-tasks";
import { createTaskSchema } from "@/lib/schemas/create-task-schema";
import { AlertCircle } from "lucide-react";
import * as z from "zod";
import { TaskPriority } from "@/lib/api/generated-client";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Button } from "@/components/ui/button";

const CreateTaskForm = () => {
  const {
    register,
    handleSubmit,
    setValue,
    watch,
    reset,
    formState: { errors },
  } = useForm<CreateTaskFormData>({
    resolver: zodResolver(createTaskSchema),
    defaultValues: {
      priority: TaskPriority.Medium,
    },
  });

  type CreateTaskFormData = z.infer<typeof createTaskSchema>;

  const onSubmit = (data: CreateTaskFormData) => {
    createTaskMutation.mutate(
      {
        title: data.title,
        description: data.description || "",
        priority: data.priority,
        dueDate: new Date(data.dueDate),
      },
      {
        onSuccess: () => {
          reset();
        },
      },
    );
  };

  const createTaskMutation = useCreateTask();
  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
      {createTaskMutation.isError && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>
            Failed to create task. Please try again.
          </AlertDescription>
        </Alert>
      )}

      <div className="space-y-2">
        <Label htmlFor="title">Title</Label>
        <Input
          id="title"
          placeholder="Task title"
          {...register("title")}
          disabled={createTaskMutation.isPending}
        />
        {errors.title && (
          <p className="text-sm text-destructive">{errors.title.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="description">Description (Optional)</Label>
        <Input
          id="description"
          placeholder="Task description"
          {...register("description")}
          disabled={createTaskMutation.isPending}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="priority">Priority</Label>
        <Select
          value={watch("priority")?.toString()}
          onValueChange={(value) =>
            setValue("priority", parseInt(value) as TaskPriority)
          }
          disabled={createTaskMutation.isPending}
        >
          <SelectTrigger>
            <SelectValue placeholder="Select priority" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value={TaskPriority.Low.toString()}>Low</SelectItem>
            <SelectItem value={TaskPriority.Medium.toString()}>
              Medium
            </SelectItem>
            <SelectItem value={TaskPriority.High.toString()}>High</SelectItem>
          </SelectContent>
        </Select>
        {errors.priority && (
          <p className="text-sm text-destructive">{errors.priority.message}</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="dueDate">Due Date</Label>
        <Input
          id="dueDate"
          type="date"
          {...register("dueDate")}
          disabled={createTaskMutation.isPending}
        />
        {errors.dueDate && (
          <p className="text-sm text-destructive">{errors.dueDate.message}</p>
        )}
      </div>

      <div className="flex gap-2">
        <Button
          type="submit"
          disabled={createTaskMutation.isPending}
          className="flex-1"
        >
          {createTaskMutation.isPending ? "Creating..." : "Create Task"}
        </Button>
      </div>
    </form>
  );
};

export default CreateTaskForm;
