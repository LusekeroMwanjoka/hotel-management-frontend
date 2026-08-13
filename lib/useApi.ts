"use client";

import { useCallback, useEffect, useRef, useState } from "react";

interface UseApiResult<T> {
  data: T | null;
  loading: boolean;
  error: string | null;
  reload: () => void;
}

/**
 * Generic data-fetching hook with loading / error / reload support.
 * `fetcher` is memoised from its dependencies.
 */
export function useApi<T>(
  fetcher: () => Promise<T>,
  deps: unknown[] = []
): UseApiResult<T> {
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const fetcherRef = useRef(fetcher);
  fetcherRef.current = fetcher;

  // eslint-disable-next-line react-hooks/exhaustive-deps
  const memoFetcher = useCallback(() => fetcherRef.current(), deps);

  const load = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const result = await memoFetcher();
      setData(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Something went wrong");
    } finally {
      setLoading(false);
    }
  }, [memoFetcher]);

  useEffect(() => {
    load();
  }, [load]);

  return { data, loading, error, reload: load };
}
