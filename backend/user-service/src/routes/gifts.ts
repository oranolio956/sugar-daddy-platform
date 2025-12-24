import { Router } from 'express';
import { GiftService } from '../services/giftService';
import { VirtualCurrency } from '../models/VirtualCurrency';
import { Gift } from '../models/Gift';
import { globalRateLimit, sensitiveOperationRateLimit } from '../middleware';

const router = Router();
const giftService = new GiftService();

/**
 * @route   GET /api/gifts/catalog
 * @desc    Get available gifts for purchase
 * @access  Private
 */
router.get('/catalog',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const catalog = await giftService.getGiftCatalog(userId);

      res.status(200).json({
        success: true,
        data: catalog
      });
    } catch (error: any) {
      console.error('Gift catalog error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get gift catalog'
      });
    }
  }
);

/**
 * @route   GET /api/gifts/balance
 * @desc    Get user's virtual currency balance
 * @access  Private
 */
router.get('/balance',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const balance = await giftService.getBalance(userId);

      res.status(200).json({
        success: true,
        data: balance
      });
    } catch (error: any) {
      console.error('Get balance error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get balance'
      });
    }
  }
);

/**
 * @route   POST /api/gifts/purchase
 * @desc    Purchase virtual currency
 * @access  Private
 */
router.post('/purchase',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { amount, paymentMethod } = req.body;

      const result = await giftService.purchaseCurrency(userId, amount, paymentMethod);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Virtual currency purchased successfully'
      });
    } catch (error: any) {
      console.error('Purchase currency error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to purchase currency'
      });
    }
  }
);

/**
 * @route   POST /api/gifts/send
 * @desc    Send gift to another user
 * @access  Private
 */
router.post('/send',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const senderId = req.user.id;
      const { receiverId, giftId, customMessage } = req.body;

      const result = await giftService.sendGift(senderId, receiverId, giftId, customMessage);

      res.status(200).json({
        success: true,
        data: result,
        message: 'Gift sent successfully'
      });
    } catch (error: any) {
      console.error('Send gift error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to send gift'
      });
    }
  }
);

/**
 * @route   GET /api/gifts/sent
 * @desc    Get user's sent gifts
 * @access  Private
 */
router.get('/sent',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const sentGifts = await Gift.findAll({
        where: { senderId: userId },
        include: [{
          model: require('../models/User').User,
          as: 'receiver',
          attributes: ['id', 'username', 'role']
        }],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: sentGifts
      });
    } catch (error: any) {
      console.error('Get sent gifts error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get sent gifts'
      });
    }
  }
);

/**
 * @route   GET /api/gifts/received
 * @desc    Get user's received gifts
 * @access  Private
 */
router.get('/received',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0 } = req.query;

      const receivedGifts = await Gift.findAll({
        where: { receiverId: userId },
        include: [{
          model: require('../models/User').User,
          as: 'sender',
          attributes: ['id', 'username', 'role']
        }],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        order: [['createdAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: receivedGifts
      });
    } catch (error: any) {
      console.error('Get received gifts error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get received gifts'
      });
    }
  }
);

/**
 * @route   PUT /api/gifts/:id/mark-read
 * @desc    Mark gift as read
 * @access  Private
 */
router.put('/:id/mark-read',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const gift = await Gift.findOne({
        where: { id, receiverId: userId }
      });

      if (!gift) {
        return res.status(404).json({
          success: false,
          message: 'Gift not found'
        });
      }

      await gift.update({
        isRead: true,
        readAt: new Date()
      });

      res.status(200).json({
        success: true,
        message: 'Gift marked as read'
      });
    } catch (error: any) {
      console.error('Mark gift as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark gift as read'
      });
    }
  }
);

/**
 * @route   GET /api/gifts/stats
 * @desc    Get user's gift statistics
 * @access  Private
 */
router.get('/stats',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const stats = await giftService.getGiftStats(userId);

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get gift stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get gift stats'
      });
    }
  }
);

export default router;