import { apiClient } from "../lib/api-client.js";

export const categoryService = {
  getCategories() {
    return apiClient.get("/api/categories");
  },

  createCategory(data) {
    return apiClient.post("/api/categories", data);
  },

  updateCategory(id, data) {
    return apiClient.put(`/api/categories/${id}`, data);
  },

  deleteCategory(id) {
    return apiClient.delete(`/api/categories/${id}`);
  },
};
