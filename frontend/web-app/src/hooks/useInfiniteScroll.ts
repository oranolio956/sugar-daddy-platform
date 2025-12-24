'use client';

import { useState, useEffect, useRef, useCallback } from 'react';

interface UseInfiniteScrollOptions {
  threshold?: number;
  rootMargin?: string;
  disabled?: boolean;
  initialData?: any[];
  loadMore: (page: number) => Promise<any[]>;
}

interface UseInfiniteScrollReturn {
  data: any[];
  isLoading: boolean;
  hasMore: boolean;
  error: string | null;
  loadMore: () => void;
  reset: () => void;
  observeElement: (element: HTMLElement | null) => void;
}

export const useInfiniteScroll = ({
  threshold = 0.1,
  rootMargin = '0px',
  disabled = false,
  initialData = [],
  loadMore: loadMoreFn,
}: UseInfiniteScrollOptions): UseInfiniteScrollReturn => {
  const [data, setData] = useState<any[]>(initialData);
  const [isLoading, setIsLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  
  const observerRef = useRef<IntersectionObserver | null>(null);
  const targetRef = useRef<HTMLElement | null>(null);
  const isFetching = useRef(false);

  const loadMore = useCallback(async () => {
    if (disabled || isLoading || isFetching.current || !hasMore) return;

    isFetching.current = true;
    setIsLoading(true);
    setError(null);

    try {
      const newData = await loadMoreFn(page);
      
      if (newData.length === 0) {
        setHasMore(false);
      } else {
        setData(prevData => [...prevData, ...newData]);
        setPage(prevPage => prevPage + 1);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load more items');
    } finally {
      setIsLoading(false);
      isFetching.current = false;
    }
  }, [disabled, isLoading, hasMore, loadMoreFn, page]);

  const reset = useCallback(() => {
    setData(initialData);
    setPage(1);
    setHasMore(true);
    setError(null);
    setIsLoading(false);
    isFetching.current = false;
  }, [initialData]);

  const observeElement = useCallback((element: HTMLElement | null) => {
    targetRef.current = element;
    
    if (observerRef.current) {
      observerRef.current.disconnect();
    }

    if (!element || disabled || isLoading || !hasMore) return;

    observerRef.current = new IntersectionObserver(
      (entries) => {
        if (entries[0].isIntersecting) {
          loadMore();
        }
      },
      {
        threshold,
        rootMargin,
      }
    );

    observerRef.current.observe(element);
  }, [disabled, isLoading, hasMore, threshold, rootMargin, loadMore]);

  // Auto-load more when component mounts if we have initial data
  useEffect(() => {
    if (initialData.length > 0 && !disabled) {
      const timer = setTimeout(() => {
        if (targetRef.current) {
          observeElement(targetRef.current);
        }
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [initialData.length, disabled, observeElement]);

  // Cleanup observer on unmount
  useEffect(() => {
    return () => {
      if (observerRef.current) {
        observerRef.current.disconnect();
      }
    };
  }, []);

  return {
    data,
    isLoading,
    hasMore,
    error,
    loadMore,
    reset,
    observeElement,
  };
};

// Hook for virtualized infinite scroll (for long lists)
interface UseVirtualizedInfiniteScrollOptions {
  itemHeight: number;
  containerHeight: number;
  totalItems: number;
  renderItem: (index: number) => React.ReactNode;
  overscan?: number;
}

interface UseVirtualizedInfiniteScrollReturn {
  visibleItems: React.ReactNode[];
  totalHeight: number;
  startIndex: number;
  endIndex: number;
  scrollToIndex: (index: number) => void;
}

export const useVirtualizedInfiniteScroll = ({
  itemHeight,
  containerHeight,
  totalItems,
  renderItem,
  overscan = 5,
}: UseVirtualizedInfiniteScrollOptions): UseVirtualizedInfiniteScrollReturn => {
  const [scrollTop, setScrollTop] = useState(0);

  const startIndex = Math.max(0, Math.floor(scrollTop / itemHeight) - overscan);
  const endIndex = Math.min(
    totalItems - 1,
    Math.ceil((scrollTop + containerHeight) / itemHeight) + overscan
  );

  const visibleItems = [];
  for (let i = startIndex; i <= endIndex; i++) {
    visibleItems.push(
      <div
        key={i}
        style={{
          position: 'absolute',
          top: i * itemHeight,
          left: 0,
          right: 0,
          height: itemHeight,
        }}
      >
        {renderItem(i)}
      </div>
    );
  }

  const totalHeight = totalItems * itemHeight;

  const scrollToIndex = (index: number) => {
    const top = index * itemHeight;
    setScrollTop(top);
  };

  return {
    visibleItems,
    totalHeight,
    startIndex,
    endIndex,
    scrollToIndex,
  };
};

// Hook for pagination-based infinite scroll
interface UsePaginationInfiniteScrollOptions {
  initialPage?: number;
  pageSize?: number;
  fetchPage: (page: number, pageSize: number) => Promise<{ items: any[]; total: number }>;
}

interface UsePaginationInfiniteScrollReturn {
  items: any[];
  currentPage: number;
  totalPages: number;
  isLoading: boolean;
  error: string | null;
  hasNextPage: boolean;
  hasPrevPage: boolean;
  nextPage: () => void;
  prevPage: () => void;
  goToPage: (page: number) => void;
  refresh: () => void;
}

export const usePaginationInfiniteScroll = ({
  initialPage = 1,
  pageSize = 20,
  fetchPage,
}: UsePaginationInfiniteScrollOptions): UsePaginationInfiniteScrollReturn => {
  const [items, setItems] = useState<any[]>([]);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [totalPages, setTotalPages] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadPage = useCallback(async (page: number) => {
    if (page < 1 || (totalPages > 0 && page > totalPages)) return;

    setIsLoading(true);
    setError(null);

    try {
      const result = await fetchPage(page, pageSize);
      setItems(result.items);
      setTotalPages(Math.ceil(result.total / pageSize));
      setCurrentPage(page);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load page');
    } finally {
      setIsLoading(false);
    }
  }, [fetchPage, pageSize, totalPages]);

  const nextPage = useCallback(() => {
    if (currentPage < totalPages) {
      loadPage(currentPage + 1);
    }
  }, [currentPage, totalPages, loadPage]);

  const prevPage = useCallback(() => {
    if (currentPage > 1) {
      loadPage(currentPage - 1);
    }
  }, [currentPage, loadPage]);

  const goToPage = useCallback((page: number) => {
    loadPage(page);
  }, [loadPage]);

  const refresh = useCallback(() => {
    loadPage(currentPage);
  }, [loadPage, currentPage]);

  // Load initial page
  useEffect(() => {
    loadPage(initialPage);
  }, [loadPage, initialPage]);

  return {
    items,
    currentPage,
    totalPages,
    isLoading,
    error,
    hasNextPage: currentPage < totalPages,
    hasPrevPage: currentPage > 1,
    nextPage,
    prevPage,
    goToPage,
    refresh,
  };
};