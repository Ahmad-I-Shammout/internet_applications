import { QueryClient } from '@tanstack/react-query';

/**
 * Factory function — always call this instead of using a shared singleton.
 * - On the server: each request gets a fresh instance (prevents cross-request data leaks).
 * - On the browser: the QueryProvider manages a single stable instance per session.
 */
export function makeQueryClient(): QueryClient {
  return new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 0,
        gcTime: 0, // Invalidate cache immediately on unmount
        retry: 1,
        refetchOnWindowFocus: false,
      },
    },
  });
}
