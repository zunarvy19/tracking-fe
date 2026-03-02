import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { transactionService } from "../services/transaction.service.js";

export function useTransactions(filters = {}) {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["transactions", filters],
    queryFn: () => transactionService.getTransactions(filters),
  });

  const createMutation = useMutation({
    mutationFn: (data) => transactionService.createTransaction(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) =>
      transactionService.updateTransaction(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => transactionService.deleteTransaction(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["transactions"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard"] });
      queryClient.invalidateQueries({ queryKey: ["budgets"] });
      queryClient.invalidateQueries({ queryKey: ["reports"] });
    },
  });

  return {
    // Query
    transactions: query.data,
    isLoading: query.isLoading,
    error: query.error,
    refetch: query.refetch,

    // Mutations
    createTransaction: createMutation.mutate,
    createTransactionAsync: createMutation.mutateAsync,
    isCreating: createMutation.isPending,

    updateTransaction: updateMutation.mutate,
    updateTransactionAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteTransaction: deleteMutation.mutate,
    deleteTransactionAsync: deleteMutation.mutateAsync,
    isDeleting: deleteMutation.isPending,
  };
}

export function useTransaction(id) {
  return useQuery({
    queryKey: ["transactions", id],
    queryFn: () => transactionService.getTransaction(id),
    enabled: !!id,
  });
}

export function useExportTransactionsCsv() {
  return useMutation({
    mutationFn: (filters) => transactionService.exportCsv(filters),
  });
}
