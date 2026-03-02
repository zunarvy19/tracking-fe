import { useQuery, useMutation, useQueryClient } from "@tanstack/vue-query";
import { userService } from "../services/user.service.js";

export function useUser() {
  const queryClient = useQueryClient();

  const query = useQuery({
    queryKey: ["user", "profile"],
    queryFn: () => userService.getProfile(),
  });

  const updateMutation = useMutation({
    mutationFn: (data) => userService.updateProfile(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["user", "profile"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: () => userService.deleteAccount(),
    onSuccess: () => {
      queryClient.clear();
      window.location.href = "/";
    },
  });

  return {
    profile: query.data,
    isLoading: query.isLoading,
    error: query.error,

    updateProfile: updateMutation.mutate,
    updateProfileAsync: updateMutation.mutateAsync,
    isUpdating: updateMutation.isPending,

    deleteAccount: deleteMutation.mutate,
    isDeleting: deleteMutation.isPending,
  };
}
