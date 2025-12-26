import express, { Request, Response } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import Stripe from 'stripe';
import axios from 'axios';

dotenv.config();

const app = express();
const stripe = new Stripe(process.env['STRIPE_SECRET_KEY'] || '', {
  apiVersion: '2023-10-16'
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req: Request, res: Response) => {
  res.json({
    service: 'Sugar Daddy Payment Service',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req: Request, res: Response) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });

  // Database health check
  app.get('/health/db', async (req, res) => {
    try {
      // Test database connection
      await sequelize.authenticate();
      res.json({
        status: 'healthy',
        database: 'connected',
        timestamp: new Date().toISOString()
      });
    } catch (error) {
      console.error('Database health check failed:', error);
      res.status(503).json({
        status: 'unhealthy',
        database: 'disconnected',
        error: error.message,
        timestamp: new Date().toISOString()
      });
    }
  });
});

// Create payment intent for subscription
app.post('/create-payment-intent', async (req: Request, res: Response) => {
  try {
    const { userId, subscriptionTier, amount } = req.body;

    // Get user data to verify
    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}
    });

    const user = userResponse.data;

    // Create Stripe payment intent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: amount * 100, // Convert to cents
      currency: 'usd',
      metadata: {
        userId,
        subscriptionTier,
        userEmail: user.email
      },
      description: `Sugar Daddy Platform - ${subscriptionTier} subscription`,
      automatic_payment_methods: {
        enabled: true,
      },
    });

    res.json({
      clientSecret: paymentIntent.client_secret,
      paymentIntentId: paymentIntent.id
    });
  } catch (error) {
    console.error('Create payment intent error:', error);
    res.status(500).json({ error: 'Failed to create payment intent' });
  }
});

// Confirm payment and update subscription
app.post('/confirm-payment', async (req: Request, res: Response) => {
  try {
    const { paymentIntentId, userId, subscriptionTier } = req.body;

    // Retrieve payment intent from Stripe
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId);

    if (paymentIntent.status === 'succeeded') {
      // Update user subscription in user service
      const subscriptionData = getSubscriptionData(subscriptionTier);

      await axios.put(`${process.env['USER_SERVICE_URL']}/users/${userId}/subscription`, {
        tier: subscriptionTier,
        status: 'active',
        features: subscriptionData.features,
        expiresAt: subscriptionData.expiresAt
      }, {
        headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
      });

      // Create subscription record
      await axios.post(`${process.env['USER_SERVICE_URL']}/subscriptions`, {
        userId,
        stripePaymentIntentId: paymentIntentId,
        tier: subscriptionTier,
        amount: paymentIntent.amount / 100,
        currency: paymentIntent.currency,
        status: 'active'
      });

      res.json({
        success: true,
        subscription: subscriptionData
      });
    } else {
      res.status(400).json({ error: 'Payment not completed' });
    }
  } catch (error) {
    console.error('Confirm payment error:', error);
    res.status(500).json({ error: 'Failed to confirm payment' });
  }
});

// Handle Stripe webhooks
app.post('/webhooks/stripe', express.raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const sig = req.headers['stripe-signature'] as string;
  const endpointSecret = process.env['STRIPE_WEBHOOK_SECRET'];

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body as any, sig, endpointSecret);
  } catch (err) {
    console.error('Webhook signature verification failed:', err);
    return res.status(400).send('Webhook Error');
  }

  // Handle the event
  switch (event.type) {
    case 'payment_intent.succeeded':
      const paymentIntent = event.data.object;
      console.log('Payment succeeded:', paymentIntent.id);
      // Update subscription status
      break;

    case 'payment_intent.payment_failed':
      const failedPayment = event.data.object;
      console.log('Payment failed:', failedPayment.id);
      // Handle failed payment
      break;

    case 'invoice.payment_succeeded':
      const invoice = event.data.object;
      console.log('Invoice payment succeeded:', invoice.id);
      // Handle recurring payment success
      break;

    default:
      console.log(`Unhandled event type ${event.type}`);
  }

  res.json({ received: true });
});

