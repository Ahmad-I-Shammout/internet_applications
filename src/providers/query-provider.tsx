'use client';

import { useState } from 'react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { ReactQueryDevtools } from '@tanstack/react-query-devtools';
import { makeQueryClient } from '@/lib/query-client';

// Module-level variable: reused across renders on the browser only
let browserQueryClient: QueryClient | undefined = undefined;

/**
 * Returns a stable QueryClient for the browser (singleton per session)
 * and a fresh one for every server request.
 */
function getQueryClient(): QueryClient {
  if (typeof window === 'undefined') {
    // Server: always create a new instance to prevent cross-request leaks
    return makeQueryClient();
  }
  // Browser: reuse the same instance — avoids cache loss on re-renders
  if (!browserQueryClient) {
    browserQueryClient = makeQueryClient();
  }
  return browserQueryClient;
}

export function QueryProvider({ children }: { children: React.ReactNode }) {
  // NOTE: useState is NOT used here because getQueryClient() already handles
  // the singleton pattern safely for both SSR and CSR contexts.
  const queryClient = getQueryClient();

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <ReactQueryDevtools initialIsOpen={false} />
    </QueryClientProvider>
  );
}
