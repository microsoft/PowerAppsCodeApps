import * as React from "react"
import { QueryClient, QueryClientProvider } from "@tanstack/react-query"

type QueryProviderProps = { children: React.ReactNode }

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      staleTime: 5 * 60 * 1000, // 5 min
      gcTime: 10 * 60 * 1000 // 10 min
    },
    mutations: {
      retry: false
    }
  },
});

export function QueryProvider({ children }: QueryProviderProps) {
  return (
    <QueryClientProvider client={queryClient}>
      {children}
    </QueryClientProvider>
  )
}