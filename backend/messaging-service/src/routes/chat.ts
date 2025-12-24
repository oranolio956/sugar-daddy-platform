import { Router } from 'express';
import { ChatService } from '../services/chatService';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { globalRateLimit, sensitiveOperationRateLimit } from '../middleware';
import { Op } from 'sequelize';

const router = Router();
const chatService = new ChatService();

/**
 * @route   GET /api/chat/conversations
 * @desc    Get user's conversations
 * @access  Private
 */
router.get('/conversations',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { limit = 20, offset = 0, status = 'active' } = req.query;

      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ],
          status: status as string
        },
        include: [
          {
            model: require('../models/User').User,
            as: 'user1',
            attributes: ['id', 'username', 'role', 'lastActivityAt']
          },
          {
            model: require('../models/User').User,
            as: 'user2',
            attributes: ['id', 'username', 'role', 'lastActivityAt']
          },
          {
            model: Message,
            as: 'messages',
            limit: 1,
            order: [['createdAt', 'DESC']],
            where: { isDeleted: false }
          }
        ],
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        order: [['lastMessageAt', 'DESC']]
      });

      res.status(200).json({
        success: true,
        data: conversations
      });
    } catch (error: any) {
      console.error('Get conversations error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get conversations'
      });
    }
  }
);

/**
 * @route   GET /api/chat/conversations/:id
 * @desc    Get conversation by ID
 * @access  Private
 */
router.get('/conversations/:id',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      const conversation = await Conversation.findOne({
        where: {
          id,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        },
        include: [
          {
            model: require('../models/User').User,
            as: 'user1',
            attributes: ['id', 'username', 'role', 'lastActivityAt']
          },
          {
            model: require('../models/User').User,
            as: 'user2',
            attributes: ['id', 'username', 'role', 'lastActivityAt']
          }
        ]
      });

      if (!conversation) {
        return res.status(404).json({
          success: false,
          message: 'Conversation not found'
        });
      }

      res.status(200).json({
        success: true,
        data: conversation
      });
    } catch (error: any) {
      console.error('Get conversation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get conversation'
      });
    }
  }
);

/**
 * @route   POST /api/chat/conversations
 * @desc    Create new conversation
 * @access  Private
 */
router.post('/conversations',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { receiverId } = req.body;

      if (userId === receiverId) {
        return res.status(400).json({
          success: false,
          message: 'Cannot create conversation with yourself'
        });
      }

      const conversation = await chatService.createConversation(userId, receiverId);

      res.status(201).json({
        success: true,
        data: conversation,
        message: 'Conversation created successfully'
      });
    } catch (error: any) {
      console.error('Create conversation error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to create conversation'
      });
    }
  }
);

/**
 * @route   POST /api/chat/messages
 * @desc    Send message
 * @access  Private
 */
router.post('/messages',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const senderId = req.user.id;
      const { conversationId, content, messageType = 'text', mediaData, metadata } = req.body;

      const message = await chatService.sendMessage(senderId, conversationId, {
        content,
        messageType,
        mediaData,
        metadata
      });

      res.status(201).json({
        success: true,
        data: message,
        message: 'Message sent successfully'
      });
    } catch (error: any) {
      console.error('Send message error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to send message'
      });
    }
  }
);

/**
 * @route   GET /api/chat/messages/:conversationId
 * @desc    Get conversation messages
 * @access  Private
 */
router.get('/messages/:conversationId',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { conversationId } = req.params;
      const { limit = 50, offset = 0, before, after } = req.query;

      const messages = await chatService.getMessages(userId, conversationId, {
        limit: parseInt(limit as string),
        offset: parseInt(offset as string),
        before: before ? new Date(before as string) : undefined,
        after: after ? new Date(after as string) : undefined
      });

      res.status(200).json({
        success: true,
        data: messages
      });
    } catch (error: any) {
      console.error('Get messages error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get messages'
      });
    }
  }
);

/**
 * @route   PUT /api/chat/messages/:id/read
 * @desc    Mark message as read
 * @access  Private
 */
router.put('/messages/:id/read',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await chatService.markMessageAsRead(userId, id);

      res.status(200).json({
        success: true,
        message: 'Message marked as read'
      });
    } catch (error: any) {
      console.error('Mark message as read error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to mark message as read'
      });
    }
  }
);

/**
 * @route   PUT /api/chat/conversations/:id/typing
 * @desc    Update typing status
 * @access  Private
 */
router.put('/conversations/:id/typing',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;
      const { isTyping } = req.body;

      await chatService.updateTypingStatus(userId, id, isTyping);

      res.status(200).json({
        success: true,
        message: 'Typing status updated'
      });
    } catch (error: any) {
      console.error('Update typing status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to update typing status'
      });
    }
  }
);

/**
 * @route   DELETE /api/chat/messages/:id
 * @desc    Delete message
 * @access  Private
 */
router.delete('/messages/:id',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { id } = req.params;

      await chatService.deleteMessage(userId, id);

      res.status(200).json({
        success: true,
        message: 'Message deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete message error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete message'
      });
    }
  }
);

/**
 * @route   GET /api/chat/unread-count
 * @desc    Get unread message count
 * @access  Private
 */
router.get('/unread-count',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const count = await chatService.getUnreadCount(userId);

      res.status(200).json({
        success: true,
        data: { unreadCount: count }
      });
    } catch (error: any) {
      console.error('Get unread count error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get unread count'
      });
    }
  }
);

export default router;