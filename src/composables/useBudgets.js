import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { budgetService } from "../services/budget.service.js";

export function useBudgets() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["budgets"],
    queryFn: () => budgetService.getBudgets(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => budgetService.createBudget(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => budgetService.updateBudget(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => budgetService.deleteBudget(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
    },
  });

  return {
    budgets: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    createBudget: createMutation.mutate,
    createBudgetAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateBudget: updateMutation.mutate,
    updateBudgetAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteBudget: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}

export function useBudgetSummary() {
  return useQuery({
    queryKey: ["budgets", "summary"],
    queryFn: () => budgetService.getSummary(),
  });
}
