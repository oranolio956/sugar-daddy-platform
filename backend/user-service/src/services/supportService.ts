import { User } from '../models/User';
import { Ticket } from '../models/Ticket';
import { Op } from 'sequelize';

export class SupportService {
  /**
   * Create support ticket
   */
  async createTicket(userId: string, ticketData: any): Promise<Ticket> {
    try {
      // Validate user exists
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Validate required fields
      if (!ticketData.subject || !ticketData.description || !ticketData.category) {
        throw new Error('Subject, description, and category are required');
      }

      // Validate category
      const validCategories = ['general', 'billing', 'technical', 'account', 'security', 'verification'];
      if (!validCategories.includes(ticketData.category)) {
        throw new Error('Invalid category');
      }

      // Validate priority
      const validPriorities = ['low', 'medium', 'high', 'urgent'];
      if (ticketData.priority && !validPriorities.includes(ticketData.priority)) {
        throw new Error('Invalid priority');
      }

      // Create ticket
      const ticket = await Ticket.create({
        userId,
        subject: ticketData.subject,
        description: ticketData.description,
        category: ticketData.category,
        priority: ticketData.priority || 'medium',
        status: 'open',
        metadata: ticketData.metadata || {}
      });

      // Send notification to support team
      await this.notifySupportTeam(ticket);

      return ticket;
    } catch (error) {
      console.error('Create ticket error:', error);
      throw error;
    }
  }

  /**
   * Get user's support tickets
   */
  async getUserTickets(userId: string, options: any = {}): Promise<Ticket[]> {
    try {
      const queryOptions: any = {
        where: { userId },
        include: [{
          model: User,
          as: 'agent',
          attributes: ['id', 'username']
        }],
        order: [['createdAt', 'DESC']]
      };

      if (options.limit) {
        queryOptions.limit = options.limit;
      }

      if (options.offset) {
        queryOptions.offset = options.offset;
      }

      if (options.status) {
        queryOptions.where.status = options.status;
      }

      if (options.category) {
        queryOptions.where.category = options.category;
      }

      const tickets = await Ticket.findAll(queryOptions);
      return tickets;
    } catch (error) {
      console.error('Get user tickets error:', error);
      throw error;
    }
  }

  /**
   * Get ticket by ID
   */
  async getTicket(userId: string, ticketId: string): Promise<Ticket | null> {
    try {
      const ticket = await Ticket.findOne({
        where: {
          id: ticketId,
          [Op.or]: [
            { userId },
            { assignedTo: userId }
          ]
        },
        include: [
          {
            model: User,
            as: 'user',
            attributes: ['id', 'username', 'email']
          },
          {
            model: User,
            as: 'agent',
            attributes: ['id', 'username', 'email']
          }
        ]
      });

      return ticket;
    } catch (error) {
      console.error('Get ticket error:', error);
      throw error;
    }
  }

  /**
   * Update ticket
   */
  async updateTicket(userId: string, ticketId: string, updateData: any): Promise<Ticket | null> {
    try {
      const ticket = await Ticket.findOne({
        where: {
          id: ticketId,
          [Op.or]: [
            { userId },
            { assignedTo: userId }
          ]
        }
      });

      if (!ticket) {
        return null;
      }

      // Validate status transitions
      if (updateData.status) {
        const validStatusTransitions = {
          'open': ['in_progress', 'resolved', 'closed'],
          'in_progress': ['resolved', 'closed'],
          'resolved': ['closed'],
          'closed': []
        };

        const currentStatus = ticket.status;
        const newStatus = updateData.status;

        if (!validStatusTransitions[currentStatus].includes(newStatus)) {
          throw new Error(`Invalid status transition from ${currentStatus} to ${newStatus}`);
        }

        // Set resolvedAt or closedAt timestamps
        if (newStatus === 'resolved' && !ticket.resolvedAt) {
          updateData.resolvedAt = new Date();
        }

        if (newStatus === 'closed' && !ticket.closedAt) {
          updateData.closedAt = new Date();
        }
      }

      // Update ticket
      await ticket.update(updateData);

      // Refresh ticket data
      await ticket.reload();

      return ticket;
    } catch (error) {
      console.error('Update ticket error:', error);
      throw error;
    }
  }

