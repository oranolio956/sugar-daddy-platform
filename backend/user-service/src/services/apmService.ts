import { Request, Response } from 'express';
import { performance } from 'perf_hooks';
import { structuredLogger } from '../config/logger';

export interface Metric {
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

export interface PerformanceData {
  requestCount: number;
  responseTime: {
    min: number;
    max: number;
    avg: number;
    p95: number;
    p99: number;
  };
  errorRate: number;
  memoryUsage: NodeJS.MemoryUsage;
  cpuUsage: NodeJS.CpuUsage;
}

export class APMService {
  private metrics: Metric[] = [];
  private requestTimes: number[] = [];
  private errorCount = 0;
  private totalRequests = 0;
  private startTime = Date.now();

  /**
   * Track request performance
   */
  trackRequest(req: Request, res: Response, next: any) {
    const startTime = performance.now();
    const startMemory = process.memoryUsage();
    const startCpu = process.cpuUsage();

    // Override res.end to capture response time
    const originalEnd = res.end;
    res.end = (...args: any[]) => {
      const endTime = performance.now();
      const responseTime = endTime - startTime;
      const endMemory = process.memoryUsage();
      const endCpu = process.cpuUsage(startCpu);

      // Update metrics
      this.requestTimes.push(responseTime);
      this.totalRequests++;
      
      if (res.statusCode >= 400) {
        this.errorCount++;
      }

      // Log performance data
      this.logPerformanceData(req, res, responseTime, endMemory, endCpu);

      // Track metrics
      this.trackMetric('response_time', responseTime, 'ms', {
        method: req.method,
        route: req.route?.path || req.path,
        status_code: res.statusCode.toString()
      });

      this.trackMetric('memory_usage_heap', endMemory.heapUsed, 'bytes', {
        method: req.method,
        route: req.route?.path || req.path
      });

      originalEnd.apply(res, args);
    };

    next();
  }

  /**
   * Track custom metric
   */
  trackMetric(name: string, value: number, unit: string, tags?: Record<string, string>) {
    const metric: Metric = {
      name,
      value,
      unit,
      timestamp: new Date(),
      tags
    };

    this.metrics.push(metric);

    // Keep only last 1000 metrics
    if (this.metrics.length > 1000) {
      this.metrics = this.metrics.slice(-1000);
    }

    // Log metric
    structuredLogger.system.apiRequest(
      'METRIC',
      name,
      200,
      value,
      undefined
    );
  }

  /**
   * Track database query performance
   */
  trackDatabaseQuery(query: string, duration: number) {
    this.trackMetric('db_query_time', duration, 'ms', {
      query_type: this.getQueryType(query),
      query_length: query.length.toString()
    });

    if (duration > 1000) {
      structuredLogger.performance.slowQuery(query, duration);
    }
  }

  /**
   * Track cache performance
   */
  trackCacheOperation(operation: string, duration: number, hit: boolean) {
    this.trackMetric('cache_operation_time', duration, 'ms', {
      operation,
      hit: hit.toString()
    });

    this.trackMetric('cache_hit_rate', hit ? 1 : 0, 'boolean', {
      operation
    });
  }

  /**
   * Track external API calls
   */
  trackExternalApi(service: string, endpoint: string, duration: number, statusCode: number) {
    this.trackMetric('external_api_time', duration, 'ms', {
      service,
      endpoint,
      status_code: statusCode.toString()
    });

    if (statusCode >= 400) {
      this.trackMetric('external_api_errors', 1, 'count', {
        service,
        endpoint,
        status_code: statusCode.toString()
      });
    }
  }

  /**
   * Get performance statistics
   */
  getPerformanceStats(): PerformanceData {
    const sortedTimes = [...this.requestTimes].sort((a, b) => a - b);
    const p95Index = Math.floor(sortedTimes.length * 0.95);
    const p99Index = Math.floor(sortedTimes.length * 0.99);

    return {
      requestCount: this.totalRequests,
      responseTime: {
        min: sortedTimes[0] || 0,
        max: sortedTimes[sortedTimes.length - 1] || 0,
        avg: this.requestTimes.reduce((a, b) => a + b, 0) / this.requestTimes.length || 0,
        p95: sortedTimes[p95Index] || 0,
        p99: sortedTimes[p99Index] || 0
      },
      errorRate: this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0,
      memoryUsage: process.memoryUsage(),
      cpuUsage: process.cpuUsage()
    };
  }

