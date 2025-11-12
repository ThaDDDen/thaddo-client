"use client";

import { useEffect, useState } from "react";
import { useAuthStore } from "@/lib/stores/auth-store";

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const initialize = useAuthStore((state) => state.initialize);

  useEffect(() => {
    // Initialize auth on app load
    initialize().finally(() => {
      setIsInitialized(true);
    });
  }, [initialize]);

  // Show nothing while initializing to prevent flash of wrong content
  if (!isInitialized) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  return <>{children}</>;
}
