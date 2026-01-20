import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * Merge Tailwind classes with clsx and tailwind-merge
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * Format currency amount
 */
export function formatCurrency(
  amount: number,
  currency: string = 'NGN',
  decimals: number = 2
): string {
  // Use a custom formatter for Naira to ensure the ₦ symbol is used
  if (currency === 'NGN') {
    const formatted = Math.abs(amount).toLocaleString('en-NG', {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals,
    });
    return amount < 0 ? `-₦${formatted}` : `₦${formatted}`;
  }

  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });

  // Handle negative amounts
  const absoluteAmount = Math.abs(amount);
  const formatted = formatter.format(absoluteAmount);

  return amount < 0 ? `-${formatted}` : formatted;
}

/**
 * Format percentage
 */
export function formatPercentage(
  value: number,
  decimals: number = 1
): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format date in readable format
 */
export function formatDate(
  date: string | Date,
  options: Intl.DateTimeFormatOptions = {}
): string {
  const defaultOptions: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    ...options,
  };

  const dateObj = typeof date === 'string' ? new Date(date) : date;

  // Check if date is valid
  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString('en-US', defaultOptions);
}

/**
 * Format date with time
 */
export function formatDateTime(
  date: string | Date,
  includeSeconds: boolean = false
): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  return dateObj.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    second: includeSeconds ? '2-digit' : undefined,
  });
}

/**
 * Get relative time (e.g., "2 hours ago")
 */
export function getRelativeTime(date: string | Date): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date;

  if (isNaN(dateObj.getTime())) {
    return 'Invalid date';
  }

  const now = new Date();
  const diffMs = now.getTime() - dateObj.getTime();
  const diffSec = Math.floor(diffMs / 1000);
  const diffMin = Math.floor(diffSec / 60);
  const diffHour = Math.floor(diffMin / 60);
  const diffDay = Math.floor(diffHour / 24);
  const diffWeek = Math.floor(diffDay / 7);
  const diffMonth = Math.floor(diffDay / 30);
  const diffYear = Math.floor(diffDay / 365);

  if (diffSec < 60) return 'just now';
  if (diffMin < 60) return `${diffMin} minute${diffMin === 1 ? '' : 's'} ago`;
  if (diffHour < 24) return `${diffHour} hour${diffHour === 1 ? '' : 's'} ago`;
  if (diffDay < 7) return `${diffDay} day${diffDay === 1 ? '' : 's'} ago`;
  if (diffWeek < 4) return `${diffWeek} week${diffWeek === 1 ? '' : 's'} ago`;
  if (diffMonth < 12) return `${diffMonth} month${diffMonth === 1 ? '' : 's'} ago`;
  return `${diffYear} year${diffYear === 1 ? '' : 's'} ago`;
}

/**
 * Truncate text with ellipsis
 */
export function truncateText(
  text: string,
  maxLength: number,
  ellipsis: string = '...'
): string {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength - ellipsis.length) + ellipsis;
}

/**
 * Generate a random color from a string (for avatars, etc.)
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }

  const hue = hash % 360;
  return `hsl(${hue}, 70%, 60%)`;
}

/**
 * Generate initials from name
 */
export function getInitials(name: string): string {
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .substring(0, 2);
}

/**
 * Calculate percentage
 */
export function calculatePercentage(
  value: number,
  total: number,
  decimals: number = 1
): number {
  if (total === 0) return 0;
  const percentage = (value / total) * 100;
  return parseFloat(percentage.toFixed(decimals));
}

/**
 * Safe number parsing
 */
export function safeParseNumber(
  value: unknown,
  defaultValue: number = 0
): number {
  if (typeof value === 'number') return value;

  const parsed = parseFloat(String(value));
  return isNaN(parsed) ? defaultValue : parsed;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Convert snake_case to Title Case
 */
export function snakeToTitleCase(str: string): string {
  return str
    .split('_')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert camelCase to Title Case
 */
export function camelToTitleCase(str: string): string {
  return str
    .replace(/([A-Z])/g, ' $1')
    .split(' ')
    .map(word => capitalize(word))
    .join(' ')
    .trim();
}

/**
 * Debounce function for performance
 */
export function debounce<T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout>;

  return (...args: Parameters<T>) => {
    clearTimeout(timeout);
    timeout = setTimeout(() => func(...args), wait);
  };
}

/**
 * Throttle function for performance
 */
export function throttle<T extends (...args: any[]) => any>( // eslint-disable-line @typescript-eslint/no-explicit-any
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
}

/**
 * Generate a unique ID
 */
export function generateId(length: number = 8): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';

  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }

  return result;
}

/**
 * Deep clone an object (for immutable updates)
 */
