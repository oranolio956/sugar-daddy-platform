import { Router } from 'express';
import { PremiumService } from '../services/premiumService';
import { PremiumFeature } from '../models/PremiumFeature';
import { globalRateLimit, sensitiveOperationRateLimit } from '../middleware';

const router = Router();
const premiumService = new PremiumService();

/**
 * @route   GET /api/premium/features
 * @desc    Get available premium features
 * @access  Private
 */
router.get('/features',
  globalRateLimit,
  async (req, res) => {
    try {
      const features = await premiumService.getAvailableFeatures();

      res.status(200).json({
        success: true,
        data: features
      });
    } catch (error: any) {
      console.error('Get features error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get premium features'
      });
    }
  }
);

/**
 * @route   GET /api/premium/my-features
 * @desc    Get user's active premium features
 * @access  Private
 */
router.get('/my-features',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const features = await premiumService.getUserFeatures(userId);

      res.status(200).json({
        success: true,
        data: features
      });
    } catch (error: any) {
      console.error('Get user features error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get user premium features'
      });
    }
  }
);

/**
 * @route   POST /api/premium/activate
 * @desc    Activate premium feature
 * @access  Private
 */
router.post('/activate',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { featureType, settings, duration } = req.body;

      const result = await premiumService.activateFeature(userId, featureType, settings, duration);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Premium feature activated successfully'
      });
    } catch (error: any) {
      console.error('Activate feature error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to activate premium feature'
      });
    }
  }
);

/**
 * @route   PUT /api/premium/deactivate
 * @desc    Deactivate premium feature
 * @access  Private
 */
router.put('/deactivate',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { featureType } = req.body;

      const result = await premiumService.deactivateFeature(userId, featureType);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Premium feature deactivated successfully'
      });
    } catch (error: any) {
      console.error('Deactivate feature error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to deactivate premium feature'
      });
    }
  }
);

/**
 * @route   GET /api/premium/incognito/status
 * @desc    Get incognito mode status
 * @access  Private
 */
router.get('/incognito/status',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await premiumService.getIncognitoStatus(userId);

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('Get incognito status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get incognito status'
      });
    }
  }
);

/**
 * @route   POST /api/premium/profile-boost
 * @desc    Boost profile visibility
 * @access  Private
 */
router.post('/profile-boost',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { duration } = req.body;

      const result = await premiumService.boostProfile(userId, duration);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Profile boosted successfully'
      });
    } catch (error: any) {
      console.error('Boost profile error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to boost profile'
      });
    }
  }
);

/**
 * @route   GET /api/premium/travel-mode/status
 * @desc    Get travel mode status
 * @access  Private
 */
router.get('/travel-mode/status',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await premiumService.getTravelModeStatus(userId);

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('Get travel mode status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get travel mode status'
      });
    }
  }
);

/**
 * @route   POST /api/premium/travel-mode/activate
 * @desc    Activate travel mode
 * @access  Private
 */
router.post('/travel-mode/activate',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { location, radius, duration } = req.body;

      const result = await premiumService.activateTravelMode(userId, location, radius, duration);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Travel mode activated successfully'
      });
    } catch (error: any) {
      console.error('Activate travel mode error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to activate travel mode'
      });
    }
  }
);

/**
 * @route   POST /api/premium/travel-mode/deactivate
 * @desc    Deactivate travel mode
 * @access  Private
 */
router.post('/travel-mode/deactivate',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;

      const result = await premiumService.deactivateTravelMode(userId);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Travel mode deactivated successfully'
      });
    } catch (error: any) {
      console.error('Deactivate travel mode error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to deactivate travel mode'
      });
    }
  }
);

/**
 * @route   GET /api/premium/analytics
 * @desc    Get premium analytics
 * @access  Private
 */
router.get('/analytics',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { period = 'week' } = req.query;

      const analytics = await premiumService.getPremiumAnalytics(userId, period as string);

      res.status(200).json({
        success: true,
        data: analytics
      });
    } catch (error: any) {
      console.error('Get premium analytics error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get premium analytics'
      });
    }
  }
);

/**
 * @route   GET /api/premium/revenue
 * @desc    Get premium feature revenue stats (Admin only)
 * @access  Private
 */
router.get('/revenue',
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

      const revenue = await premiumService.getRevenueStats();

      res.status(200).json({
        success: true,
        data: revenue
      });
    } catch (error: any) {
      console.error('Get revenue stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get revenue stats'
      });
    }
  }
);

export default router;