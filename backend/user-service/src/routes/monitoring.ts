import { Router } from 'express';
import { apmService } from '../services/apmService';
import { errorTrackingService } from '../services/errorTrackingService';
import { analyticsService } from '../services/analyticsService';
import { structuredLogger } from '../config/logger';
import { globalRateLimit } from '../middleware';

const router = Router();

/**
 * @route   GET /api/monitoring/health
 * @desc    Get system health check
 * @access  Public
 */
router.get('/health',
  globalRateLimit,
  async (req, res) => {
    try {
      const healthCheck = apmService.getHealthCheck();

      res.status(200).json({
        success: true,
        data: healthCheck
      });
    } catch (error: any) {
      console.error('Health check error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Health check failed'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/metrics
 * @desc    Get performance metrics
 * @access  Private (Admin only)
 */
router.get('/metrics',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const metrics = apmService.getPerformanceStats();

      res.status(200).json({
        success: true,
        data: metrics
      });
    } catch (error: any) {
      console.error('Get metrics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get metrics'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/errors
 * @desc    Get error reports
 * @access  Private (Admin only)
 */
router.get('/errors',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const { severity, limit = 50 } = req.query;
      const errorReports = errorTrackingService.getErrorReports(severity as string, parseInt(limit as string));

      res.status(200).json({
        success: true,
        data: errorReports
      });
    } catch (error: any) {
      console.error('Get errors error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get error reports'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/error-stats
 * @desc    Get error statistics
 * @access  Private (Admin only)
 */
router.get('/error-stats',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const stats = errorTrackingService.getErrorStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get error stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get error statistics'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/platform-analytics
 * @desc    Get platform analytics
 * @access  Private (Admin only)
 */
router.get('/platform-analytics',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const analytics = await analyticsService.getPlatformAnalytics();

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Get platform analytics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get platform analytics'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/revenue-analytics
 * @desc    Get revenue analytics
 * @access  Private (Admin only)
 */
router.get('/revenue-analytics',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const analytics = await analyticsService.getRevenueAnalytics();

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Get revenue analytics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get revenue analytics'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/support-analytics
 * @desc    Get support analytics
 * @access  Private (Admin only)
 */
router.get('/support-analytics',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const analytics = await analyticsService.getSupportAnalytics();

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Get support analytics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get support analytics'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/report
 * @desc    Generate comprehensive report
 * @access  Private (Admin only)
 */
router.get('/report',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const { timeframe = 'daily' } = req.query;
      const report = await analyticsService.generateReport(timeframe as string);

      res.status(200).json({
        success: true,
        data: report
      });
    } catch (error: any) {
      console.error('Generate report error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to generate report'
      });
    }
  }
);

/**
 * @route   POST /api/monitoring/test-alert
 * @desc    Test alert system
 * @access  Private (Admin only)
 */
router.post('/test-alert',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      const { ruleId } = req.body;
      
      if (!ruleId) {
        return res.status(400).json({
          success: false,
          message: 'Rule ID is required'
        });
      }

      const result = errorTrackingService.testAlertRule(ruleId);

      res.status(200).json({
        success: true,
        data: { triggered: result },
        message: result ? 'Alert triggered successfully' : 'Alert not triggered'
      });
    } catch (error: any) {
      console.error('Test alert error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to test alert'
      });
    }
  }
);

/**
 * @route   GET /api/monitoring/logs
 * @desc    Get recent logs (simplified)
 * @access  Private (Admin only)
 */
router.get('/logs',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      
      // Check if user is admin
      const user = await require('../models/User').User.findByPk(userId);
      if (user?.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Access denied'
        });
      }

      // This would integrate with actual log aggregation system
      // For now, return a placeholder
      const logs = [
        {
          timestamp: new Date().toISOString(),
          level: 'info',
          message: 'System health check passed',
          source: 'monitoring'
        },
        {
          timestamp: new Date().toISOString(),
          level: 'warn',
          message: 'High memory usage detected',
          source: 'performance'
        }
      ];

      res.status(200).json({
        success: true,
        data: logs
      });
    } catch (error: any) {
      console.error('Get logs error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get logs'
      });
    }
  }
);

export default router;