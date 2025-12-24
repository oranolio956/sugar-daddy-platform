import { User } from '../models/User';
import { VirtualCurrency } from '../models/VirtualCurrency';
import { Gift } from '../models/Gift';
import { Op } from 'sequelize';

export class GiftService {
  private readonly GIFT_CATALOG = [
    {
      id: 'rose',
      name: 'Virtual Rose',
      type: 'virtual',
      value: 10,
      description: 'A classic symbol of affection',
      imageUrl: '/gifts/rose.png',
      metadata: { animation: 'gentle-sway' }
    },
    {
      id: 'chocolate',
      name: 'Box of Chocolates',
      type: 'virtual',
      value: 25,
      description: 'Sweet treats for a sweet person',
      imageUrl: '/gifts/chocolate.png',
      metadata: { animation: 'unwrap' }
    },
    {
      id: 'diamond',
      name: 'Diamond Ring',
      type: 'premium',
      value: 100,
      description: 'A symbol of true appreciation',
      imageUrl: '/gifts/diamond.png',
      metadata: { animation: 'sparkle', specialEffects: ['glitter'] }
    },
    {
      id: 'sports-car',
      name: 'Sports Car',
      type: 'premium',
      value: 500,
      description: 'For the ultimate gesture',
      imageUrl: '/gifts/sports-car.png',
      metadata: { animation: 'zoom', specialEffects: ['speed-lines', 'engine-sound'] }
    },
    {
      id: 'private-jet',
      name: 'Private Jet',
      type: 'premium',
      value: 1000,
      description: 'The ultimate luxury gift',
      imageUrl: '/gifts/private-jet.png',
      metadata: { animation: 'takeoff', specialEffects: ['clouds', 'altitude-sound'] }
    }
  ];

  /**
   * Get available gifts for purchase
   */
  async getGiftCatalog(userId: string) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      // Add premium-only gifts for premium users
      const catalog = [...this.GIFT_CATALOG];

      if (['premium', 'elite', 'vip'].includes(user.subscription.tier)) {
        catalog.push({
          id: 'custom',
          name: 'Custom Gift',
          type: 'custom',
          value: 0,
          description: 'Create your own personalized gift',
          imageUrl: '/gifts/custom.png',
          metadata: { custom: true }
        });
      }

