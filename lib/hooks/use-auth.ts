import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { apiClient } from '@/lib/api/client';
import { useAuthStore } from '@/lib/stores/auth-store';
import type { LoginRequest } from '@/lib/api/generated-client';

export function useAuth() {
  const { isAuthenticated, clearTokens, isLoading } = useAuthStore();
  const router = useRouter();

  const logout = () => {
    clearTokens();
    router.push('/login');
  };

  return {
    isAuthenticated: isAuthenticated(),
    isLoading,
    logout,
  };
}

export function useLogin() {
  const { setTokens } = useAuthStore();
  const router = useRouter();

  return useMutation({
    mutationFn: async (credentials: LoginRequest) => {
      const response = await apiClient.postApiAuthLogin(credentials);
      return response;
    },
    onSuccess: (data) => {
      if (data.accessToken && data.refreshToken && data.expiresIn) {
        setTokens(data.accessToken, data.refreshToken, data.expiresIn);
        router.push('/test-api');
      }
    },
  });
}
