import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import * as dotenv from 'dotenv';
import axios from 'axios';

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(helmet());
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Admin authentication middleware
const requireAdmin = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  if (!user || user.role !== 'admin') {
    return res.status(403).json({ error: 'Admin access required' });
  }
  next();
};

// Admin dashboard stats
app.get('/stats', requireAdmin, async (req: Request, res: Response) => {
  try {
    // Get comprehensive platform statistics
    const stats = await getPlatformStats();

    res.json(stats);
  } catch (error) {
    console.error('Get admin stats error:', error);
    res.status(500).json({ error: 'Failed to get admin statistics' });
  }
});

// User management
app.get('/users', requireAdmin, async (req: Request, res: Response) => {
  try {
    const {
      page = 1,
      limit = 20,
      status,
      role,
      subscription,
      verified,
      search
    } = req.query;

    const users = await getUsersAdmin({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { status, role, subscription, verified, search }
    });

    res.json(users);
  } catch (error) {
    console.error('Get users admin error:', error);
    res.status(500).json({ error: 'Failed to get users' });
  }
});

// User details
app.get('/users/:userId', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;

    const userDetails = await getUserDetailsAdmin(userId);

    if (!userDetails) {
      return res.status(404).json({ error: 'User not found' });
    }

    res.json(userDetails);
  } catch (error) {
    console.error('Get user details error:', error);
    res.status(500).json({ error: 'Failed to get user details' });
  }
});

// Update user status
app.put('/users/:userId/status', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { userId } = req.params;
    const { status, reason } = req.body;

    await updateUserStatus(userId, status, reason);

    // Log admin action
    await logAdminAction((req as any).user.id, 'update_user_status', {
      userId,
      newStatus: status,
      reason
    });

    res.json({ success: true });
  } catch (error) {
    console.error('Update user status error:', error);
    res.status(500).json({ error: 'Failed to update user status' });
  }
});

// Content moderation queue
app.get('/moderation/queue', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { type, status = 'pending', page = 1, limit = 20 } = req.query;

    const queue = await getModerationQueue(type, status, parseInt(page), parseInt(limit));

    res.json(queue);
  } catch (error) {
    console.error('Get moderation queue error:', error);
    res.status(500).json({ error: 'Failed to get moderation queue' });
  }
});

// Review content
app.post('/moderation/:contentId/review', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { contentId } = req.params;
    const { action, reason, notes } = req.body;

    const result = await reviewContent(contentId, action, reason, notes);

    // Log admin action
    await logAdminAction((req as any).user.id, 'content_review', {
      contentId,
      action,
      reason,
      notes
    });

    // Notify user if content was rejected
    if (action === 'reject' && result.userId) {
      await axios.post(`${process.env['NOTIFICATION_SERVICE_URL']}/notifications`, {
        userId: result.userId,
        type: 'content_rejected',
        title: 'Content Review',
        body: `Your content was ${action}: ${reason}`,
        data: { contentId, reason, notes }
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Review content error:', error);
    res.status(500).json({ error: 'Failed to review content' });
  }
});

// Verification document review
app.put('/verification/:documentId/review', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { documentId } = req.params;
    const { status, notes } = req.body;

    const result = await reviewVerificationDocument(documentId, status, notes);

    // Log admin action
    await logAdminAction((req as any).user.id, 'verification_review', {
      documentId,
      status,
      notes
    });

    // Notify user
    if (result.userId) {
      await axios.post(`${process.env['NOTIFICATION_SERVICE_URL']}/notifications`, {
        userId: result.userId,
        type: 'verification_update',
        title: 'Verification Update',
        body: `Your verification document has been ${status}`,
        data: { documentId, status, notes }
      });
    }

    res.json(result);
  } catch (error) {
    console.error('Review verification error:', error);
    res.status(500).json({ error: 'Failed to review verification' });
  }
});

// Fraud reports
app.get('/fraud-reports', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { status = 'open', page = 1, limit = 20 } = req.query;

    const reports = await getFraudReports(status, parseInt(page), parseInt(limit));

    res.json(reports);
  } catch (error) {
    console.error('Get fraud reports error:', error);
    res.status(500).json({ error: 'Failed to get fraud reports' });
  }
});

// Investigate fraud report
app.post('/fraud-reports/:reportId/investigate', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { reportId } = req.params;
    const { action, findings, sanctions } = req.body;

    const result = await investigateFraudReport(reportId, action, findings, sanctions);

    // Log admin action
    await logAdminAction((req as any).user.id, 'fraud_investigation', {
      reportId,
      action,
      findings,
      sanctions
    });

    // Apply sanctions if specified
    if (sanctions && result.userId) {
      await applyUserSanctions(result.userId, sanctions);
    }

    res.json(result);
  } catch (error) {
    console.error('Investigate fraud report error:', error);
    res.status(500).json({ error: 'Failed to investigate fraud report' });
  }
});

// System settings
app.get('/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const settings = await getSystemSettings();

    res.json(settings);
  } catch (error) {
    console.error('Get system settings error:', error);
    res.status(500).json({ error: 'Failed to get system settings' });
  }
});

// Update system settings
app.put('/settings', requireAdmin, async (req: Request, res: Response) => {
  try {
    const updates = req.body;

    await updateSystemSettings(updates);

    // Log admin action
    await logAdminAction((req as any).user.id, 'update_settings', updates);

    res.json({ success: true });
  } catch (error) {
    console.error('Update system settings error:', error);
    res.status(500).json({ error: 'Failed to update system settings' });
  }
});

