import { apiClient } from "../lib/api-client.js";

export const budgetService = {
  getBudgets() {
    return apiClient.get("/api/budgets");
  },

  getSummary() {
    return apiClient.get("/api/budgets/summary");
  },

  createBudget(data) {
    return apiClient.post("/api/budgets", data);
  },

  updateBudget(id, data) {
    return apiClient.put(`/api/budgets/${id}`, data);
  },

  deleteBudget(id) {
    return apiClient.delete(`/api/budgets/${id}`);
  },
};
