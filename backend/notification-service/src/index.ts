import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import nodemailer from 'nodemailer';
import axios from 'axios';

// Resilient HTTP client with retry logic
const createResilientClient = (baseURL) => {
  const client = axios.create({
    baseURL,
    timeout: 10000,
    headers: { 'Content-Type': 'application/json' }
  });

  // Add retry logic
  client.interceptors.response.use(null, async (error) => {
    const config = error.config;
    if (!config || !config.retry) {
      return Promise.reject(error);
    }

    config.retryCount = config.retryCount || 0;
    if (config.retryCount >= config.retry) {
      return Promise.reject(error);
    }

    config.retryCount += 1;
    const delay = config.retryDelay || 1000;

    console.log(`Retrying request to ${config.url}, attempt ${config.retryCount}`);
    await new Promise(resolve => setTimeout(resolve, delay));

    return client(config);
  });

  return client;
};

dotenv.config();

const app = express();

// Email transporter
const emailTransporter = nodemailer.createTransporter({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Routes
app.get('/', (req, res) => {
  res.json({
    service: 'Sugar Daddy Notification Service',
    status: 'running',
    version: '1.0.0'
  });
});

// Health check
app.get('/health', (req, res) => {
  res.json({
    status: 'healthy',
    timestamp: new Date().toISOString()
  });
});

// Send push notification
app.post('/notifications', async (req, res) => {
  try {
    const { userId, type, title, body, data } = req.body;

    // Get user device tokens from user service with retry logic
    const userServiceClient = createResilientClient(process.env.USER_SERVICE_URL || 'http://user-service:3002');
    const userResponse = await userServiceClient.get(`/users/${userId}/devices`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {},
      retry: 3,
      retryDelay: 500
    });

    const devices = userResponse.data;

    // Send push notifications to all user devices
    const pushPromises = devices.map(async (device: any) => {
      try {
        if (device.type === 'ios') {
          await sendIOSPush(device.token, { title, body, data });
        } else if (device.type === 'android') {
          await sendAndroidPush(device.token, { title, body, data });
        }
      } catch (error) {
        console.error(`Failed to send push to device ${device.id}:`, error);
      }
    });

    await Promise.all(pushPromises);

    // Store notification in database with retry logic
    await userServiceClient.post('/notifications', {
      userId,
      type,
      title,
      body,
      data,
      channels: ['push']
    }, {
      retry: 3,
      retryDelay: 500
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send notification error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

// Send email notification
app.post('/emails', async (req, res) => {
  try {
    const { to, subject, html, text } = req.body;

    const mailOptions = {
      from: process.env.SMTP_FROM || 'noreply@sugardaddy.com',
      to,
      subject,
      html,
      text
    };

    await emailTransporter.sendMail(mailOptions);

    // Log email sent
    await axios.post(`${process.env.USER_SERVICE_URL}/email-logs`, {
      to,
      subject,
      sentAt: new Date().toISOString()
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send email error:', error);
    res.status(500).json({ error: 'Failed to send email' });
  }
});

// Send welcome email to new user
app.post('/emails/welcome', async (req, res) => {
  try {
    const { userId } = req.body;

    // Get user data
    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    const user = userResponse.data;

    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h1 style="color: #F7E7CE; text-align: center;">Welcome to LuxeMatch!</h1>
        <p>Dear ${user.profile?.firstName || user.username},</p>
        <p>Welcome to the world's most exclusive dating platform. We're thrilled to have you join our community of successful individuals.</p>
        <p>Your account has been created successfully. Please verify your email address to start connecting with potential matches.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/verify-email?token=welcome" style="background-color: #F7E7CE; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Verify Email</a>
        </div>
        <p>If you have any questions, please don't hesitate to contact our support team.</p>
        <p>Best regards,<br>The LuxeMatch Team</p>
      </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@sugardaddy.com',
      to: user.email,
      subject: 'Welcome to LuxeMatch - Your Exclusive Dating Journey Begins',
      html: welcomeHtml
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send welcome email error:', error);
    res.status(500).json({ error: 'Failed to send welcome email' });
  }
});

// Send match notification
app.post('/notifications/match', async (req, res) => {
  try {
    const { userId, matchedUserId, matchId } = req.body;

    // Get matched user data
    const matchedUserResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${matchedUserId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    const matchedUser = matchedUserResponse.data;

    const notificationData = {
      userId,
      type: 'match',
      title: 'New Match!',
      body: `You matched with ${matchedUser.profile?.firstName || matchedUser.username}`,
      data: { matchId, matchedUserId }
    };

    // Send push notification
    await axios.post(`${process.env.NOTIFICATION_SERVICE_URL}/notifications`, notificationData);

    // Send email notification
    const matchHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F7E7CE;">Congratulations! You have a new match!</h2>
        <p>You've been matched with ${matchedUser.profile?.firstName || matchedUser.username}.</p>
        <p>Start a conversation and see where this connection takes you.</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/messages/${matchedUserId}" style="background-color: #F7E7CE; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Send Message</a>
        </div>
      </div>
    `;

    // Get user email
    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@sugardaddy.com',
      to: userResponse.data.email,
      subject: 'New Match on LuxeMatch!',
      html: matchHtml
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send match notification error:', error);
    res.status(500).json({ error: 'Failed to send match notification' });
  }
});

// Send subscription reminder
app.post('/emails/subscription-reminder', async (req, res) => {
  try {
    const { userId, daysRemaining } = req.body;

    const userResponse = await axios.get(`${process.env.USER_SERVICE_URL}/users/${userId}`, {
      headers: req.headers.authorization ? { 'Authorization': req.headers.authorization } : {}
    });

    const user = userResponse.data;

    const reminderHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #F7E7CE;">Subscription Reminder</h2>
        <p>Dear ${user.profile?.firstName || user.username},</p>
        <p>Your ${user.subscription?.tier} subscription will expire in ${daysRemaining} days.</p>
        <p>Don't miss out on premium features - renew your subscription today!</p>
        <div style="text-align: center; margin: 30px 0;">
          <a href="${process.env.FRONTEND_URL}/subscription" style="background-color: #F7E7CE; color: #000; padding: 12px 24px; text-decoration: none; border-radius: 5px;">Renew Subscription</a>
        </div>
      </div>
    `;

    await emailTransporter.sendMail({
      from: process.env.SMTP_FROM || 'noreply@sugardaddy.com',
      to: user.email,
      subject: `Your LuxeMatch subscription expires in ${daysRemaining} days`,
      html: reminderHtml
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Send subscription reminder error:', error);
    res.status(500).json({ error: 'Failed to send subscription reminder' });
  }
});

// Helper functions for push notifications
async function sendIOSPush(token: string, notification: any) {
  // Implementation for iOS push notifications using APNs
  // This would integrate with Apple's Push Notification service
  console.log('Sending iOS push to:', token, notification);
}

async function sendAndroidPush(token: string, notification: any) {
  // Implementation for Android push notifications using FCM
  // This would integrate with Firebase Cloud Messaging
  console.log('Sending Android push to:', token, notification);
}

const PORT = process.env.PORT || 3006;
app.listen(PORT, () => {
  console.log(`Notification Service is running on port ${PORT}`);
});