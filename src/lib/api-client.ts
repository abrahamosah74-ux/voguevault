/**
 * API Client Configuration and Helpers
 * Centralized place to manage all backend API calls
 */

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3001';
const API_BASE_PATH = '/api/v1';

// Check if we should use demo mode
// Demo mode is enabled if:
// 1. NEXT_PUBLIC_ENABLE_DEMO is explicitly set to 'true'
// 2. Or we're in browser (client-side) - enables offline-first demo experience
const shouldUseDemoMode = () => {
  if (typeof window === 'undefined') return false; // Don't use demo on server
  const envDemoMode = process.env.NEXT_PUBLIC_ENABLE_DEMO === 'true';
  const clientDemoMode = process.env.NODE_ENV !== 'production' || envDemoMode;
  return clientDemoMode;
};

function getFullUrl(endpoint: string): string {
  return `${API_URL}${API_BASE_PATH}${endpoint}`;
}

interface ApiOptions extends RequestInit {
  skipAuth?: boolean;
}

interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  statusCode?: number;
}

/**
 * Make an API request to the backend
 */
export async function apiCall<T = any>(
  endpoint: string,
  options: ApiOptions = {}
): Promise<ApiResponse<T>> {
  const { skipAuth = false, ...fetchOptions } = options;

  try {
    const url = getFullUrl(endpoint);
    
    // Default headers
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
      ...fetchOptions.headers,
    };

    // Add auth token if available (assuming JWT in localStorage)
    if (!skipAuth) {
      const token = typeof window !== 'undefined' ? localStorage.getItem('authToken') : null;
      if (token) {
        headers.Authorization = `Bearer ${token}`;
      }
    }

    const response = await fetch(url, {
      ...fetchOptions,
      headers,
    });

    if (!response.ok) {
      return {
        success: false,
        error: `API error: ${response.status} ${response.statusText}`,
        statusCode: response.statusCode,
      };
    }

    const data = await response.json();
    return {
      success: true,
      data,
      statusCode: response.status,
    };
  } catch (error: any) {
    console.error('API call failed:', error);
    return {
      success: false,
      error: error.message || 'Unknown error',
    };
  }
}

/**
 * Health check — verify backend is running
 */
export async function checkHealth() {
  return apiCall('/health', { skipAuth: true });
}

/**
 * Authentication API calls
 */
export const authApi = {
  login: async (email: string, password: string) => {
    // Use demo/testing mode if enabled or on production (as fallback)
    if (shouldUseDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email && password) {
            resolve({
              success: true,
              data: {
                token: `demo_token_${Date.now()}`,
                user: {
                  id: '1',
                  email,
                  name: email.split('@')[0],
                },
              },
            });
          } else {
            resolve({
              success: false,
              error: 'Email and password required',
            });
          }
        }, 500);
      });
    }

    // Real API call when not in demo mode
    return apiCall('/auth/login', {
      method: 'POST',
      body: JSON.stringify({ email, password }),
      skipAuth: true,
    });
  },

  register: async (email: string, password: string, name: string) => {
    // Use demo/testing mode if enabled or on production (as fallback)
    if (shouldUseDemoMode()) {
      return new Promise((resolve) => {
        setTimeout(() => {
          if (email && password && name) {
            resolve({
              success: true,
              data: {
                token: `demo_token_${Date.now()}`,
                user: {
                  id: '1',
                  email,
                  name,
                },
              },
            });
          } else {
            resolve({
              success: false,
              error: 'Email, password, and name required',
            });
          }
        }, 500);
      });
    }

    // Real API call when not in demo mode
    return apiCall('/auth/register', {
      method: 'POST',
      body: JSON.stringify({ email, password, name }),
      skipAuth: true,
    });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('authToken');
    }
    return Promise.resolve({ success: true });
  },
};

/**
 * Product API calls
 */
export const productsApi = {
  list: (filters?: Record<string, any>) => {
    const query = new URLSearchParams(filters).toString();
    return apiCall(`/api/products?${query}`);
  },
  
  get: (id: string) =>
    apiCall(`/api/products/${id}`),
  
  search: (query: string) =>
    apiCall(`/api/products/search?q=${encodeURIComponent(query)}`),
};

/**
 * Aurora AI API calls
 */
export const auroraApi = {
  generateOutfit: (context: any) =>
    apiCall('/api/aurora/outfit', {
      method: 'POST',
      body: JSON.stringify(context),
    }),
  
  analyzeWardrobe: (wardrobeItems: any[]) =>
    apiCall('/api/aurora/analyze', {
      method: 'POST',
      body: JSON.stringify({ items: wardrobeItems }),
    }),
  
  getRecommendations: (userId: string) =>
    apiCall(`/api/aurora/users/${userId}/recommendations`),
};

/**
 * Order API calls
 */
export const ordersApi = {
  list: () =>
    apiCall('/api/orders'),
  
  get: (id: string) =>
    apiCall(`/api/orders/${id}`),
  
  create: (items: any[]) =>
    apiCall('/api/orders', {
      method: 'POST',
      body: JSON.stringify({ items }),
    }),
};

export default {
  apiCall,
  checkHealth,
  authApi,
  productsApi,
  auroraApi,
  ordersApi,
};
