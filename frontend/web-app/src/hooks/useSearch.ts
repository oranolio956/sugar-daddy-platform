'use client';

import { useState, useEffect, useCallback, useMemo } from 'react';
import { debounce } from '@/lib/utils';

interface SearchFilterOptions {
  searchFields?: string[];
  filters?: {
    [key: string]: {
      type: 'text' | 'select' | 'range' | 'checkbox' | 'date';
      options?: any[];
      min?: number;
      max?: number;
      defaultValue?: any;
    };
  };
  sortOptions?: {
    field: string;
    direction: 'asc' | 'desc';
  }[];
  debounceMs?: number;
  initialSearch?: string;
  initialFilters?: { [key: string]: any };
  initialSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
}

interface SearchFilterState {
  search: string;
  filters: { [key: string]: any };
  sort: {
    field: string;
    direction: 'asc' | 'desc';
  } | null;
  page: number;
  pageSize: number;
}

interface UseSearchReturn<T> {
  // State
  state: SearchFilterState;
  results: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
  
  // Actions
  setSearch: (search: string) => void;
  setFilter: (key: string, value: any) => void;
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  resetFilters: () => void;
  clearSearch: () => void;
  
  // Computed
  hasFilters: boolean;
  isSearching: boolean;
}

export const useSearch = <T>(
  data: T[],
  options: SearchFilterOptions = {}
): UseSearchReturn<T> => {
  const {
    searchFields = ['name', 'title', 'description'],
    filters = {},
    sortOptions = [],
    debounceMs = 300,
    initialSearch = '',
    initialFilters = {},
    initialSort = null,
  } = options;

  const [state, setState] = useState<SearchFilterState>({
    search: initialSearch,
    filters: initialFilters,
    sort: initialSort,
    page: 1,
    pageSize: 20,
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Debounced search function
  const debouncedSearch = useCallback(
    debounce((searchTerm: string) => {
      setState(prev => ({ ...prev, search: searchTerm, page: 1 }));
    }, debounceMs),
    [debounceMs]
  );

  // Search function
  const performSearch = useCallback((searchTerm: string, item: T): boolean => {
    if (!searchTerm.trim()) return true;

    return searchFields.some(field => {
      const value = getNestedValue(item, field);
      if (value == null) return false;
      
      return String(value)
        .toLowerCase()
        .includes(searchTerm.toLowerCase());
    });
  }, [searchFields]);

  // Filter function
  const performFilters = useCallback((item: T, filterValues: { [key: string]: any }): boolean => {
    return Object.keys(filterValues).every(key => {
      const filterValue = filterValues[key];
      if (filterValue == null || filterValue === '') return true;

      const itemValue = getNestedValue(item, key);
      const filterConfig = filters[key];

      if (!filterConfig) return true;

      switch (filterConfig.type) {
        case 'text':
          return String(itemValue).toLowerCase().includes(String(filterValue).toLowerCase());
        
        case 'select':
          return itemValue === filterValue;
        
        case 'checkbox':
          if (Array.isArray(filterValue)) {
            return filterValue.includes(itemValue);
          }
          return itemValue === filterValue;
        
        case 'range':
          if (typeof itemValue !== 'number') return true;
          const [min, max] = filterValue;
          return itemValue >= (min || -Infinity) && itemValue <= (max || Infinity);
        
        case 'date':
          if (!itemValue) return true;
          const itemDate = new Date(itemValue);
          const [startDate, endDate] = filterValue;
          return itemDate >= new Date(startDate) && itemDate <= new Date(endDate);
        
        default:
          return true;
      }
    });
  }, [filters]);

  // Sort function
  const performSort = useCallback((a: T, b: T, sortConfig: { field: string; direction: 'asc' | 'desc' } | null): number => {
    if (!sortConfig) return 0;

    const { field, direction } = sortConfig;
    const aValue = getNestedValue(a, field);
    const bValue = getNestedValue(b, field);

    if (aValue == null && bValue == null) return 0;
    if (aValue == null) return direction === 'asc' ? 1 : -1;
    if (bValue == null) return direction === 'asc' ? -1 : 1;

    let comparison = 0;
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      comparison = aValue.localeCompare(bValue);
    } else if (typeof aValue === 'number' && typeof bValue === 'number') {
      comparison = aValue - bValue;
    } else if (aValue instanceof Date && bValue instanceof Date) {
      comparison = aValue.getTime() - bValue.getTime();
    } else {
      comparison = String(aValue).localeCompare(String(bValue));
    }

    return direction === 'asc' ? comparison : -comparison;
  }, []);

  // Get nested object value
  const getNestedValue = (obj: any, path: string): any => {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  };

  // Filtered and sorted data
  const filteredData = useMemo(() => {
    setIsLoading(true);
    setError(null);

    try {
      const filtered = data.filter(item => 
        performSearch(state.search, item) && 
        performFilters(item, state.filters)
      );

      const sorted = [...filtered].sort((a, b) => 
        performSort(a, b, state.sort)
      );

      return sorted;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [data, state.search, state.filters, state.sort, performSearch, performFilters, performSort]);

  // Paginated results
  const results = useMemo(() => {
    const startIndex = (state.page - 1) * state.pageSize;
    const endIndex = startIndex + state.pageSize;
    return filteredData.slice(startIndex, endIndex);
  }, [filteredData, state.page, state.pageSize]);

  // Total count
  const total = filteredData.length;

  // Actions
  const setSearch = useCallback((search: string) => {
    debouncedSearch(search);
  }, [debouncedSearch]);

  const setFilter = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1,
    }));
  }, []);

  const setSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sort: { field, direction },
      page: 1,
    }));
  }, []);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
  }, []);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 }));
  }, []);

  const resetFilters = useCallback(() => {
    setState(prev => ({
      ...prev,
      filters: {},
      sort: null,
      page: 1,
    }));
  }, []);

  const clearSearch = useCallback(() => {
    setState(prev => ({
      ...prev,
      search: '',
      page: 1,
    }));
  }, []);

  // Computed values
  const hasFilters = useMemo(() => {
    return Object.keys(state.filters).length > 0 || state.sort !== null;
  }, [state.filters, state.sort]);

  const isSearching = useMemo(() => {
    return state.search.length > 0;
  }, [state.search]);

  return {
    state,
    results,
    total,
    isLoading,
    error,
    setSearch,
    setFilter,
    setSort,
    setPage,
    setPageSize,
    resetFilters,
    clearSearch,
    hasFilters,
    isSearching,
  };
};

