// Authentication utilities for login, logout, and session management

const TOKEN_KEY = "notification_preferences_token";

// Get auth token from localStorage
export function getAuthToken(): string | null {
  return localStorage.getItem(TOKEN_KEY);
}

// Save auth token to localStorage
export function setAuthToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

// Remove auth token from localStorage
export function removeAuthToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

// Check if user is authenticated
export function isAuthenticated(): boolean {
  const token = getAuthToken();
  // Optionally, validate token expiration here
  return !!token;
}

// Logout user
export function logout(): void {
  removeAuthToken();
  // Optionally, redirect to login page
  window.location.href = "/login";
}

// Login user (example, actual implementation may vary)
export async function login(email: string, password: string): Promise<void> {
  // Replace with actual API call
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: `username=${encodeURIComponent(email)}&password=${encodeURIComponent(password)}`,
  });
  if (!response.ok) {
    throw new Error("Login failed");
  }
  const data = await response.json();
  if (data.access_token) {
    setAuthToken(data.access_token);
  } else {
    throw new Error("No access token received");
  }
}