  /**
   * Get metrics by name
   */
  getMetrics(name?: string): Metric[] {
    if (name) {
      return this.metrics.filter(m => m.name === name);
    }
    return this.metrics;
  }

  /**
   * Get health check data
   */
  getHealthCheck(): any {
    const stats = this.getPerformanceStats();
    const uptime = Date.now() - this.startTime;

    return {
      status: 'healthy',
      uptime: `${Math.floor(uptime / 1000)}s`,
      performance: {
        requests_per_second: this.totalRequests / (uptime / 1000),
        avg_response_time: stats.responseTime.avg,
        error_rate: stats.errorRate,
        memory_usage: stats.memoryUsage
      },
      system: {
        node_version: process.version,
        platform: process.platform,
        arch: process.arch
      }
    };
  }

  /**
   * Generate performance report
   */
  generateReport(timeframe: 'hour' | 'day' | 'week' = 'hour'): any {
    const now = Date.now();
    const timeLimit = now - this.getTimeLimit(timeframe);
    
    const recentMetrics = this.metrics.filter(m => m.timestamp.getTime() > timeLimit);
    
    const responseTimes = recentMetrics
      .filter(m => m.name === 'response_time')
      .map(m => m.value);

    const errorMetrics = recentMetrics
      .filter(m => m.name === 'external_api_errors')
      .length;

    return {
      timeframe,
      generated_at: new Date().toISOString(),
      summary: {
        total_requests: this.totalRequests,
        total_errors: this.errorCount,
        error_rate: this.totalRequests > 0 ? (this.errorCount / this.totalRequests) * 100 : 0,
        avg_response_time: responseTimes.length > 0 
          ? responseTimes.reduce((a, b) => a + b, 0) / responseTimes.length 
          : 0,
        max_response_time: Math.max(...responseTimes, 0),
        min_response_time: Math.min(...responseTimes, 0)
      },
      metrics: {
        response_times: responseTimes,
        error_count: errorMetrics,
        memory_usage: process.memoryUsage()
      }
    };
  }

  /**
   * Log performance data
   */
  private logPerformanceData(req: Request, res: Response, responseTime: number, memory: NodeJS.MemoryUsage, cpu: NodeJS.CpuUsage) {
    structuredLogger.performance.slowApi(
      req.method,
      req.url,
      responseTime,
      req.requestId
    );

    structuredLogger.performance.memoryUsage(memory, req.requestId);

    // Log high error rates
    if (this.totalRequests > 0 && (this.errorCount / this.totalRequests) > 0.1) {
      structuredLogger.system.serviceError(
        'high_error_rate',
        new Error(`Error rate: ${(this.errorCount / this.totalRequests) * 100}%`),
        req.requestId
      );
    }
  }

  /**
   * Get query type from SQL query
   */
  private getQueryType(query: string): string {
    const trimmed = query.trim().toUpperCase();
    if (trimmed.startsWith('SELECT')) return 'SELECT';
    if (trimmed.startsWith('INSERT')) return 'INSERT';
    if (trimmed.startsWith('UPDATE')) return 'UPDATE';
    if (trimmed.startsWith('DELETE')) return 'DELETE';
    if (trimmed.startsWith('CREATE')) return 'CREATE';
    if (trimmed.startsWith('ALTER')) return 'ALTER';
    if (trimmed.startsWith('DROP')) return 'DROP';
    return 'OTHER';
  }

  /**
   * Get time limit for timeframe
   */
  private getTimeLimit(timeframe: string): number {
    const now = Date.now();
    switch (timeframe) {
      case 'hour': return now - (60 * 60 * 1000);
      case 'day': return now - (24 * 60 * 60 * 1000);
      case 'week': return now - (7 * 24 * 60 * 60 * 1000);
      default: return now - (60 * 60 * 1000);
    }
  }
}

// Export singleton instance
export const apmService = new APMService();