// Analytics dashboard
app.get('/analytics', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { period = '30d' } = req.query;

    const analytics = await getAnalyticsData(period);

    res.json(analytics);
  } catch (error) {
    console.error('Get analytics error:', error);
    res.status(500).json({ error: 'Failed to get analytics' });
  }
});

// Admin action logs
app.get('/logs', requireAdmin, async (req: Request, res: Response) => {
  try {
    const { page = 1, limit = 50, adminId, action } = req.query;

    const logs = await getAdminActionLogs({
      page: parseInt(page),
      limit: parseInt(limit),
      filters: { adminId, action }
    });

    res.json(logs);
  } catch (error) {
    console.error('Get admin logs error:', error);
    res.status(500).json({ error: 'Failed to get admin logs' });
  }
});

// Helper functions (mock implementations)

async function getPlatformStats() {
  return {
    users: {
      total: 12547,
      active: 8932,
      premium: 2341,
      newToday: 127,
      verificationRate: 68.5
    },
    matches: {
      total: 45621,
      today: 342,
      successRate: 23.4
    },
    revenue: {
      monthly: 89234.56,
      today: 1247.89,
      avgTransaction: 89.99
    },
    content: {
      pendingModeration: 23,
      reportedContent: 12,
      blockedUsers: 45
    },
    system: {
      uptime: '99.9%',
      responseTime: '245ms',
      errorRate: '0.1%'
    }
  };
}

async function getUsersAdmin({ page, limit, filters }: any) {
  // Mock user list with admin filters
  return {
    users: [
      {
        id: 'user_1',
        email: 'user@example.com',
        username: 'user1',
        role: 'sugar_baby',
        status: 'active',
        subscription: 'premium',
        verified: true,
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      }
    ],
    total: 12547,
    page,
    limit
  };
}

async function getUserDetailsAdmin(userId: string) {
  return {
    id: userId,
    profile: {},
    activity: [],
    verification: [],
    reports: [],
    subscription: {}
  };
}

async function updateUserStatus(userId: string, status: string, reason: string) {
  // Mock status update
  console.log(`Updated user ${userId} status to ${status}: ${reason}`);
}

async function logAdminAction(adminId: string, action: string, details: any) {
  // Mock logging
  console.log(`Admin ${adminId} performed ${action}:`, details);
}

async function getModerationQueue(type: any, status: any, page: number, limit: number) {
  return {
    items: [
      {
        id: 'content_1',
        type: 'photo',
        userId: 'user_1',
        content: 'inappropriate_photo.jpg',
        reportedBy: ['user_2', 'user_3'],
        reason: 'inappropriate_content',
        submittedAt: new Date().toISOString()
      }
    ],
    total: 23,
    page,
    limit
  };
}

async function reviewContent(contentId: string, action: string, reason: string, notes: string) {
  return {
    contentId,
    action,
    reason,
    notes,
    reviewedAt: new Date().toISOString(),
    userId: 'user_1'
  };
}

async function reviewVerificationDocument(documentId: string, status: string, notes: string) {
  return {
    documentId,
    status,
    notes,
    reviewedAt: new Date().toISOString(),
    userId: 'user_1'
  };
}

async function getFraudReports(status: any, page: number, limit: number) {
  return {
    reports: [
      {
        id: 'report_1',
        reportedUser: 'user_suspicious',
        reportedBy: 'user_victim',
        reason: 'fake_profile',
        evidence: ['screenshot1.jpg'],
        status: 'investigating',
        createdAt: new Date().toISOString()
      }
    ],
    total: 12,
    page,
    limit
  };
}

async function investigateFraudReport(reportId: string, action: string, findings: string, sanctions: any) {
  return {
    reportId,
    action,
    findings,
    sanctions,
    investigatedAt: new Date().toISOString(),
    userId: 'user_suspicious'
  };
}

async function applyUserSanctions(userId: string, sanctions: any) {
  console.log(`Applied sanctions to user ${userId}:`, sanctions);
}

async function getSystemSettings() {
  return {
    features: {
      videoCalls: true,
      superLikes: true,
      incognitoMode: true
    },
    limits: {
      messagesPerDay: 50,
      matchesPerDay: 25
    },
    moderation: {
      autoModerate: true,
      requireVerification: true
    }
  };
}

async function updateSystemSettings(updates: any) {
  console.log('Updated system settings:', updates);
}

async function getAnalyticsData(period: any) {
  return {
    period,
    metrics: {
      userAcquisition: { newUsers: 127, conversionRate: 12.5 },
      engagement: { dailyActive: 8932, sessionLength: '24m' },
      monetization: { arpu: 89.99, churnRate: 3.2 },
      safety: { reportsResolved: 45, falsePositives: 2 }
    },
    charts: {
      userGrowth: [],
      revenue: [],
      engagement: []
    }
  };
}

async function getAdminActionLogs({ page, limit, filters }: any) {
  return {
    logs: [
      {
        id: 'log_1',
        adminId: 'admin_1',
        action: 'content_review',
        details: { contentId: 'content_1', action: 'approve' },
        timestamp: new Date().toISOString(),
        ipAddress: '192.168.1.1'
      }
    ],
    total: 1250,
    page,
    limit
  };
}

const PORT = process.env['ADMIN_PORT'] || 3007;
app.listen(PORT, () => {
  console.log(`Admin Service is running on port ${PORT}`);
});