const getApiBaseUrl = () => {
  if (typeof window === "undefined") {
    return process.env.API_URL || "http://localhost:3333";
  }
  return process.env.NEXT_PUBLIC_API_URL || "http://localhost:3333";
};

export const API_BASE_URL = getApiBaseUrl();

export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/categories`,
  EXPENSES: `${API_BASE_URL}/expenses`,
  SUBSCRIPTIONS: `${API_BASE_URL}/subscriptions`,
  USERS: `${API_BASE_URL}/users`,
} as const;

const getStoredUser = () => {
  if (typeof window === "undefined") return null;
  try {
    const storedUser = localStorage.getItem("user");
    return storedUser ? JSON.parse(storedUser) : null;
  } catch {
    return null;
  }
};

export const createHeaders = (userId?: string) => {
  const user = userId || getStoredUser()?.id;
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (user) {
    headers["x-user-id"] = user;
  }

  return headers;
};

export const apiClient = {
  get: async (url: string, userId?: string) => {
    const response = await fetch(url, {
      headers: createHeaders(userId),
    });
    return response;
  },

  post: async (url: string, data: any, userId?: string) => {
    const response = await fetch(url, {
      method: "POST",
      headers: createHeaders(userId),
      body: JSON.stringify(data),
    });
    return response;
  },

  put: async (url: string, data: any, userId?: string) => {
    const response = await fetch(url, {
      method: "PUT",
      headers: createHeaders(userId),
      body: JSON.stringify(data),
    });
    return response;
  },

  delete: async (url: string, userId?: string) => {
    const response = await fetch(url, {
      method: "DELETE",
      headers: createHeaders(userId),
    });
    return response;
  },
};
