import { useQuery, type UseQueryOptions } from "@tanstack/react-query";

export const API_BASE =
  (typeof import.meta !== "undefined" && import.meta.env && import.meta.env.VITE_API_BASE_URL) ||
  "/api";

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
