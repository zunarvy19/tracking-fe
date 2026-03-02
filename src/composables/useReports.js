import { useQuery } from "@tanstack/vue-query";
import { reportService } from "../services/report.service.js";

export function useReportSummary(period = "this_month") {
  return useQuery({
    queryKey: ["reports", "summary", period],
    queryFn: () => reportService.getSummary(period),
  });
}

export function useExpenseBreakdown(period = "this_month") {
  return useQuery({
    queryKey: ["reports", "expense-breakdown", period],
    queryFn: () => reportService.getExpenseBreakdown(period),
  });
}

export function useMonthlyComparison(months = 5) {
  return useQuery({
    queryKey: ["reports", "monthly-comparison", months],
    queryFn: () => reportService.getMonthlyComparison(months),
  });
}

export function useLargeTransactions(period = "this_month", limit = 5) {
  return useQuery({
    queryKey: ["reports", "large-transactions", period, limit],
    queryFn: () => reportService.getLargeTransactions(period, limit),
  });
}
