import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import type {
  TaskDto,
  CreateTaskRequest,
  UpdateTaskRequest,
} from "@/lib/api/generated-client";

// Query keys
export const taskKeys = {
  all: ["tasks"] as const,
  lists: () => [...taskKeys.all, "list"] as const,
  list: (filters?: { startDate?: Date; endDate?: Date }) =>
    [...taskKeys.lists(), filters] as const,
  details: () => [...taskKeys.all, "detail"] as const,
  detail: (id: number) => [...taskKeys.details(), id] as const,
};

// Get all tasks
export function useTasks(startDate?: Date, endDate?: Date) {
  return useQuery({
    queryKey: taskKeys.list({ startDate, endDate }),
    queryFn: () => apiClient.getTasks(startDate, endDate),
  });
}

export function useTodaysTasks() {
  const now = new Date();
  const startDate = new Date(
    Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()),
  );

  const endDate = new Date(startDate);
  endDate.setUTCDate(endDate.getUTCDate() + 1);

  return useQuery({
    queryKey: taskKeys.list({ startDate, endDate }),
    queryFn: () => apiClient.getTasks(startDate, endDate),
  });
}

// Get single task
export function useTask(id: number) {
  return useQuery({
    queryKey: taskKeys.detail(id),
    queryFn: () => apiClient.getTask(id),
    enabled: !!id,
  });
}

// Create task
export function useCreateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateTaskRequest) => apiClient.createTask(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}

// Update task
export function useUpdateTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, request }: { id: number; request: UpdateTaskRequest }) =>
      apiClient.updateTask(id, request),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
      queryClient.invalidateQueries({
        queryKey: taskKeys.detail(variables.id),
      });
    },
  });
}

// Delete task
export function useDeleteTask() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: number) => apiClient.deleteTask(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: taskKeys.lists() });
    },
  });
}
