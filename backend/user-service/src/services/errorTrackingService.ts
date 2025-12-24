import { Request, Response, NextFunction } from 'express';
import { structuredLogger } from '../config/logger';

export interface ErrorReport {
  id: string;
  timestamp: Date;
  error: {
    name: string;
    message: string;
    stack?: string;
    code?: string;
  };
  context: {
    userId?: string;
    requestId?: string;
    userAgent?: string;
    ip?: string;
    url?: string;
    method?: string;
  };
  severity: 'low' | 'medium' | 'high' | 'critical';
  count: number;
  firstSeen: Date;
  lastSeen: Date;
}

export interface AlertRule {
  id: string;
  name: string;
  condition: string;
  threshold: number;
  timeWindow: number; // in milliseconds
  severity: 'warning' | 'error' | 'critical';
  enabled: boolean;
  notificationChannels: string[];
}

export class ErrorTrackingService {
  private errorReports: Map<string, ErrorReport> = new Map();
  private alertRules: AlertRule[] = [];
  private errorCounts: Map<string, number> = new Map();
  private lastAlertTime: Map<string, number> = new Map();

  constructor() {
    this.initializeAlertRules();
  }

  /**
   * Error tracking middleware
   */
  trackErrors = (err: Error, req: Request, res: Response, next: NextFunction) => {
    // Generate error ID
    const errorId = this.generateErrorId(err);
    
    // Create error report
    const errorReport: ErrorReport = {
      id: errorId,
      timestamp: new Date(),
      error: {
        name: err.name,
        message: err.message,
        stack: err.stack,
        code: (err as any).code
      },
      context: {
        userId: req.user?.id,
        requestId: req.requestId,
        userAgent: req.get('User-Agent'),
        ip: req.ip,
        url: req.url,
        method: req.method
      },
      severity: this.calculateSeverity(err),
      count: 1,
      firstSeen: new Date(),
      lastSeen: new Date()
    };

    // Update or create error report
    if (this.errorReports.has(errorId)) {
      const existingReport = this.errorReports.get(errorId)!;
      existingReport.count++;
      existingReport.lastSeen = new Date();
      this.errorReports.set(errorId, existingReport);
    } else {
      this.errorReports.set(errorId, errorReport);
    }

    // Log error
    structuredLogger.system.serviceError('user-service', err, req.requestId);

    // Check alert rules
    this.checkAlertRules(errorReport);

    next(err);
  };

  /**
   * Get error reports
   */
  getErrorReports(severity?: string, limit: number = 50): ErrorReport[] {
    let reports = Array.from(this.errorReports.values());
    
    if (severity) {
      reports = reports.filter(r => r.severity === severity);
    }
    
    return reports
      .sort((a, b) => b.lastSeen.getTime() - a.lastSeen.getTime())
      .slice(0, limit);
  }

  /**
   * Get error statistics
   */
  getErrorStats(): any {
    const totalErrors = this.errorReports.size;
    const errorCounts = {
      low: 0,
      medium: 0,
      high: 0,
      critical: 0
    };

    this.errorReports.forEach(report => {
      errorCounts[report.severity]++;
    });

    const recentErrors = Array.from(this.errorReports.values())
      .filter(r => r.lastSeen.getTime() > Date.now() - (60 * 60 * 1000)) // Last hour
      .length;

    return {
      total: totalErrors,
      bySeverity: errorCounts,
      recent: recentErrors,
      topErrors: this.getTopErrors(10)
    };
  }

  /**
   * Get top errors by count
   */
  getTopErrors(limit: number = 10): ErrorReport[] {
    return Array.from(this.errorReports.values())
      .sort((a, b) => b.count - a.count)
      .slice(0, limit);
  }

  /**
   * Clear error reports
   */
  clearErrorReports(): void {
    this.errorReports.clear();
    this.errorCounts.clear();
  }

  /**
   * Add alert rule
   */
  addAlertRule(rule: AlertRule): void {
    this.alertRules.push(rule);
  }

  /**
   * Remove alert rule
   */
  removeAlertRule(ruleId: string): void {
    this.alertRules = this.alertRules.filter(r => r.id !== ruleId);
  }

  /**
   * Get alert rules
   */
  getAlertRules(): AlertRule[] {
    return this.alertRules;
  }

  /**
   * Test alert rule
   */
  testAlertRule(ruleId: string): boolean {
    const rule = this.alertRules.find(r => r.id === ruleId);
    if (!rule) return false;

    return this.evaluateCondition(rule.condition, rule.threshold, rule.timeWindow);
  }

