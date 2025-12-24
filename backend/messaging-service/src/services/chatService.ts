import { User } from '../models/User';
import { Conversation } from '../models/Conversation';
import { Message } from '../models/Message';
import { Op } from 'sequelize';

export class ChatService {
  /**
   * Create new conversation
   */
  async createConversation(user1Id: string, user2Id: string): Promise<Conversation> {
    try {
      // Check if conversation already exists
      const existingConversation = await Conversation.findOne({
        where: {
          [Op.or]: [
            { user1Id, user2Id },
            { user1Id: user2Id, user2Id: user1Id }
          ]
        }
      });

      if (existingConversation) {
        // Reactivate if archived
        if (existingConversation.status === 'archived') {
          await existingConversation.update({ status: 'active' });
        }
        return existingConversation;
      }

      // Create new conversation
      const conversation = await Conversation.create({
        user1Id,
        user2Id,
        status: 'active'
      });

      return conversation;
    } catch (error) {
      console.error('Create conversation error:', error);
      throw error;
    }
  }

  /**
   * Send message
   */
  async sendMessage(
    senderId: string,
    conversationId: string,
    messageData: {
      content: string;
      messageType?: 'text' | 'image' | 'video' | 'gift' | 'audio' | 'sticker';
      mediaData?: any;
      metadata?: any;
    }
  ): Promise<Message> {
    try {
      // Validate conversation exists and user is participant
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: senderId },
            { user2Id: senderId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      // Determine receiver
      const receiverId = conversation.user1Id === senderId 
        ? conversation.user2Id 
        : conversation.user1Id;

      // Create message
      const message = await Message.create({
        conversationId,
        senderId,
        receiverId,
        content: messageData.content,
        messageType: messageData.messageType || 'text',
        mediaData: messageData.mediaData,
        metadata: messageData.metadata
      });

      // Update conversation stats
      await conversation.update({
        lastMessageAt: new Date(),
        lastMessageId: message.id
      });

      // Update message stats for both users
      const stats = conversation.messageStats;
      stats[senderId === conversation.user1Id ? 'user1' : 'user2'].readCount += 1;
      stats[receiverId === conversation.user1Id ? 'user1' : 'user2'].unreadCount += 1;

      await conversation.update({ messageStats: stats });

      // Send real-time notification (would integrate with WebSocket service)
      // await this.sendRealTimeNotification(receiverId, message);

      return message;
    } catch (error) {
      console.error('Send message error:', error);
      throw error;
    }
  }

  /**
   * Get conversation messages
   */
  async getMessages(
    userId: string,
    conversationId: string,
    options: {
      limit?: number;
      offset?: number;
      before?: Date;
      after?: Date;
    } = {}
  ): Promise<Message[]> {
    try {
      // Validate conversation access
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      // Build query options
      const queryOptions: any = {
        where: {
          conversationId,
          isDeleted: false
        },
        order: [['createdAt', 'DESC']],
        limit: options.limit || 50,
        offset: options.offset || 0
      };

      if (options.before) {
        queryOptions.where.createdAt = { [Op.lt]: options.before };
      }

      if (options.after) {
        queryOptions.where.createdAt = { [Op.gt]: options.after };
      }

      const messages = await Message.findAll(queryOptions);

      // Mark messages as delivered
      await Message.update(
        { isDelivered: true, deliveredAt: new Date() },
        {
          where: {
            conversationId,
            receiverId: userId,
            isDelivered: false
          }
        }
      );

      return messages;
    } catch (error) {
      console.error('Get messages error:', error);
      throw error;
    }
  }

  /**
   * Mark message as read
   */
  async markMessageAsRead(userId: string, messageId: string): Promise<void> {
    try {
      const message = await Message.findOne({
        where: { id: messageId, receiverId: userId }
      });

      if (!message) {
        throw new Error('Message not found or access denied');
      }

      if (!message.isRead) {
        await message.update({
          isRead: true,
          readAt: new Date()
        });

        // Update conversation stats
        const conversation = await Conversation.findByPk(message.conversationId);
        if (conversation) {
          const stats = conversation.messageStats;
          const receiverKey = userId === conversation.user1Id ? 'user1' : 'user2';
          stats[receiverKey].unreadCount = Math.max(0, stats[receiverKey].unreadCount - 1);
          stats[receiverKey].readCount += 1;

          await conversation.update({ messageStats: stats });
        }
      }
    } catch (error) {
      console.error('Mark message as read error:', error);
      throw error;
    }
  }