// Hook for server-side search
interface ServerSearchOptions {
  searchEndpoint: string;
  debounceMs?: number;
  initialSearch?: string;
  initialFilters?: { [key: string]: any };
  initialSort?: {
    field: string;
    direction: 'asc' | 'desc';
  };
  initialPage?: number;
  initialPageSize?: number;
}

interface ServerSearchReturn<T> {
  data: T[];
  total: number;
  isLoading: boolean;
  error: string | null;
  search: string;
  filters: { [key: string]: any };
  sort: { field: string; direction: 'asc' | 'desc' } | null;
  page: number;
  pageSize: number;
  
  setSearch: (search: string) => void;
  setFilter: (key: string, value: any) => void;
  setSort: (field: string, direction: 'asc' | 'desc') => void;
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  refetch: () => Promise<void>;
}

export const useServerSearch = <T>(
  options: ServerSearchOptions
): ServerSearchReturn<T> => {
  const {
    searchEndpoint,
    debounceMs = 300,
    initialSearch = '',
    initialFilters = {},
    initialSort = null,
    initialPage = 1,
    initialPageSize = 20,
  } = options;

  const [state, setState] = useState({
    search: initialSearch,
    filters: initialFilters,
    sort: initialSort,
    page: initialPage,
    pageSize: initialPageSize,
  });

  const [data, setData] = useState<T[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const debouncedFetch = useCallback(
    debounce(async () => {
      await fetchData();
    }, debounceMs),
    [debounceMs]
  );

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const params = new URLSearchParams();
      params.append('search', state.search);
      params.append('page', state.page.toString());
      params.append('pageSize', state.pageSize.toString());
      
      if (state.sort) {
        params.append('sort', state.sort.field);
        params.append('direction', state.sort.direction);
      }

      Object.keys(state.filters).forEach(key => {
        const value = state.filters[key];
        if (value != null && value !== '') {
          params.append(`filter[${key}]`, JSON.stringify(value));
        }
      });

      const response = await fetch(`${searchEndpoint}?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      setData(result.data || []);
      setTotal(result.total || 0);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed');
      setData([]);
      setTotal(0);
    } finally {
      setIsLoading(false);
    }
  }, [searchEndpoint, state]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const setSearch = useCallback((search: string) => {
    setState(prev => ({ ...prev, search, page: 1 }));
    debouncedFetch();
  }, [debouncedFetch]);

  const setFilter = useCallback((key: string, value: any) => {
    setState(prev => ({
      ...prev,
      filters: { ...prev.filters, [key]: value },
      page: 1,
    }));
    debouncedFetch();
  }, [debouncedFetch]);

  const setSort = useCallback((field: string, direction: 'asc' | 'desc') => {
    setState(prev => ({
      ...prev,
      sort: { field, direction },
      page: 1,
    }));
    debouncedFetch();
  }, [debouncedFetch]);

  const setPage = useCallback((page: number) => {
    setState(prev => ({ ...prev, page }));
    fetchData();
  }, [fetchData]);

  const setPageSize = useCallback((pageSize: number) => {
    setState(prev => ({ ...prev, pageSize, page: 1 }));
    fetchData();
  }, [fetchData]);

  const refetch = useCallback(async () => {
    await fetchData();
  }, [fetchData]);

  return {
    data,
    total,
    isLoading,
    error,
    search: state.search,
    filters: state.filters,
    sort: state.sort,
    page: state.page,
    pageSize: state.pageSize,
    setSearch,
    setFilter,
    setSort,
    setPage,
    setPageSize,
    refetch,
  };
};