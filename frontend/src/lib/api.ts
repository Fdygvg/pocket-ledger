import type { ApiResponse, ApiErrorResponse } from '@/types';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Types for API error handling
export interface ApiError extends Error {
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
  data?: unknown;
}

// Custom error class for API errors
export class PocketLedgerApiError extends Error implements ApiError {
  status?: number;
  errors?: Array<{
    field: string;
    message: string;
    value?: unknown;
  }>;
  data?: unknown;

  constructor(
    message: string,
    status?: number,
    errors?: Array<{
      field: string;
      message: string;
      value?: unknown;
    }>,
    data?: unknown
  ) {
    super(message);
    this.name = 'PocketLedgerApiError';
    this.status = status;
    this.errors = errors;
    this.data = data;
  }
}

// Request cache for deduplication
const requestCache = new Map<string, Promise<any>>(); // eslint-disable-line @typescript-eslint/no-explicit-any

/**
 * Main API client class
 */
class ApiClient {
  private getHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    // Add any future auth headers here
    return headers;
  }

  /**
   * Make a request to the API
   */
  async request<T = unknown>(
    endpoint: string,
    options: RequestInit = {},
    useCache: boolean = false
  ): Promise<ApiResponse<T>> {
    const url = `${API_URL}${endpoint}`;
    const cacheKey = `${options.method || 'GET'}:${url}`;

    // Check cache for GET requests
    if (useCache && options.method === 'GET' && requestCache.has(cacheKey)) {
      return requestCache.get(cacheKey)!;
    }

    const config: RequestInit = {
      ...options,
      headers: {
        ...this.getHeaders(),
        ...options.headers,
      },
      credentials: 'include', // Important for cookie auth
    };

    const requestPromise = (async () => {
      try {
        const response = await fetch(url, config);
        const data: ApiResponse<T> = await response.json();

        // Handle HTTP errors
        if (!response.ok) {
          const errorData = data as Partial<ApiErrorResponse>;
          throw new PocketLedgerApiError(
            errorData.error || `HTTP ${response.status}: ${response.statusText}`,
            response.status,
            errorData.errors,
            data
          );
        }

        // Clear cache on success for non-GET requests
        if (options.method && options.method !== 'GET') {
          this.clearCache();
        }

        return data;
      } catch (error) {
        // Handle network errors
        if (error instanceof TypeError && error.message === 'Failed to fetch') {
          throw new PocketLedgerApiError(
            'Network error: Unable to connect to the server. Please check your connection.',
            0
          );
        }

        // Re-throw PocketLedgerApiError
        if (error instanceof PocketLedgerApiError) {
          throw error;
        }

        // Handle other errors
        throw new PocketLedgerApiError(
          error instanceof Error ? error.message : 'An unknown error occurred'
        );
      }
    })();

    // Cache GET requests
    if (useCache && options.method === 'GET') {
      requestCache.set(cacheKey, requestPromise);
      // Remove from cache after 5 minutes
      setTimeout(() => requestCache.delete(cacheKey), 5 * 60 * 1000);
    }

    return requestPromise;
  }

  /**
   * Clear request cache
   */
  clearCache(): void {
    requestCache.clear();
  }

  /**
   * Invalidate specific cache entries
   */
  invalidateCache(endpoint: string, method: string = 'GET'): void {
    const cacheKey = `${method}:${API_URL}${endpoint}`;
    requestCache.delete(cacheKey);
  }

  // CRUD methods
  async get<T = unknown>(endpoint: string, useCache: boolean = true): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, { method: 'GET' }, useCache);
  }

  async post<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async put<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async patch<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'PATCH',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  async delete<T = unknown>(endpoint: string, data?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(endpoint, {
      method: 'DELETE',
      body: data ? JSON.stringify(data) : undefined,
    });
  }

  /**
   * Upload file (multipart/form-data)
   */
  async upload<T = unknown>(endpoint: string, file: File, fieldName: string = 'file'): Promise<ApiResponse<T>> {
    const formData = new FormData();
    formData.append(fieldName, file);

    return this.request<T>(endpoint, {
      method: 'POST',
      headers: {}, // Let browser set Content-Type for FormData
      body: formData,
    });
  }

  /**
   * Health check
   */
  async healthCheck(): Promise<boolean> {
    try {
      const response = await fetch(`${API_URL.replace('/api', '')}/health`);
      return response.ok;
    } catch {
      return false;
    }
  }

  /**
   * Validate session
   */
  async validateSession(): Promise<boolean> {
    try {
      const response = await this.get('/auth/me');
      return response.success;
    } catch {
      return false;
    }
  }
}

// Export singleton instance
export const api = new ApiClient();

// Export utility functions
export const apiUtils = {
  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'NGN'): string {
    if (currency === 'NGN') {
      const formatted = Math.abs(amount).toLocaleString('en-NG', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2,
      });
      return amount < 0 ? `-₦${formatted}` : `₦${formatted}`;
    }
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency,
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(amount);
  },

  /**
   * Format date
   */
  formatDate(date: string | Date, options: Intl.DateTimeFormatOptions = {}): string {
    const defaultOptions: Intl.DateTimeFormatOptions = {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      ...options,
    };

    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', defaultOptions);
  },

  /**
   * Format date with time
   */
  formatDateTime(date: string | Date): string {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  },

  /**
   * Calculate days between dates
   */
  daysBetween(startDate: Date, endDate: Date = new Date()): number {
    const timeDiff = Math.abs(endDate.getTime() - startDate.getTime());
    return Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
  },

  /**
   * Debounce function
   */
  debounce<T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: ReturnType<typeof setTimeout>;

    return (...args: Parameters<T>) => {
      clearTimeout(timeout);
      timeout = setTimeout(() => func(...args), wait);
    };
  },

  /**
   * Throttle function
   */
  throttle<T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean;

    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args);
        inThrottle = true;
        setTimeout(() => (inThrottle = false), limit);
      }
    };
  },

  /**
   * Generate random ID
   */
  generateId(length: number = 8): string {
    return Math.random().toString(36).substring(2, 2 + length);
  },

  /**
   * Safe parse JSON
   */
  safeParse<T = unknown>(jsonString: string, defaultValue: T): T {
    try {
      return JSON.parse(jsonString) as T;
    } catch {
      return defaultValue;
    }
  },

  /**
   * Deep clone object
   */
  deepClone<T>(obj: T): T {
    return JSON.parse(JSON.stringify(obj));
  },

  /**
   * Wait for specified milliseconds
   */
  sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  },
};