  /**
   * Update typing status
   */
  async updateTypingStatus(userId: string, conversationId: string, isTyping: boolean): Promise<void> {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      const updateData: any = {};
      if (userId === conversation.user1Id) {
        updateData.isTypingUser1 = isTyping;
      } else {
        updateData.isTypingUser2 = isTyping;
      }

      await conversation.update(updateData);

      // Send typing notification to other user (would integrate with WebSocket service)
      // await this.sendTypingNotification(conversation, userId, isTyping);
    } catch (error) {
      console.error('Update typing status error:', error);
      throw error;
    }
  }

  /**
   * Delete message
   */
  async deleteMessage(userId: string, messageId: string): Promise<void> {
    try {
      const message = await Message.findOne({
        where: { id: messageId, senderId: userId }
      });

      if (!message) {
        throw new Error('Message not found or access denied');
      }

      await message.update({ isDeleted: true });

      // Send deletion notification (would integrate with WebSocket service)
      // await this.sendDeletionNotification(message);
    } catch (error) {
      console.error('Delete message error:', error);
      throw error;
    }
  }

  /**
   * Get unread message count
   */
  async getUnreadCount(userId: string): Promise<number> {
    try {
      const conversations = await Conversation.findAll({
        where: {
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      let totalCount = 0;
      conversations.forEach(conversation => {
        const stats = conversation.messageStats;
        const userKey = userId === conversation.user1Id ? 'user1' : 'user2';
        totalCount += stats[userKey].unreadCount;
      });

      return totalCount;
    } catch (error) {
      console.error('Get unread count error:', error);
      throw error;
    }
  }

  /**
   * Search messages in conversation
   */
  async searchMessages(
    userId: string,
    conversationId: string,
    query: string,
    options: {
      limit?: number;
      offset?: number;
    } = {}
  ): Promise<Message[]> {
    try {
      // Validate conversation access
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      const messages = await Message.findAll({
        where: {
          conversationId,
          isDeleted: false,
          content: { [Op.iLike]: `%${query}%` }
        },
        order: [['createdAt', 'DESC']],
        limit: options.limit || 20,
        offset: options.offset || 0
      });

      return messages;
    } catch (error) {
      console.error('Search messages error:', error);
      throw error;
    }
  }

  /**
   * Get conversation statistics
   */
  async getConversationStats(userId: string, conversationId: string): Promise<any> {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      const messageCount = await Message.count({
        where: {
          conversationId,
          isDeleted: false
        }
      });

      const lastMessage = await Message.findOne({
        where: {
          conversationId,
          isDeleted: false
        },
        order: [['createdAt', 'DESC']]
      });

      return {
        conversationId: conversation.id,
        messageCount,
        lastMessageAt: lastMessage?.createdAt,
        stats: conversation.messageStats,
        typingStatus: {
          user1Typing: conversation.isTypingUser1,
          user2Typing: conversation.isTypingUser2
        }
      };
    } catch (error) {
      console.error('Get conversation stats error:', error);
      throw error;
    }
  }

  /**
   * Archive conversation
   */
  async archiveConversation(userId: string, conversationId: string): Promise<void> {
    try {
      const conversation = await Conversation.findOne({
        where: {
          id: conversationId,
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ]
        }
      });

      if (!conversation) {
        throw new Error('Conversation not found or access denied');
      }

      await conversation.update({ status: 'archived' });
    } catch (error) {
      console.error('Archive conversation error:', error);
      throw error;
    }
  }

  /**
   * Send real-time notification (placeholder for WebSocket integration)
   */
  private async sendRealTimeNotification(receiverId: string, message: Message) {
    try {
      // This would integrate with WebSocket service
      console.log(`Real-time notification: Message ${message.id} sent to user ${receiverId}`);
    } catch (error) {
      console.error('Send real-time notification error:', error);
    }
  }

  /**
   * Send typing notification (placeholder for WebSocket integration)
   */
  private async sendTypingNotification(conversation: Conversation, userId: string, isTyping: boolean) {
    try {
      const receiverId = conversation.user1Id === userId ? conversation.user2Id : conversation.user1Id;
      console.log(`Typing notification: User ${userId} is ${isTyping ? 'typing' : 'not typing'} to user ${receiverId}`);
    } catch (error) {
      console.error('Send typing notification error:', error);
    }
  }

  /**
   * Send deletion notification (placeholder for WebSocket integration)
   */
  private async sendDeletionNotification(message: Message) {
    try {
      console.log(`Deletion notification: Message ${message.id} deleted by user ${message.senderId}`);
    } catch (error) {
      console.error('Send deletion notification error:', error);
    }
  }
}