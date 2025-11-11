export abstract class BaseClient {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  protected getBaseUrl(defaultUrl: string, _?: string): string {
    return process.env.NEXT_PUBLIC_API_URL || defaultUrl;
  }

  protected transformOptions(options: RequestInit): Promise<RequestInit> {
    const token = localStorage.getItem("token");

    if (token) {
      const headers = new Headers(options.headers || {});
      headers.set("Authorization", `Bearer ${token}`);

      return Promise.resolve({
        ...options,
        headers,
      });
    }

    return Promise.resolve(options);
  }

  protected getDefaultHttp(): { fetch(url: RequestInfo, init?: RequestInit): Promise<Response> } {
    return { fetch };
  }
}
