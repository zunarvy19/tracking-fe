import { useQuery } from "@tanstack/vue-query";
import { dashboardService } from "../services/dashboard.service.js";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard", "stats"],
    queryFn: () => dashboardService.getStats(),
  });
}

export function useRecentTransactions(limit = 5) {
  return useQuery({
    queryKey: ["dashboard", "recent-transactions", limit],
    queryFn: () => dashboardService.getRecentTransactions(limit),
  });
}
