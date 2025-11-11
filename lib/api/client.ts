import { ApiClient } from './generated-client';

// Create a singleton instance of the API client with custom http implementation
// that works in both browser and Node.js environments
const httpImplementation = {
  fetch: (url: RequestInfo, init?: RequestInit) => {
    return fetch(url, init);
  }
};

export const apiClient = new ApiClient(undefined, httpImplementation);