// Send virtual gift
app.post('/gifts/send', async (req: Request, res: Response) => {
  try {
    const { senderId, receiverId, giftType, amount } = req.body;

    // Verify sender has sufficient balance/credits
    const senderResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${senderId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}
    });

    const sender = senderResponse.data;

    // Check if sender can afford the gift
    if (!canAffordGift(sender, giftType, amount)) {
      return res.status(400).json({ error: 'Insufficient funds or credits' });
    }

    // Create gift record
    const gift = await axios.post(`${process.env.USER_SERVICE_URL}/gifts`, {
      senderId,
      receiverId,
      giftType,
      amount,
      status: 'delivered'
    }, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    // Deduct from sender's balance
    await axios.put(`${process.env.USER_SERVICE_URL}/users/${senderId}/balance`, {
      deduct: amount
    }, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}
    });

    // Notify receiver
    await axios.post(`${process.env['NOTIFICATION_SERVICE_URL']}/notifications`, {
      userId: receiverId,
      type: 'gift',
      title: 'You received a gift!',
      body: `${sender.profile?.firstName || 'Someone'} sent you a ${giftType}`,
      data: { giftId: gift.data.id, senderId }
    });

    res.json({
      success: true,
      gift: gift.data
    });
  } catch (error) {
    console.error('Send gift error:', error);
    res.status(500).json({ error: 'Failed to send gift' });
  }
});

// Get user's transaction history
app.get('/transactions/:userId', async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { limit = 20, offset = 0 } = req.query;

    // Get transactions from database
    const transactionsResponse = await axios.get(`${process.env.USER_SERVICE_URL}/transactions`, {
      params: { userId, limit, offset },
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization as string } : {}
    });

    res.json(transactionsResponse.data);
  } catch (error) {
    console.error('Get transactions error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get available subscription tiers
app.get('/subscriptions/tiers', (req: Request, res: Response) => {
  res.json({
    tiers: {
      free: {
        name: 'Free',
        price: 0,
        features: ['basic_profile', 'basic_matching', 'limited_messages']
      },
      premium: {
        name: 'Premium',
        price: 29.99,
        features: ['premium_profile', 'advanced_matching', 'unlimited_messages', 'read_receipts', 'profile_boost']
      },
      elite: {
        name: 'Elite',
        price: 99.99,
        features: ['elite_profile', 'priority_matching', 'video_chat', 'travel_mode', 'concierge_service']
      },
      vip: {
        name: 'VIP',
        price: 299.99,
        features: ['vip_profile', 'exclusive_matching', 'personal_concierge', 'luxury_events', 'helicopter_service']
      }
    }
  });
});

// Helper functions
function getSubscriptionData(tier: string) {
  const tiers = {
    free: {
      features: ['basic_profile', 'basic_matching', 'limited_messages'],
      expiresAt: null
    },
    premium: {
      features: ['premium_profile', 'advanced_matching', 'unlimited_messages', 'read_receipts', 'profile_boost'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString() // 30 days
    },
    elite: {
      features: ['elite_profile', 'priority_matching', 'video_chat', 'travel_mode', 'concierge_service'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    },
    vip: {
      features: ['vip_profile', 'exclusive_matching', 'personal_concierge', 'luxury_events', 'helicopter_service'],
      expiresAt: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    }
  };

  return tiers[tier as keyof typeof tiers] || tiers.free;
}

function canAffordGift(user: any, giftType: string, amount: number): boolean {
  // Simplified check - in real implementation, check user's balance/credits
  return user.subscription?.tier === 'premium' ||
         user.subscription?.tier === 'elite' ||
         user.subscription?.tier === 'vip' ||
         amount <= 50; // Allow small gifts for free users
}

const PORT = process.env.PORT || 3005;
app.listen(PORT, () => {
  console.log(`Payment Service is running on port ${PORT}`);
});