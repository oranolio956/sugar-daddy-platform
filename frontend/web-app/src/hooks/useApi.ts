import { useState, useCallback } from 'react';
import { ApiResponse, withLoading } from '@/lib/api';

export interface UseApiOptions {
  immediate?: boolean;
  onSuccess?: (data: any) => void;
  onError?: (error: Error) => void;
}

export interface UseApiReturn<T> {
  data: T | null;
  loading: boolean;
  error: Error | null;
  execute: (...args: any[]) => Promise<T>;
  reset: () => void;
}

export const useApi = <T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  const { immediate = false, onSuccess, onError } = options;
  
  const [data, setData] = useState<T | null>(null);
  const [loading, setLoading] = useState(immediate);
  const [error, setError] = useState<Error | null>(null);

  const execute = useCallback(
    async (...args: any[]): Promise<T> => {
      try {
        setLoading(true);
        setError(null);
        
        const result = await withLoading(
          () => apiCall(...args),
          setLoading
        );
        
        setData(result);
        onSuccess?.(result);
        return result;
      } catch (err) {
        const error = err instanceof Error ? err : new Error('An unexpected error occurred');
        setError(error);
        onError?.(error);
        throw error;
      }
    },
    [apiCall, onSuccess, onError]
  );

  const reset = useCallback(() => {
    setData(null);
    setLoading(false);
    setError(null);
  }, []);

  return {
    data,
    loading,
    error,
    execute,
    reset,
  };
};

// Hook for authenticated API calls with automatic token refresh
export const useAuthApi = <T = any>(
  apiCall: (...args: any[]) => Promise<ApiResponse<T>>,
  options: UseApiOptions = {}
): UseApiReturn<T> => {
  return useApi(apiCall, options);
};

// Hook for paginated API calls
export interface UsePaginatedApiOptions extends UseApiOptions {
  initialPage?: number;
  initialLimit?: number;
}

export interface UsePaginatedApiReturn<T> extends UseApiReturn<T[]> {
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
  setPage: (page: number) => void;
}

export const usePaginatedApi = <T = any>(
  apiCall: (page: number, limit: number) => Promise<any>,
  options: UsePaginatedApiOptions = {}
): UsePaginatedApiReturn<T> => {
  const { initialPage = 1, initialLimit = 10, ...apiOptions } = options;
  
  const [page, setPage] = useState(initialPage);
  const [limit, setLimit] = useState(initialLimit);
  const [pagination, setPagination] = useState({
    page: initialPage,
    limit: initialLimit,
    total: 0,
    totalPages: 0,
  });

  const apiResult = useApi(
    async (currentPage: number, currentLimit: number) => {
      const response = await apiCall(currentPage, currentLimit);
      if (response.pagination) {
        setPagination(response.pagination);
      }
      return response;
    },
    {
      ...apiOptions,
      immediate: true,
    }
  );

  const loadMore = useCallback(async () => {
    if (page < pagination.totalPages) {
      setPage(prev => prev + 1);
      await apiResult.execute(page + 1, limit);
    }
  }, [page, limit, pagination.totalPages, apiResult]);

  const refresh = useCallback(async () => {
    setPage(initialPage);
    setLimit(initialLimit);
    await apiResult.execute(initialPage, initialLimit);
  }, [initialPage, initialLimit, apiResult]);

  return {
    ...apiResult,
    pagination,
    loadMore,
    refresh,
    setPage: (newPage: number) => setPage(newPage),
  };
};