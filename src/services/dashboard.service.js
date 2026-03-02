import { apiClient } from "../lib/api-client.js";

export const dashboardService = {
  getStats() {
    return apiClient.get("/api/dashboard/stats");
  },

  getRecentTransactions(limit = 5) {
    return apiClient.get("/api/dashboard/recent-transactions", { limit });
  },
};
