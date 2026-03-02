import { apiClient } from "../lib/api-client.js";

export const reportService = {
  getSummary(period = "this_month") {
    return apiClient.get("/api/reports/summary", { period });
  },

  getExpenseBreakdown(period = "this_month") {
    return apiClient.get("/api/reports/expense-breakdown", { period });
  },

  getMonthlyComparison(months = 5) {
    return apiClient.get("/api/reports/monthly-comparison", { months });
  },

  getLargeTransactions(period = "this_month", limit = 5) {
    return apiClient.get("/api/reports/large-transactions", { period, limit });
  },
};
