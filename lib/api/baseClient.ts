// Import auth store dynamically to avoid circular dependency and SSR issues
let getAuthStore: (() => any) | null = null;

if (typeof window !== "undefined") {
  // Dynamically import the auth store only in the browser
  import("@/lib/stores/auth-store").then((module) => {
    getAuthStore = () => module.useAuthStore.getState();
  });
}

export abstract class BaseClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getBaseUrl(defaultUrl: string, _?: string): string {
    return process.env.NEXT_PUBLIC_API_URL || defaultUrl;
  }

  protected async transformOptions(options: RequestInit): Promise<RequestInit> {
    // Only process auth in the browser
    if (typeof window === "undefined" || !getAuthStore) {
      return options;
    }

    const authStore = getAuthStore();

    // Get the current access token
    const accessToken = authStore.accessToken;

    if (accessToken) {
      const headers = new Headers(options.headers || {});
      headers.set("Authorization", `Bearer ${accessToken}`);

      return {
        ...options,
        headers,
      };
    }

    return options;
  }

  protected getDefaultHttp(): {
    fetch(url: RequestInfo, init?: RequestInit): Promise<Response>;
  } {
    // Use global fetch (works in both Node.js and browser environments)
    return {
      fetch: (url: RequestInfo, init?: RequestInit) => {
        return fetch(url, init);
      },
    };
  }
}