export function deepClone<T>(obj: T): T {
  if (obj === null || typeof obj !== 'object') {
    return obj;
  }

  if (obj instanceof Date) {
    return new Date(obj.getTime()) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  if (Array.isArray(obj)) {
    return obj.map(item => deepClone(item)) as any; // eslint-disable-line @typescript-eslint/no-explicit-any
  }

  if (typeof obj === 'object') {
    const cloned: any = {}; // eslint-disable-line @typescript-eslint/no-explicit-any
    for (const key in obj) {
      if (obj.hasOwnProperty(key)) {
        cloned[key] = deepClone(obj[key]);
      }
    }
    return cloned;
  }

  return obj;
}

/**
 * Merge objects deeply
 */
export function deepMerge<T extends Record<string, any>>( // eslint-disable-line @typescript-eslint/no-explicit-any
  target: T,
  source: Partial<T>
): T {
  const output = { ...target };

  if (isObject(target) && isObject(source)) {
    Object.keys(source).forEach(key => {
      if (isObject(source[key])) {
        if (!(key in target)) {
          Object.assign(output, { [key]: source[key] });
        } else {
          output[key as keyof T] = deepMerge(target[key], source[key]!);
        }
      } else {
        Object.assign(output, { [key]: source[key] });
      }
    });
  }

  return output;
}

function isObject(item: unknown): boolean {
  return item !== null && typeof item === 'object' && !Array.isArray(item);
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(param: string): string | null {
  const urlParams = new URLSearchParams(window.location.search);
  return urlParams.get(param);
}

/**
 * Set query parameter in URL
 */
export function setQueryParam(
  param: string,
  value: string,
  replace: boolean = false
): void {
  const url = new URL(window.location.toString());
  url.searchParams.set(param, value);

  if (replace) {
    window.history.replaceState({}, '', url);
  } else {
    window.history.pushState({}, '', url);
  }
}

/**
 * Remove query parameter from URL
 */
export function removeQueryParam(param: string): void {
  const url = new URL(window.location.toString());
  url.searchParams.delete(param);
  window.history.replaceState({}, '', url);
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error(err)
    // Fallback for older browsers
    try {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      textArea.style.position = 'fixed';
      textArea.style.left = '-999999px';
      textArea.style.top = '-999999px';
      document.body.appendChild(textArea);
      textArea.focus();
      textArea.select();

      const successful = document.execCommand('copy');
      document.body.removeChild(textArea);

      return successful;
    } catch {
      return false;
    }
  }
}

/**
 * Download data as JSON file
 */
export function downloadJson(data: unknown, filename: string): void {
  const jsonString = JSON.stringify(data, null, 2);
  const blob = new Blob([jsonString], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename.endsWith('.json') ? filename : `${filename}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);

  URL.revokeObjectURL(url);
}

/**
 * Calculate reading time
 */
export function calculateReadingTime(text: string, wordsPerMinute: number = 200): number {
  const words = text.trim().split(/\s+/).length;
  return Math.ceil(words / wordsPerMinute);
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Sleep/wait function
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Group array by key
 */
export function groupBy<T>(
  array: T[],
  key: keyof T | ((item: T) => string)
): Record<string, T[]> {
  return array.reduce((groups, item) => {
    const groupKey = typeof key === 'function'
      ? key(item)
      : String(item[key]);

    if (!groups[groupKey]) {
      groups[groupKey] = [];
    }

    groups[groupKey].push(item);
    return groups;
  }, {} as Record<string, T[]>);
}

/**
 * Remove duplicates from array
 */
export function removeDuplicates<T>(
  array: T[],
  key?: keyof T
): T[] {
  if (!key) {
    return [...new Set(array)];
  }

  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    }
    seen.add(value);
    return true;
  });
}

/**
 * Sort array by key
 */
export function sortBy<T>(
  array: T[],
  key: keyof T,
  direction: 'asc' | 'desc' = 'asc'
): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key];
    const bValue = b[key];

    if (aValue < bValue) return direction === 'asc' ? -1 : 1;
    if (aValue > bValue) return direction === 'asc' ? 1 : -1;
    return 0;
  });
}

/**
 * Generate random number in range
 */
export function randomInRange(min: number, max: number): number {
  return Math.random() * (max - min) + min;
}

/**
 * Generate random integer in range
 */
export function randomIntInRange(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Check if running on mobile
 */
export function isMobile(): boolean {
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  );
}

/**
 * Check if running on iOS
 */
export function isIOS(): boolean {
  return /iPad|iPhone|iPod/.test(navigator.userAgent) && !(window as any).MSStream; // eslint-disable-line @typescript-eslint/no-explicit-any
}

/**
 * Check if running on Android
 */
export function isAndroid(): boolean {
  return /Android/.test(navigator.userAgent);
}

/**
 * Check if running in development
 */
export function isDevelopment(): boolean {
  return import.meta.env.DEV;
}

/**
 * Check if running in production
 */
export function isProduction(): boolean {
  return import.meta.env.PROD;
}

// Export all utilities
export default {
  cn,
  formatCurrency,
  formatPercentage,
  formatDate,
  formatDateTime,
  getRelativeTime,
  truncateText,
  stringToColor,
  getInitials,
  calculatePercentage,
  safeParseNumber,
  capitalize,
  snakeToTitleCase,
  camelToTitleCase,
  debounce,
  throttle,
  generateId,
  deepClone,
  deepMerge,
  getQueryParam,
  setQueryParam,
  removeQueryParam,
  copyToClipboard,
  downloadJson,
  calculateReadingTime,
  isValidEmail,
  isValidUrl,
  sleep,
  groupBy,
  removeDuplicates,
  sortBy,
  randomInRange,
  randomIntInRange,
  isMobile,
  isIOS,
  isAndroid,
  isDevelopment,
  isProduction,
};