  /**
   * Send alert notification
   */
  sendAlert(alert: any): void {
    // Log alert
    console.error('ALERT:', alert);

    // Send to notification channels (email, Slack, etc.)
    // This would integrate with actual notification services
    if (alert.severity === 'critical') {
      console.error('CRITICAL ALERT:', alert.message);
    }
  }

  /**
   * Generate error ID
   */
  private generateErrorId(err: Error): string {
    const errorString = `${err.name}:${err.message}:${err.stack?.split('\n')[1] || ''}`;
    return this.hashString(errorString);
  }

  /**
   * Calculate error severity
   */
  private calculateSeverity(err: Error): 'low' | 'medium' | 'high' | 'critical' {
    const message = err.message.toLowerCase();
    const name = err.name.toLowerCase();

    if (name.includes('critical') || message.includes('critical')) {
      return 'critical';
    }
    if (name.includes('error') || message.includes('error')) {
      return 'high';
    }
    if (name.includes('warning') || message.includes('warning')) {
      return 'medium';
    }
    return 'low';
  }

  /**
   * Initialize default alert rules
   */
  private initializeAlertRules(): void {
    this.alertRules = [
      {
        id: 'high_error_rate',
        name: 'High Error Rate',
        condition: 'error_rate > 10',
        threshold: 10,
        timeWindow: 5 * 60 * 1000, // 5 minutes
        severity: 'error',
        enabled: true,
        notificationChannels: ['email', 'slack']
      },
      {
        id: 'critical_errors',
        name: 'Critical Errors',
        condition: 'critical_errors > 5',
        threshold: 5,
        timeWindow: 10 * 60 * 1000, // 10 minutes
        severity: 'critical',
        enabled: true,
        notificationChannels: ['email', 'slack', 'sms']
      },
      {
        id: 'slow_responses',
        name: 'Slow API Responses',
        condition: 'avg_response_time > 5000',
        threshold: 5000,
        timeWindow: 5 * 60 * 1000, // 5 minutes
        severity: 'warning',
        enabled: true,
        notificationChannels: ['email']
      }
    ];
  }

  /**
   * Check alert rules against current error data
   */
  private checkAlertRules(errorReport: ErrorReport): void {
    this.alertRules.forEach(rule => {
      if (!rule.enabled) return;

      const now = Date.now();
      const timeWindowStart = now - rule.timeWindow;

      // Count errors in time window
      const errorsInWindow = Array.from(this.errorReports.values())
        .filter(r => r.timestamp.getTime() > timeWindowStart);

      const errorRate = errorsInWindow.length / (rule.timeWindow / 60000); // errors per minute

      // Check conditions
      let shouldAlert = false;

      switch (rule.condition) {
        case 'error_rate > threshold':
          shouldAlert = errorRate > rule.threshold;
          break;
        case 'critical_errors > threshold':
          const criticalErrors = errorsInWindow.filter(e => e.severity === 'critical').length;
          shouldAlert = criticalErrors > rule.threshold;
          break;
        case 'total_errors > threshold':
          shouldAlert = errorsInWindow.length > rule.threshold;
          break;
      }

      if (shouldAlert) {
        this.triggerAlert(rule, errorReport, errorRate);
      }
    });
  }

  /**
   * Trigger alert
   */
  private triggerAlert(rule: AlertRule, errorReport: ErrorReport, errorRate: number): void {
    const now = Date.now();
    const lastAlert = this.lastAlertTime.get(rule.id);

    // Rate limiting: don't send same alert more than once per 5 minutes
    if (lastAlert && now - lastAlert < 5 * 60 * 1000) {
      return;
    }

    this.lastAlertTime.set(rule.id, now);

    const alert = {
      ruleId: rule.id,
      ruleName: rule.name,
      severity: rule.severity,
      message: `Alert triggered: ${rule.name}`,
      errorReport,
      errorRate,
      timestamp: new Date()
    };

    this.sendAlert(alert);
  }

  /**
   * Evaluate condition
   */
  private evaluateCondition(condition: string, threshold: number, timeWindow: number): boolean {
    const errorsInWindow = Array.from(this.errorReports.values())
      .filter(r => r.timestamp.getTime() > Date.now() - timeWindow);

    switch (condition) {
      case 'error_rate > threshold':
        const errorRate = errorsInWindow.length / (timeWindow / 60000);
        return errorRate > threshold;
      case 'critical_errors > threshold':
        const criticalErrors = errorsInWindow.filter(e => e.severity === 'critical').length;
        return criticalErrors > threshold;
      default:
        return false;
    }
  }

  /**
   * Simple string hash function
   */
  private hashString(str: string): string {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Export singleton instance
export const errorTrackingService = new ErrorTrackingService();