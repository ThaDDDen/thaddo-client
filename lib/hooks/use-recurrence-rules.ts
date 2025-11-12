import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { apiClient } from "@/lib/api/client";
import { CreateRecurrenceRuleRequest } from "@/lib/api/generated-client";

const recurrenceRuleKeys = {
  all: ["recurrenceRules"] as const,
  lists: () => [...recurrenceRuleKeys.all, "list"] as const,
  list: (filters: Record<string, any>) =>
    [...recurrenceRuleKeys.lists(), filters] as const,
  details: () => [...recurrenceRuleKeys.all, "detail"] as const,
  detail: (id: number) => [...recurrenceRuleKeys.details(), id] as const,
};

export function useRecurrenceRules() {
  return useQuery({
    queryKey: recurrenceRuleKeys.lists(),
    queryFn: () => apiClient.getRecurrenceRules(),
  });
}

export function useRecurrenceRule(id: number) {
  return useQuery({
    queryKey: recurrenceRuleKeys.detail(id),
    queryFn: () => apiClient.getRecurrenceRule(id),
    enabled: !!id,
  });
}

export function useCreateRecurrenceRule() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (request: CreateRecurrenceRuleRequest) =>
      apiClient.createRecurrenceRule(request),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: recurrenceRuleKeys.lists() });
    },
  });
}
