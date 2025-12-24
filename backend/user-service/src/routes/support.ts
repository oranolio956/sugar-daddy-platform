import { Router } from 'express';
import { SupportService } from '../services/supportService';
import { Ticket } from '../models/Ticket';
import { globalRateLimit, sensitiveOperationRateLimit } from '../middleware';

const router = Router();
const supportService = new SupportService();

/**
 * @route   POST /api/support/tickets
 * @desc    Create support ticket
 * @access  Private
 */
router.post('/tickets',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const ticketData = req.body;

      const ticket = await supportService.createTicket(userId, ticketData);

      res.status(201).json({
        success: true,
        data: ticket,
        message: 'Support ticket created successfully'
      });
    } catch (error: any) {
      console.error('Create ticket error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create support ticket'
      });
    }
  }
);

/**
 * @route   GET /api/support/tickets
 * @desc    Get user's support tickets
 * @access  Private
 */
router.get('/tickets',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0, status, category } = req.query;

      const tickets = await supportService.getUserTickets(userId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        status: status as string,
        category: category as string
      });

      res.status(200).json({
        success: true,
        data: tickets
      });
    } catch (error: any) {
      console.error('Get tickets error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get support tickets'
      });
    }
  }
);

/**
 * @route   GET /api/support/tickets/:id
 * @desc    Get ticket by ID
 * @access  Private
 */
router.get('/tickets/:id',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const ticket = await supportService.getTicket(userId, id);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        success: true,
        data: ticket
      });
    } catch (error: any) {
      console.error('Get ticket error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get support ticket'
      });
    }
  }
);

/**
 * @route   PUT /api/support/tickets/:id
 * @desc    Update ticket
 * @access  Private
 */
router.put('/tickets/:id',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const updateData = req.body;

      const ticket = await supportService.updateTicket(userId, id, updateData);

      if (!ticket) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        success: true,
        data: ticket,
        message: 'Ticket updated successfully'
      });
    } catch (error: any) {
      console.error('Update ticket error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update support ticket'
      });
    }
  }
);

/**
 * @route   DELETE /api/support/tickets/:id
 * @desc    Delete ticket
 * @access  Private
 */
router.delete('/tickets/:id',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const result = await supportService.deleteTicket(userId, id);

      if (!result) {
        return res.status(404).json({
          success: false,
          message: 'Ticket not found'
        });
      }

      res.status(200).json({
        success: true,
        message: 'Ticket deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete ticket error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete support ticket'
      });
    }
  }
);

/**
 * @route   GET /api/support/categories
 * @desc    Get support categories
 * @access  Public
 */
router.get('/categories',
  globalRateLimit,
  async (req, res) => {
    try {
      const categories = await supportService.getCategories();

      res.status(200).json({
        success: true,
        data: categories
      });
    } catch (error: any) {
      console.error('Get categories error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get support categories'
      });
    }
  }
);

/**
 * @route   GET /api/support/stats
 * @desc    Get support statistics
 * @access  Private (Admin only)
 */
router.get('/stats',
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

      const stats = await supportService.getStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get support statistics'
      });
    }
  }
);

/**
 * @route   GET /api/support/agents
 * @desc    Get support agents
 * @access  Private (Admin only)
 */
router.get('/agents',
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

      const agents = await supportService.getAgents();

      res.status(200).json({
        success: true,
        data: agents
      });
    } catch (error: any) {
      console.error('Get agents error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get support agents'
      });
    }
  }
);

export default router;