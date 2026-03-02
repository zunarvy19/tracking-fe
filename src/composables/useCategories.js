import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { categoryService } from "../services/category.service.js";

export function useCategories() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["categories"],
    queryFn: () => categoryService.getCategories(),
  });

  const createMutation = useMutation({
    mutationFn: (data) => categoryService.createCategory(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const updateMutation = useMutation({
    mutationFn: ({ id, data }) => categoryService.updateCategory(id, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id) => categoryService.deleteCategory(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["categories"] });
    },
  });

  return {
    categories: query.data,
    isLoading: query.isLoading,
    error: query.error,

    createCategory: createMutation.mutate,
    isCreating: createMutation.isPending,

    updateCategory: updateMutation.mutate,
    isUpdating: updateMutation.isPending,

    deleteCategory: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
