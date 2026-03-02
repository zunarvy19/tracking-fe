import { apiClient } from "../lib/api-client.js";

export const transactionService = {
  getTransactions(filters = {}) {
    return apiClient.get("/api/transactions", filters);
  },

  getTransaction(id) {
    return apiClient.get(`/api/transactions/${id}`);
  },

  createTransaction(data) {
    return apiClient.post("/api/transactions", data);
  },

  updateTransaction(id, data) {
    return apiClient.put(`/api/transactions/${id}`, data);
  },

  deleteTransaction(id) {
    return apiClient.delete(`/api/transactions/${id}`);
  },

  exportCsv(filters = {}) {
    return apiClient.get("/api/transactions/export/csv", filters);
  },
};
