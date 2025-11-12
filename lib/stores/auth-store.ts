import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { apiClient } from '@/lib/api/client';

interface AuthState {
  accessToken: string | null;
  refreshToken: string | null;
  expiresAt: number | null;
  isLoading: boolean;

  // Actions
  setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => void;
  clearTokens: () => void;
  isAuthenticated: () => boolean;
  isTokenExpiring: () => boolean;
  refreshAccessToken: () => Promise<boolean>;
  initialize: () => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      accessToken: null,
      refreshToken: null,
      expiresAt: null,
      isLoading: false,

      setTokens: (accessToken: string, refreshToken: string, expiresIn: number) => {
        const expiresAt = Date.now() + expiresIn * 1000; // Convert seconds to milliseconds
        set({ accessToken, refreshToken, expiresAt });
      },

      clearTokens: () => {
        set({ accessToken: null, refreshToken: null, expiresAt: null });
      },

      isAuthenticated: () => {
        const { accessToken, expiresAt } = get();
        if (!accessToken || !expiresAt) return false;
        return Date.now() < expiresAt;
      },

      isTokenExpiring: () => {
        const { expiresAt } = get();
        if (!expiresAt) return true;

        // Token is expiring if less than 5 minutes left
        const fiveMinutes = 5 * 60 * 1000;
        return Date.now() + fiveMinutes >= expiresAt;
      },

      refreshAccessToken: async () => {
        const { refreshToken: currentRefreshToken, setTokens, clearTokens } = get();

        if (!currentRefreshToken) {
          return false;
        }

        try {
          set({ isLoading: true });
          const response = await apiClient.postApiAuthRefresh({
            refreshToken: currentRefreshToken,
          });

          if (response.accessToken && response.refreshToken && response.expiresIn) {
            setTokens(response.accessToken, response.refreshToken, response.expiresIn);
            return true;
          }

          clearTokens();
          return false;
        } catch (error) {
          console.error('Failed to refresh token:', error);
          clearTokens();
          return false;
        } finally {
          set({ isLoading: false });
        }
      },

      initialize: async () => {
        const { refreshToken, refreshAccessToken, clearTokens } = get();

        // If we have a refresh token, try to get a fresh access token
        if (refreshToken) {
          const success = await refreshAccessToken();
          if (!success) {
            clearTokens();
          }
        }
      },
    }),
    {
      name: 'auth-storage',
      partialize: (state) => ({
        accessToken: state.accessToken,
        refreshToken: state.refreshToken,
        expiresAt: state.expiresAt,
      }),
    }
  )
);
