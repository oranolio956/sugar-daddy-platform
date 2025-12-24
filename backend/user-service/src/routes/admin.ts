import { Router } from 'express';
import { AdminService } from '../services/adminService';
import { VerificationService } from '../services/verificationService';
import { authenticateAdmin } from '../middleware/auth';
import {
  globalRateLimit,
  sensitiveOperationRateLimit,
  securityLogging,
  sanitizeInput,
  csrfProtection
} from '../middleware';

const router = Router();
const adminService = new AdminService();
const verificationService = new VerificationService();

// Apply security middleware
router.use(securityLogging);
router.use(sanitizeInput);
router.use(csrfProtection);
router.use(authenticateAdmin);

/**
 * @route   GET /api/admin/users
 * @desc    Get all users with pagination and filters
 * @access  Admin
 */
router.get('/users',
  globalRateLimit,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;
      const filters = {
        role: req.query.role as string,
        verified: req.query.verified === 'true',
        subscriptionTier: req.query.subscriptionTier as string,
        emailVerified: req.query.emailVerified === 'true'
      };

      const result = await adminService.getAllUsers(page, limit, filters);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Get users error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get users'
      });
    }
  }
);

/**
 * @route   GET /api/admin/users/:id
 * @desc    Get user details
 * @access  Admin
 */
router.get('/users/:id',
  globalRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const user = await adminService.getUserDetails(id);

      res.status(200).json({
        success: true,
        data: user
      });
    } catch (error: any) {
      console.error('Get user details error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'User not found'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id/suspend
 * @desc    Suspend user account
 * @access  Admin
 */
router.put('/users/:id/suspend',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await adminService.suspendUser(id, reason, adminId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User suspended successfully'
      });
    } catch (error: any) {
      console.error('Suspend user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to suspend user'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id/ban
 * @desc    Ban user account
 * @access  Admin
 */
router.put('/users/:id/ban',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const user = await adminService.banUser(id, reason, adminId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User banned successfully'
      });
    } catch (error: any) {
      console.error('Ban user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to ban user'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id/unban
 * @desc    Unban user account
 * @access  Admin
 */
router.put('/users/:id/unban',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const user = await adminService.unbanUser(id, adminId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User unbanned successfully'
      });
    } catch (error: any) {
      console.error('Unban user error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to unban user'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/users/:id/role
 * @desc    Update user role
 * @access  Admin
 */
router.put('/users/:id/role',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { role } = req.body;
      const adminId = req.user.id;

      const user = await adminService.updateUserRole(id, role, adminId);

      res.status(200).json({
        success: true,
        data: user,
        message: 'User role updated successfully'
      });
    } catch (error: any) {
      console.error('Update user role error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to update user role'
      });
    }
  }
);

/**
 * @route   DELETE /api/admin/users/:id
 * @desc    Delete user account (soft delete)
 * @access  Admin
 */
router.delete('/users/:id',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      await adminService.deleteUserAccount(id, reason, adminId);

      res.status(200).json({
        success: true,
        message: 'User account deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete user account error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to delete user account'
      });
    }
  }
);

/**
 * @route   GET /api/admin/verifications
 * @desc    Get pending verification documents
 * @access  Admin
 */
router.get('/verifications',
  globalRateLimit,
  async (req, res) => {
    try {
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 20;

      const result = await verificationService.getPendingVerifications(page, limit);

      res.status(200).json({
        success: true,
        data: result
      });
    } catch (error: any) {
      console.error('Get verifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get verifications'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/verifications/:id/approve
 * @desc    Approve verification document
 * @access  Admin
 */
router.put('/verifications/:id/approve',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const adminId = req.user.id;

      const document = await verificationService.reviewVerificationDocument(id, 'approve', undefined, adminId);

      res.status(200).json({
        success: true,
        data: document,
        message: 'Verification document approved successfully'
      });
    } catch (error: any) {
      console.error('Approve verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to approve verification document'
      });
    }
  }
);

/**
 * @route   PUT /api/admin/verifications/:id/reject
 * @desc    Reject verification document
 * @access  Admin
 */
router.put('/verifications/:id/reject',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const { reason } = req.body;
      const adminId = req.user.id;

      const document = await verificationService.reviewVerificationDocument(id, 'reject', reason, adminId);

      res.status(200).json({
        success: true,
        data: document,
        message: 'Verification document rejected successfully'
      });
    } catch (error: any) {
      console.error('Reject verification error:', error);
      res.status(400).json({
        success: false,
        message: error.message || 'Failed to reject verification document'
      });
    }
  }
);

/**
 * @route   GET /api/admin/reports/security
 * @desc    Get security reports
 * @access  Admin
 */
router.get('/reports/security',
  globalRateLimit,
  async (req, res) => {
    try {
      const reports = await adminService.getSecurityReports();

      res.status(200).json({
        success: true,
        data: reports
      });
    } catch (error: any) {
      console.error('Get security reports error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get security reports'
      });
    }
  }
);

/**
 * @route   GET /api/admin/reports/verifications
 * @desc    Get verification statistics
 * @access  Admin
 */
router.get('/reports/verifications',
  globalRateLimit,
  async (req, res) => {
    try {
      const stats = await verificationService.getVerificationStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get verification stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get verification statistics'
      });
    }
  }
);

/**
 * @route   GET /api/admin/users/:id/export
 * @desc    Export user data for compliance
 * @access  Admin
 */
router.get('/users/:id/export',
  globalRateLimit,
  async (req, res) => {
    try {
      const { id } = req.params;
      const data = await adminService.exportUserData(id);

      res.status(200).json({
        success: true,
        data
      });
    } catch (error: any) {
      console.error('Export user data error:', error);
      res.status(404).json({
        success: false,
        message: error.message || 'User not found'
      });
    }
  }
);

/**
 * @route   POST /api/admin/verifications/cleanup
 * @desc    Clean up expired verification documents
 * @access  Admin
 */
router.post('/verifications/cleanup',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const count = await verificationService.expireOldDocuments();

      res.status(200).json({
        success: true,
        data: { expiredCount: count },
        message: `${count} expired verification documents cleaned up`
      });
    } catch (error: any) {
      console.error('Cleanup expired verifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to cleanup expired verifications'
      });
    }
  }
);

export default router;