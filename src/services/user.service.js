import { apiClient } from "../lib/api-client.js";

export const userService = {
  getProfile() {
    return apiClient.get("/api/users/me");
  },

  updateProfile(data) {
    return apiClient.put("/api/users/me", data);
  },

  deleteAccount() {
    return apiClient.delete("/api/users/me");
  },
};
