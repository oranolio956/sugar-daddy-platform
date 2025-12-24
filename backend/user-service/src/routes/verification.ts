import { Router } from 'express';
import { VerificationService } from '../services/verificationService';
import { EmailService } from '../services/emailService';
import { SecurityUtils } from '../utils/security';
import {
  globalRateLimit,
  sensitiveOperationRateLimit,
  fileUploadRateLimit,
  accountLockoutMiddleware,
  suspiciousActivityMiddleware,
  deviceTrackingMiddleware,
  csrfProtection,
  sanitizeInput,
  requestSizeLimit,
  validateUserAgent,
  securityLogging
} from '../middleware';
import multer from 'multer';
import path from 'path';

const router = Router();
const verificationService = new VerificationService();
const emailService = new EmailService();

// Apply security middleware to all routes
router.use(securityLogging);
router.use(validateUserAgent);
router.use(requestSizeLimit);
router.use(sanitizeInput);
router.use(csrfProtection);
router.use(deviceTrackingMiddleware);

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, 'uploads/verification/');
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const fileFilter = (req: any, file: any, cb: any) => {
  // Accept only image files
  if (file.mimetype.startsWith('image/')) {
    cb(null, true);
  } else {
    cb(new Error('Only image files are allowed'), false);
  }
};

const upload = multer({ 
  storage, 
  fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB limit
  }
});

/**
 * @route   POST /api/verification/documents
 * @desc    Submit verification document
 * @access  Private
 */
router.post('/documents',
  globalRateLimit,
  fileUploadRateLimit,
  sensitiveOperationRateLimit,
  upload.single('document'),
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { type } = req.body;
      const file = req.file;

      if (!file) {
        return res.status(400).json({
          success: false,
          message: 'No file uploaded'
        });
      }

      if (!type || !['photo_id', 'utility_bill', 'bank_statement', 'selfie'].includes(type)) {
        return res.status(400).json({
          success: false,
          message: 'Invalid document type'
        });
      }

      // Check if user can submit this document
      const canSubmit = await verificationService.canSubmitDocument(userId, type);
      if (!canSubmit) {
        return res.status(400).json({
          success: false,
          message: 'You have already submitted this document type'
        });
      }

      // Generate file hash for security
      const fileHash = SecurityUtils.generateFileHash(file.path);

      // Submit verification document
      const document = await verificationService.submitVerificationDocument(
        userId,
        type,
        file.originalname,
        file.path,
        fileHash,
        {
          fileSize: file.size,
          mimeType: file.mimetype,
          dimensions: req.body.dimensions || null,
          detectedText: req.body.detectedText || null
        }
      );

      res.status(201).json({
        success: true,
        message: 'Document submitted successfully',
        data: {
          documentId: document.id,
          status: document.status,
          fileName: document.fileName
        }
      });
    } catch (error: any) {
      console.error('Document submission error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to submit document'
      });
    }
  }
);

/**
 * @route   GET /api/verification/status
 * @desc    Get user verification status
 * @access  Private
 */
router.get('/status',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const status = await verificationService.getUserVerificationStatus(userId);

      res.status(200).json({
        success: true,
        data: status
      });
    } catch (error: any) {
      console.error('Get verification status error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get verification status'
      });
    }
  }
);

/**
 * @route   GET /api/verification/documents
 * @desc    Get user verification documents
 * @access  Private
 */
router.get('/documents',
  globalRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const documents = await verificationService.getUserVerificationStatus(userId);

      res.status(200).json({
        success: true,
        data: documents.documents
      });
    } catch (error: any) {
      console.error('Get documents error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get documents'
      });
    }
  }
);

/**
 * @route   DELETE /api/verification/documents/:documentId
 * @desc    Delete verification document
 * @access  Private
 */
router.delete('/documents/:documentId',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { documentId } = req.params;

      // Check if document exists and belongs to user
      const document = await require('../models/VerificationDocument').VerificationDocument.findOne({
        where: { id: documentId, userId }
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Only allow deletion if document is pending
      if (document.status !== 'pending') {
        return res.status(400).json({
          success: false,
          message: 'Cannot delete document that is not pending'
        });
      }

      await document.destroy();

      res.status(200).json({
        success: true,
        message: 'Document deleted successfully'
      });
    } catch (error: any) {
      console.error('Delete document error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to delete document'
      });
    }
  }
);

