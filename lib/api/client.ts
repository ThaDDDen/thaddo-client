import { ApiClient } from "./generated-client";

let getAuthStore: (() => any) | null = null;
let isRefreshing = false;
let refreshPromise: Promise<boolean> | null = null;

if (typeof window !== "undefined") {
  import("@/lib/stores/auth-store").then((module) => {
    getAuthStore = () => module.useAuthStore.getState();
  });
}

// Create a singleton instance of the API client with custom http implementation
// that handles 401 responses and token refresh
const httpImplementation = {
  fetch: async (url: RequestInfo, init?: RequestInit): Promise<Response> => {
    const urlString = typeof url === "string" ? url : url.toString();
    const response = await fetch(url, init);

    // If we get a 401 and we're not already on the refresh endpoint, try to refresh the token
    if (
      response.status === 401 &&
      !urlString.includes("/api/Auth/refresh") &&
      typeof window !== "undefined" &&
      getAuthStore
    ) {
      const authStore = getAuthStore();

      // Prevent multiple simultaneous refresh attempts
      if (!isRefreshing) {
        isRefreshing = true;
        refreshPromise = authStore.refreshAccessToken();
      }

      const refreshed = await refreshPromise;
      isRefreshing = false;
      refreshPromise = null;

      if (refreshed) {
        // Retry the original request with the new token
        const newAccessToken = authStore.accessToken;
        if (newAccessToken) {
          const headers = new Headers(init?.headers || {});
          headers.set("Authorization", `Bearer ${newAccessToken}`);

          return fetch(url, {
            ...init,
            headers,
          });
        }
      } else {
        // Refresh failed, clear tokens and redirect to login
        authStore.clearTokens();
        window.location.href = "/login";
      }
    }

    return response;
  },
};

const baseUrl = process.env.NEXT_PUBLIC_API_URL || "";
export const apiClient = new ApiClient(baseUrl, httpImplementation);
