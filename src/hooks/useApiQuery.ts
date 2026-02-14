import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

/**
 * Placeholder API fetcher — replace baseUrl with your FastAPI backend.
 * For now returns null after a simulated delay to show loading states.
 */
const API_BASE = "/api"; // Replace with your FastAPI URL

async function apiFetch<T>(endpoint: string): Promise<T> {
  const res = await fetch(`${API_BASE}${endpoint}`);
  if (!res.ok) throw new Error(`API error: ${res.status}`);
  return res.json();
}

export function useApiQuery<T>(
  key: string[],
  endpoint: string,
  options?: Partial<UseQueryOptions<T>>
) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => apiFetch<T>(endpoint),
    retry: false,
    ...options,
  });
}
