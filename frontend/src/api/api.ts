import axios, { AxiosInstance, AxiosError } from "axios";
import { getAuthToken } from "../auth/auth";

// API base URL (should be set via environment variable in production)
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "/api";

// Create axios instance with default config
const apiClient: AxiosInstance = axios.create({
  baseURL: API_BASE_URL,
  timeout: 2000, // 2 seconds for high concurrency requirement
  headers: {
    "Content-Type": "application/json",
  },
  withCredentials: true,
});

// Attach auth token to requests
apiClient.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    if (token) {
      config.headers = {
        ...config.headers,
        Authorization: `Bearer ${token}`,
      };
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Error handling interceptor
apiClient.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // Never expose sensitive info
    if (error.response) {
      // Backend error
      if (error.response.status === 401) {
        // Unauthorized
        return Promise.reject({
          response: error.response,
          message: "Unauthorized",
        });
      }
      if (error.response.status === 500) {
        return Promise.reject({
          response: error.response,
          message: "Server error",
        });
      }
      return Promise.reject({
        response: error.response,
        message: error.response.data?.message || "API error",
      });
    }
    // Network error
    return Promise.reject({
      message: "Network error",
    });
  }
);

export interface NotificationType {
  key: string;
  description: string;
  is_active: boolean;
  is_deprecated: boolean;
  deprecated_reason?: string | null;
}

export interface NotificationTypeListResponse {
  notification_types: NotificationType[];
}

export async function fetchNotificationTypes(locale: string): Promise<NotificationTypeListResponse> {
  // Pass locale as query param for i18n
  const response = await apiClient.get<NotificationTypeListResponse>(
    `/notifications?locale=${encodeURIComponent(locale)}`
  );
  return response.data;
}

// Export apiClient for other endpoints
export { apiClient };