/**
 * @route   POST /api/verification/resubmit/:documentId
 * @desc    Request to resubmit document
 * @access  Private
 */
router.post('/resubmit/:documentId',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const userId = req.user.id;
      const { documentId } = req.params;
      const { reason } = req.body;

      // Check if document exists and belongs to user
      const document = await require('../models/VerificationDocument').VerificationDocument.findOne({
        where: { id: documentId, userId }
      });

      if (!document) {
        return res.status(404).json({
          success: false,
          message: 'Document not found'
        });
      }

      // Only allow resubmission if document was rejected
      if (document.status !== 'rejected') {
        return res.status(400).json({
          success: false,
          message: 'Cannot resubmit document that was not rejected'
        });
      }

      // Update document status to pending
      document.status = 'pending';
      document.rejectionReason = null;
      document.verifiedAt = null;
      document.expiresAt = null;
      await document.save();

      // Send notification to admin
      await emailService.sendSecurityAlertEmail(
        req.user,
        'document_resubmitted',
        {
          documentId,
          type: document.type,
          reason: reason || 'User requested resubmission'
        }
      );

      res.status(200).json({
        success: true,
        message: 'Document resubmitted successfully'
      });
    } catch (error: any) {
      console.error('Resubmit document error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to resubmit document'
      });
    }
  }
);

/**
 * @route   GET /api/verification/admin/pending
 * @desc    Get pending verifications for admin review
 * @access  Private (Admin only)
 */
router.get('/admin/pending',
  globalRateLimit,
  async (req, res) => {
    try {
      const { page = 1, limit = 20 } = req.query;
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const pending = await verificationService.getPendingVerifications(
        parseInt(page),
        parseInt(limit)
      );

      res.status(200).json({
        success: true,
        data: pending
      });
    } catch (error: any) {
      console.error('Get pending verifications error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get pending verifications'
      });
    }
  }
);

/**
 * @route   POST /api/verification/admin/:documentId/approve
 * @desc    Approve verification document (Admin only)
 * @access  Private (Admin only)
 */
router.post('/admin/:documentId/approve',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const document = await verificationService.approveVerificationDocument(
        documentId,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: 'Document approved successfully',
        data: {
          documentId: document.id,
          status: document.status,
          verifiedAt: document.verifiedAt
        }
      });
    } catch (error: any) {
      console.error('Approve document error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to approve document'
      });
    }
  }
);

/**
 * @route   POST /api/verification/admin/:documentId/reject
 * @desc    Reject verification document (Admin only)
 * @access  Private (Admin only)
 */
router.post('/admin/:documentId/reject',
  globalRateLimit,
  sensitiveOperationRateLimit,
  async (req, res) => {
    try {
      const { documentId } = req.params;
      const { rejectionReason } = req.body;
      
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      if (!rejectionReason) {
        return res.status(400).json({
          success: false,
          message: 'Rejection reason is required'
        });
      }

      const document = await verificationService.rejectVerificationDocument(
        documentId,
        rejectionReason,
        req.user.id
      );

      res.status(200).json({
        success: true,
        message: 'Document rejected successfully',
        data: {
          documentId: document.id,
          status: document.status,
          rejectionReason: document.rejectionReason
        }
      });
    } catch (error: any) {
      console.error('Reject document error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to reject document'
      });
    }
  }
);

/**
 * @route   GET /api/verification/admin/stats
 * @desc    Get verification statistics (Admin only)
 * @access  Private (Admin only)
 */
router.get('/admin/stats',
  globalRateLimit,
  async (req, res) => {
    try {
      // Check if user is admin
      if (req.user.role !== 'admin') {
        return res.status(403).json({
          success: false,
          message: 'Admin access required'
        });
      }

      const stats = await verificationService.getVerificationStats();

      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error: any) {
      console.error('Get verification stats error:', error);
      res.status(500).json({
        success: false,
        message: error.message || 'Failed to get verification stats'
      });
    }
  }
);

export default router;