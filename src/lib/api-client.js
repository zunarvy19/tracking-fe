const API_BASE_URL = import.meta.env.VITE_API_URL || "http://localhost:3001";

async function request(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  const config = {
    credentials: "include",
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response
      .json()
      .catch(() => ({ error: response.statusText }));
    throw new Error(error.error || "Request failed");
  }

  // Handle empty responses (204 No Content)
  if (response.status === 204) return null;

  const contentType = response.headers.get("content-type");
  if (contentType && contentType.includes("text/csv")) {
    return response.text();
  }

  return response.json();
}

export const apiClient = {
  get(endpoint, params) {
    const query = params
      ? "?" +
        new URLSearchParams(
          Object.entries(params).filter(([, v]) => v != null && v !== ""),
        ).toString()
      : "";
    return request(`${endpoint}${query}`);
  },

  post(endpoint, data) {
    return request(endpoint, {
      method: "POST",
      body: JSON.stringify(data),
    });
  },

  put(endpoint, data) {
    return request(endpoint, {
      method: "PUT",
      body: JSON.stringify(data),
    });
  },

  delete(endpoint) {
    return request(endpoint, { method: "DELETE" });
  },
};
