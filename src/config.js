// Vite Configuration
export const VITE_BASE_URL = import.meta.env.VITE_BASE_URL || '/';

// API Configuration
export const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'https://stockapi.targetboard.co/api/v1';

// API Endpoints
export const API_ENDPOINTS = {
  LOGIN: `${API_BASE_URL}/login`,
  SIGNUP: `${API_BASE_URL}/signup`,
  TRANSACTIONS: `${API_BASE_URL}/transaction`,
  STOCKS: `${API_BASE_URL}/stocks`,
  CATEGORIES: `${API_BASE_URL}/categories`,
  CATEGORY: `${API_BASE_URL}/category`,
  SUBCATEGORY: `${API_BASE_URL}/subcategory`,
  SUB_CATEGORIES_UPDATE: `${API_BASE_URL}/sub-categories/update`,
  SUB_CATEGORIES_DELETE: `${API_BASE_URL}/sub-categories/delete`,
  STOCKS_UPDATE: `${API_BASE_URL}/stocks-update`,
  STOCKS_DELETE: `${API_BASE_URL}/stocks-delete`,
  CATEGORIES_UPDATE: `${API_BASE_URL}/categories/update`,
  CATEGORIES_DELETE: `${API_BASE_URL}/categories/delete`,
}; 