  /**
   * Delete ticket
   */
  async deleteTicket(userId: string, ticketId: string): Promise<boolean> {
    try {
      const ticket = await Ticket.findOne({
        where: {
          id: ticketId,
          userId
        }
      });

      if (!ticket) {
        return false;
      }

      // Only allow deletion if ticket is resolved or closed
      if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
        throw new Error('Cannot delete ticket that is not resolved or closed');
      }

      await ticket.destroy();
      return true;
    } catch (error) {
      console.error('Delete ticket error:', error);
      throw error;
    }
  }

  /**
   * Get support categories
   */
  async getCategories(): Promise<any[]> {
    return [
      {
        id: 'general',
        name: 'General Inquiry',
        description: 'General questions about the platform'
      },
      {
        id: 'billing',
        name: 'Billing & Payments',
        description: 'Questions about subscriptions and payments'
      },
      {
        id: 'technical',
        name: 'Technical Issues',
        description: 'Problems with the platform functionality'
      },
      {
        id: 'account',
        name: 'Account Issues',
        description: 'Problems with account access or settings'
      },
      {
        id: 'security',
        name: 'Security Concerns',
        description: 'Security-related issues or concerns'
      },
      {
        id: 'verification',
        name: 'Verification Problems',
        description: 'Issues with profile verification'
      }
    ];
  }

  /**
   * Get support statistics
   */
  async getStats(): Promise<any> {
    try {
      const totalTickets = await Ticket.count();
      const openTickets = await Ticket.count({
        where: { status: 'open' }
      });
      const inProgressTickets = await Ticket.count({
        where: { status: 'in_progress' }
      });
      const resolvedTickets = await Ticket.count({
        where: { status: 'resolved' }
      });
      const closedTickets = await Ticket.count({
        where: { status: 'closed' }
      });

      // Get tickets by category
      const categoryStats = await Ticket.findAll({
        attributes: [
          'category',
          [require('sequelize').fn('COUNT', '*'), 'count']
        ],
        group: ['category']
      });

      // Get tickets by priority
      const priorityStats = await Ticket.findAll({
        attributes: [
          'priority',
          [require('sequelize').fn('COUNT', '*'), 'count']
        ],
        group: ['priority']
      });

      return {
        total: totalTickets,
        byStatus: {
          open: openTickets,
          in_progress: inProgressTickets,
          resolved: resolvedTickets,
          closed: closedTickets
        },
        byCategory: categoryStats,
        byPriority: priorityStats,
        averageResolutionTime: await this.getAverageResolutionTime()
      };
    } catch (error) {
      console.error('Get stats error:', error);
      throw error;
    }
  }

  /**
   * Get support agents
   */
  async getAgents(): Promise<User[]> {
    try {
      const agents = await User.findAll({
        where: {
          role: 'admin'
        },
        attributes: ['id', 'username', 'email', 'lastLoginAt'],
        order: [['lastLoginAt', 'DESC']]
      });

      return agents;
    } catch (error) {
      console.error('Get agents error:', error);
      throw error;
    }
  }

  /**
   * Assign ticket to agent
   */
  async assignTicket(ticketId: string, agentId: string): Promise<Ticket | null> {
    try {
      const ticket = await Ticket.findByPk(ticketId);
      if (!ticket) {
        return null;
      }

      // Validate agent exists
      const agent = await User.findByPk(agentId);
      if (!agent || agent.role !== 'admin') {
        throw new Error('Invalid agent');
      }

      await ticket.update({
        assignedTo: agentId,
        status: 'in_progress'
      });

      // Send notification to agent
      await this.notifyAgent(agentId, ticket);

      return ticket;
    } catch (error) {
      console.error('Assign ticket error:', error);
      throw error;
    }
  }

  /**
   * Get agent's tickets
   */
  async getAgentTickets(agentId: string, options: any = {}): Promise<Ticket[]> {
    try {
      const queryOptions: any = {
        where: { assignedTo: agentId },
        include: [{
          model: User,
          as: 'user',
          attributes: ['id', 'username']
        }],
        order: [['priority', 'DESC'], ['createdAt', 'ASC']]
      };

      if (options.limit) {
        queryOptions.limit = options.limit;
      }

      if (options.offset) {
        queryOptions.offset = options.offset;
      }

      if (options.status) {
        queryOptions.where.status = options.status;
      }

      const tickets = await Ticket.findAll(queryOptions);
      return tickets;
    } catch (error) {
      console.error('Get agent tickets error:', error);
      throw error;
    }
  }

  /**
   * Get average resolution time
   */
  private async getAverageResolutionTime(): Promise<number> {
    try {
      const resolvedTickets = await Ticket.findAll({
        where: {
          resolvedAt: { [Op.ne]: null }
        },
        attributes: [
          'createdAt',
          'resolvedAt'
        ]
      });

      if (resolvedTickets.length === 0) {
        return 0;
      }

      const totalTime = resolvedTickets.reduce((sum, ticket) => {
        if (ticket.resolvedAt) {
          return sum + (ticket.resolvedAt.getTime() - ticket.createdAt.getTime());
        }
        return sum;
      }, 0);

      return totalTime / resolvedTickets.length;
    } catch (error) {
      console.error('Get average resolution time error:', error);
      return 0;
    }
  }

  /**
   * Notify support team about new ticket
   */
  private async notifySupportTeam(ticket: Ticket): Promise<void> {
    try {
      // This would integrate with actual notification service
      console.log(`New support ticket: ${ticket.subject} (Priority: ${ticket.priority})`);
    } catch (error) {
      console.error('Notify support team error:', error);
    }
  }

  /**
   * Notify agent about assigned ticket
   */
  private async notifyAgent(agentId: string, ticket: Ticket): Promise<void> {
    try {
      // This would integrate with actual notification service
      console.log(`Ticket assigned to agent ${agentId}: ${ticket.subject}`);
    } catch (error) {
      console.error('Notify agent error:', error);
    }
  }
}