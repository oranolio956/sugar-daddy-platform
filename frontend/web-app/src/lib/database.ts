/**
 * Database optimization utilities for performance improvements
 */

// Query optimization utilities
export class DatabaseOptimizer {
  private static instance: DatabaseOptimizer;
  private queryCache = new Map<string, { data: any; timestamp: number }>();
  private queryMetrics = new Map<string, { count: number; totalTime: number; avgTime: number }>();

  static getInstance(): DatabaseOptimizer {
    if (!DatabaseOptimizer.instance) {
      DatabaseOptimizer.instance = new DatabaseOptimizer();
    }
    return DatabaseOptimizer.instance;
  }

  /**
   * Cache query results with TTL
   */
  async cachedQuery<T>(
    key: string,
    queryFn: () => Promise<T>,
    ttl: number = 5 * 60 * 1000 // 5 minutes default
  ): Promise<T> {
    const cached = this.queryCache.get(key);
    const now = Date.now();

    if (cached && (now - cached.timestamp) < ttl) {
      return cached.data;
    }

    const startTime = performance.now();
    const result = await queryFn();
    const endTime = performance.now();

    // Update metrics
    this.updateMetrics(key, endTime - startTime);

    // Cache result
    this.queryCache.set(key, {
      data: result,
      timestamp: now,
    });

    return result;
  }

  /**
   * Batch multiple queries for better performance
   */
  async batchQueries<T>(queries: Array<() => Promise<T>>): Promise<T[]> {
    const startTime = performance.now();
    
    try {
      const results = await Promise.all(queries);
      const endTime = performance.now();
      
      console.log(`Batch query completed in ${endTime - startTime}ms`);
      return results;
    } catch (error) {
      console.error('Batch query failed:', error);
      throw error;
    }
  }

  /**
   * Paginate queries efficiently
   */
  paginateQuery<T>(
    data: T[],
    page: number,
    limit: number,
    sortFn?: (a: T, b: T) => number
  ): { data: T[]; total: number; page: number; totalPages: number } {
    const total = data.length;
    const totalPages = Math.ceil(total / limit);
    const currentPage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (currentPage - 1) * limit;
    const endIndex = startIndex + limit;

    let sortedData = data;
    if (sortFn) {
      sortedData = [...data].sort(sortFn);
    }

    const paginatedData = sortedData.slice(startIndex, endIndex);

    return {
      data: paginatedData,
      total,
      page: currentPage,
      totalPages,
    };
  }

  /**
   * Optimize search queries with indexing
   */
  searchWithIndex<T>(
    data: T[],
    searchFields: (keyof T)[],
    searchTerm: string,
    options: {
      limit?: number;
      offset?: number;
      sortField?: keyof T;
      sortOrder?: 'asc' | 'desc';
    } = {}
  ): T[] {
    const { limit = 20, offset = 0, sortField, sortOrder = 'asc' } = options;
    
    if (!searchTerm.trim()) {
      return this.paginateQuery(data, 1, limit).data;
    }

    const searchLower = searchTerm.toLowerCase();
    const results = data.filter(item => {
      return searchFields.some(field => {
        const value = item[field];
        if (typeof value === 'string') {
          return value.toLowerCase().includes(searchLower);
        }
        return false;
      });
    });

    // Sort results
    if (sortField) {
      results.sort((a, b) => {
        const aVal = a[sortField];
        const bVal = b[sortField];
        
        if (aVal < bVal) return sortOrder === 'asc' ? -1 : 1;
        if (aVal > bVal) return sortOrder === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return results.slice(offset, offset + limit);
  }

  /**
   * Update query metrics for monitoring
   */
  private updateMetrics(queryKey: string, executionTime: number) {
    const metrics = this.queryMetrics.get(queryKey) || { count: 0, totalTime: 0, avgTime: 0 };
    
    metrics.count++;
    metrics.totalTime += executionTime;
    metrics.avgTime = metrics.totalTime / metrics.count;
    
    this.queryMetrics.set(queryKey, metrics);
  }

  /**
   * Get query performance metrics
   */
  getMetrics(): Record<string, { count: number; totalTime: number; avgTime: number }> {
    return Object.fromEntries(this.queryMetrics);
  }

  /**
   * Clear cache
   */
  clearCache(): void {
    this.queryCache.clear();
  }

  /**
   * Clear metrics
   */
  clearMetrics(): void {
    this.queryMetrics.clear();
  }
}

// Connection pooling utilities
export class ConnectionPool {
  private connections: any[] = [];
  private maxConnections: number;
  private activeConnections: number = 0;

  constructor(maxConnections: number = 10) {
    this.maxConnections = maxConnections;
  }

  async getConnection(): Promise<any> {
    if (this.activeConnections < this.maxConnections) {
      // Create new connection
      const connection = await this.createConnection();
      this.connections.push(connection);
      this.activeConnections++;
      return connection;
    }

    // Wait for available connection
    return new Promise((resolve) => {
      const checkConnection = () => {
        if (this.activeConnections < this.maxConnections) {
          const connection = this.connections.find(conn => !conn.inUse);
          if (connection) {
            connection.inUse = true;
            this.activeConnections++;
            resolve(connection);
          } else {
            setTimeout(checkConnection, 100);
          }
        } else {
          setTimeout(checkConnection, 100);
        }
      };
      checkConnection();
    });
  }

  releaseConnection(connection: any): void {
    connection.inUse = false;
    this.activeConnections--;
  }

  private async createConnection(): Promise<any> {
    // This would be your actual database connection logic
    return {
      inUse: false,
      query: async (sql: string, params: any[]) => {
        // Simulate query execution
        return new Promise(resolve => setTimeout(() => resolve([]), 100));
      },
      release: () => this.releaseConnection(this),
    };
  }
}

// Database utilities
export const DatabaseUtils = {
  // Optimize indexes
  optimizeIndexes: (tableName: string, indexes: string[]) => {
    console.log(`Optimizing indexes for ${tableName}:`, indexes);
    // This would contain actual index optimization logic
  },

  // Analyze query performance
  analyzeQuery: (query: string, params: any[]) => {
    const startTime = performance.now();
    
    return {
      execute: async (db: any) => {
        const result = await db.query(query, params);
        const endTime = performance.now();
        
        console.log(`Query executed in ${endTime - startTime}ms:`, {
          query,
          params,
          executionTime: endTime - startTime,
        });
        
        return result;
      },
    };
  },

  // Bulk operations
  bulkInsert: async (tableName: string, records: any[], batchSize: number = 100) => {
    const optimizer = DatabaseOptimizer.getInstance();
    
    for (let i = 0; i < records.length; i += batchSize) {
      const batch = records.slice(i, i + batchSize);
      await optimizer.cachedQuery(
        `bulk_insert_${tableName}_${i}`,
        async () => {
          // Implement bulk insert logic
          console.log(`Inserting batch ${i / batchSize + 1} of ${Math.ceil(records.length / batchSize)}`);
          return true;
        },
        0 // No caching for inserts
      );
    }
  },

  // Database health check
  healthCheck: async (db: any): Promise<{ status: string; uptime: number; connections: number }> => {
    try {
      const startTime = Date.now();
      await db.query('SELECT 1');
      const uptime = Date.now() - startTime;
      
      return {
        status: 'healthy',
        uptime,
        connections: 1, // This would be actual connection count
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        uptime: 0,
        connections: 0,
      };
    }
  },
};