      return catalog;
    } catch (error) {
      console.error('Get gift catalog error:', error);
      throw error;
    }
  }

  /**
   * Get user's virtual currency balance
   */
  async getBalance(userId: string) {
    try {
      let currency = await VirtualCurrency.findOne({
        where: { userId }
      });

      if (!currency) {
        currency = await VirtualCurrency.create({ userId });
      }

      return {
        balance: currency.balance,
        totalEarned: currency.totalEarned,
        totalSpent: currency.totalSpent,
        giftStats: currency.giftStats
      };
    } catch (error) {
      console.error('Get balance error:', error);
      throw error;
    }
  }

  /**
   * Purchase virtual currency
   */
  async purchaseCurrency(userId: string, amount: number, paymentMethod: string) {
    try {
      if (amount <= 0) {
        throw new Error('Invalid purchase amount');
      }

      // Validate payment method
      const validPaymentMethods = ['credit_card', 'paypal', 'stripe'];
      if (!validPaymentMethods.includes(paymentMethod)) {
        throw new Error('Invalid payment method');
      }

      // Calculate bonus for larger purchases
      let bonusMultiplier = 1;
      if (amount >= 100) bonusMultiplier = 1.2; // 20% bonus
      else if (amount >= 50) bonusMultiplier = 1.1; // 10% bonus
      else if (amount >= 25) bonusMultiplier = 1.05; // 5% bonus

      const bonusAmount = amount * (bonusMultiplier - 1);
      const totalAmount = amount + bonusAmount;

      let currency = await VirtualCurrency.findOne({
        where: { userId }
      });

      if (!currency) {
        currency = await VirtualCurrency.create({ userId });
      }

      // Update balance and stats
      await currency.update({
        balance: currency.balance + totalAmount,
        totalEarned: currency.totalEarned + totalAmount
      });

      // Here you would integrate with actual payment processor
      // For now, we'll simulate successful payment
      return {
        amount,
        bonusAmount,
        totalAmount,
        newBalance: currency.balance + totalAmount,
        transactionId: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      };
    } catch (error) {
      console.error('Purchase currency error:', error);
      throw error;
    }
  }

  /**
   * Send gift to another user
   */
  async sendGift(senderId: string, receiverId: string, giftId: string, customMessage?: string) {
    try {
      // Validate sender and receiver exist and are different
      const [sender, receiver] = await Promise.all([
        User.findByPk(senderId),
        User.findByPk(receiverId)
      ]);

      if (!sender || !receiver) {
        throw new Error('User not found');
      }

      if (senderId === receiverId) {
        throw new Error('Cannot send gift to yourself');
      }

      // Get sender's balance
      let senderCurrency = await VirtualCurrency.findOne({
        where: { userId: senderId }
      });

      if (!senderCurrency) {
        senderCurrency = await VirtualCurrency.create({ userId: senderId });
      }

      // Find gift in catalog
      const gift = this.GIFT_CATALOG.find(g => g.id === giftId);
      if (!gift) {
        throw new Error('Invalid gift');
      }

      // Check if user has enough balance
      if (senderCurrency.balance < gift.value) {
        throw new Error('Insufficient balance');
      }

      // Deduct currency from sender
      await senderCurrency.update({
        balance: senderCurrency.balance - gift.value,
        totalSpent: senderCurrency.totalSpent + gift.value
      });

      // Update sender's gift stats
      const newSenderStats = {
        ...senderCurrency.giftStats,
        giftsSent: senderCurrency.giftStats.giftsSent + 1
      };

      if (gift.type === 'premium') {
        newSenderStats.premiumGiftsSent = (newSenderStats.premiumGiftsSent || 0) + 1;
      }

      await senderCurrency.update({ giftStats: newSenderStats });

      // Create gift record
      const giftRecord = await Gift.create({
        senderId,
        receiverId,
        type: gift.type,
        name: gift.name,
        description: customMessage || gift.description,
        value: gift.value,
        imageUrl: gift.imageUrl,
        metadata: gift.metadata
      });

      // Update receiver's gift stats
      let receiverCurrency = await VirtualCurrency.findOne({
        where: { userId: receiverId }
      });

      if (!receiverCurrency) {
        receiverCurrency = await VirtualCurrency.create({ userId: receiverId });
      }

      const newReceiverStats = {
        ...receiverCurrency.giftStats,
        giftsReceived: receiverCurrency.giftStats.giftsReceived + 1
      };

      if (gift.type === 'premium') {
        newReceiverStats.premiumGiftsReceived = (newReceiverStats.premiumGiftsReceived || 0) + 1;
      }

      await receiverCurrency.update({ giftStats: newReceiverStats });

      // Send notification (would integrate with notification service)
      // await this.sendGiftNotification(receiverId, sender.username, gift.name);

      return {
        giftId: giftRecord.id,
        sender: sender.username,
        receiver: receiver.username,
        giftName: gift.name,
        value: gift.value,
        message: customMessage
      };
    } catch (error) {
      console.error('Send gift error:', error);
      throw error;
    }
  }

  /**
   * Get user's gift statistics
   */
  async getGiftStats(userId: string) {
    try {
      const currency = await VirtualCurrency.findOne({
        where: { userId }
      });

      if (!currency) {
        return {
          balance: 0,
          totalEarned: 0,
          totalSpent: 0,
          giftStats: {
            giftsReceived: 0,
            giftsSent: 0,
            premiumGiftsReceived: 0,
            premiumGiftsSent: 0,
          }
        };
      }

      // Get recent activity
      const recentGifts = await Gift.findAll({
        where: {
          [Op.or]: [
            { senderId: userId },
            { receiverId: userId }
          ]
        },
        order: [['createdAt', 'DESC']],
        limit: 10
      });

      return {
        balance: currency.balance,
        totalEarned: currency.totalEarned,
        totalSpent: currency.totalSpent,
        giftStats: currency.giftStats,
        recentActivity: recentGifts
      };
    } catch (error) {
      console.error('Get gift stats error:', error);
      throw error;
    }
  }

  /**
   * Send gift notification (placeholder for notification service integration)
   */
  private async sendGiftNotification(receiverId: string, senderName: string, giftName: string) {
    try {
      // This would integrate with the notification service
      // For now, we'll just log it
      console.log(`Gift notification: ${senderName} sent ${giftName} to user ${receiverId}`);
    } catch (error) {
      console.error('Send gift notification error:', error);
    }
  }
}