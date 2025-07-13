export const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3333';

export const API_ENDPOINTS = {
  CATEGORIES: `${API_BASE_URL}/categories`,
  EXPENSES: `${API_BASE_URL}/expenses`,
  SUBSCRIPTIONS: `${API_BASE_URL}/subscriptions`,
} as const;

