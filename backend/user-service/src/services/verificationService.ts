import { User } from '../models/User';
import { VerificationDocument } from '../models/VerificationDocument';
import { SecurityUtils } from '../utils/security';
import { JumioService } from './jumioService';
import { CheckrService } from './checkrService';

export class VerificationService {
  private jumioService: JumioService;
  private checkrService: CheckrService;

  constructor() {
    this.jumioService = new JumioService();
    this.checkrService = new CheckrService();
  }
  /**
   * Submit verification document
   */
  async submitVerificationDocument(
    userId: string,
    documentType: 'photo_id' | 'utility_bill' | 'bank_statement' | 'selfie',
    fileName: string,
    fileUrl: string,
    fileHash: string,
    metadata: any
  ): Promise<VerificationDocument> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    // Check if user already has a pending verification
    const existingPending = await VerificationDocument.findOne({
      where: {
        userId,
        type: documentType,
        status: 'pending'
      }
    });

    if (existingPending) {
      throw new Error('Verification request already pending for this document type');
    }

    // Create verification document record
    const verificationDocument = await VerificationDocument.create({
      userId,
      type: documentType,
      fileName,
      fileUrl,
      fileHash,
      status: 'pending',
      metadata
    });

    return verificationDocument;
  }

  /**
   * Approve verification document
   */
  async approveVerificationDocument(documentId: string, adminId: string): Promise<VerificationDocument> {
    const document = await VerificationDocument.findByPk(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'approved';
    document.verifiedAt = new Date();
    document.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
    await document.save();

    // Update user verification status
    const user = await User.findByPk(document.userId);
    if (user) {
      user.profile.verified = true;
      user.profile.verificationLevel = this.calculateVerificationLevel(document.userId);
      await user.save();
    }

    return document;
  }

  /**
   * Reject verification document
   */
  async rejectVerificationDocument(documentId: string, rejectionReason: string, adminId: string): Promise<VerificationDocument> {
    const document = await VerificationDocument.findByPk(documentId);
    if (!document) {
      throw new Error('Document not found');
    }

    document.status = 'rejected';
    document.rejectionReason = rejectionReason;
    await document.save();

    return document;
  }

  /**
   * Get user verification status
   */
  async getUserVerificationStatus(userId: string): Promise<{
    verified: boolean;
    verificationLevel: string;
    documents: VerificationDocument[];
  }> {
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }

    const documents = await VerificationDocument.findAll({
      where: { userId },
      order: [['createdAt', 'DESC']]
    });

    return {
      verified: user.profile.verified,
      verificationLevel: user.profile.verificationLevel,
      documents
    };
  }

  /**
   * Calculate verification level based on submitted documents
   */
  private async calculateVerificationLevel(userId: string): Promise<string> {
    const documents = await VerificationDocument.findAll({
      where: { 
        userId,
        status: 'approved',
        expiresAt: { $gt: new Date() }
      }
    });

    const approvedTypes = documents.map(doc => doc.type);
    
    if (approvedTypes.includes('photo_id') && approvedTypes.includes('selfie')) {
      return 'verified';
    } else if (approvedTypes.includes('photo_id')) {
      return 'photo_verified';
    } else if (approvedTypes.includes('utility_bill') || approvedTypes.includes('bank_statement')) {
      return 'address_verified';
    }

    return 'none';
  }

  /**
   * Get pending verifications for admin review
   */
  async getPendingVerifications(page: number = 1, limit: number = 20): Promise<{
    documents: VerificationDocument[];
    total: number;
    page: number;
    totalPages: number;
  }> {
    const offset = (page - 1) * limit;
    
    const { rows: documents, count: total } = await VerificationDocument.findAndCountAll({
      where: { status: 'pending' },
      include: [{ model: User, attributes: ['username', 'email'] }],
      limit,
      offset,
      order: [['createdAt', 'DESC']]
    });

    return {
      documents,
      total,
      page,
      totalPages: Math.ceil(total / limit)
    };
  }

  /**
   * Check if user can submit more documents
   */
  async canSubmitDocument(userId: string, documentType: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    // Check for existing approved document of same type
    const existingApproved = await VerificationDocument.findOne({
      where: {
        userId,
        type: documentType,
        status: 'approved',
        expiresAt: { $gt: new Date() }
      }
    });

    if (existingApproved) {
      return false;
    }

    // Check for pending document of same type
    const existingPending = await VerificationDocument.findOne({
      where: {
        userId,
        type: documentType,
        status: 'pending'
      }
    });

    return !existingPending;
  }

  /**
   * Expire old verification documents
   */
  async expireOldDocuments(): Promise<number> {
    const result = await VerificationDocument.update(
      { status: 'expired' },
      {
        where: {
          status: 'approved',
          expiresAt: { $lt: new Date() }
        }
      }
    );

    // Update user verification status if documents expired
    const expiredUsers = await VerificationDocument.findAll({
      attributes: ['userId'],
      where: {
        status: 'expired',
        expiresAt: { $lt: new Date() }
      },
      group: ['userId']
    });

    for (const expiredUser of expiredUsers) {
      const user = await User.findByPk(expiredUser.userId);
      if (user) {
        user.profile.verified = false;
        user.profile.verificationLevel = 'none';
        await user.save();
      }
    }

    return result[0];
  }

  /**
   * Get verification statistics for admin dashboard
   */
  async getVerificationStats(): Promise<{
    total: number;
    pending: number;
    approved: number;
    rejected: number;
    expired: number;
    verificationTypes: { [key: string]: number };
  }> {
    const total = await VerificationDocument.count();
    const pending = await VerificationDocument.count({ where: { status: 'pending' } });
    const approved = await VerificationDocument.count({ where: { status: 'approved' } });
    const rejected = await VerificationDocument.count({ where: { status: 'rejected' } });
    const expired = await VerificationDocument.count({ where: { status: 'expired' } });

    const verificationTypes = await VerificationDocument.findAll({
      attributes: ['type'],
      group: ['type'],
      raw: true
    });

    const typeCounts: { [key: string]: number } = {};
    for (const type of verificationTypes) {
      const count = await VerificationDocument.count({ where: { type: type.type } });
      typeCounts[type.type] = count;
    }

    return {
      total,
      pending,
      approved,
      rejected,
      expired,
      verificationTypes: typeCounts
    };
  }

  /**
   * Initiate selfie liveness verification session with Jumio
   * @param userId - User ID
   * @param callbackUrl - Callback URL for verification results
   * @returns Verification session information
   */
  async initiateSelfieVerification(userId: string, callbackUrl: string): Promise<{
    sessionToken: string;
    verificationUrl: string;
    transactionId: string;
    requiresManualReview: boolean;
  }> {
    try {
      // Check if Jumio service is configured
      if (!this.jumioService.isConfigured()) {
        throw new Error('Liveness verification service not configured');
      }

      // Initiate verification session with Jumio
      const session = await this.jumioService.initiateVerificationSession(userId, callbackUrl);

      // Create a verification document record for tracking
      const verificationDocument = await VerificationDocument.create({
        userId,
        type: 'selfie',
        fileName: `selfie_verification_${userId}_${Date.now()}`,
        fileUrl: '', // Will be updated after verification
        fileHash: '',
        status: 'pending',
        metadata: {
          verificationType: 'liveness',
          service: 'jumio',
          transactionId: session.transactionId,
          sessionToken: session.sessionToken,
          initiatedAt: new Date().toISOString()
        }
      });

      return {
        sessionToken: session.sessionToken,
        verificationUrl: session.verificationUrl,
        transactionId: session.transactionId,
        requiresManualReview: false
      };
    } catch (error: any) {
      console.error('Selfie verification initiation error:', error.message);
      throw new Error(`Failed to initiate selfie verification: ${error.message}`);
    }
  }

  /**
   * Process Jumio webhook callback for selfie verification
   * @param payload - Webhook payload
   * @param signature - Webhook signature
   * @returns Processing result
   */
  async processSelfieVerificationWebhook(payload: any, signature: string): Promise<{
    success: boolean;
    userId: string;
    documentId?: string;
    status: string;
    message: string;
  }> {
    try {
      // Process the webhook through Jumio service
      const result = await this.jumioService.processWebhook(payload, signature);

      if (!result.valid) {
        return {
          success: false,
          userId: '',
          status: 'invalid',
          message: result.error || 'Invalid webhook signature'
        };
      }

      // Find the verification document
      const document = await VerificationDocument.findOne({
        where: {
          userId: result.userId,
          type: 'selfie',
          status: 'pending',
          metadata: {
            transactionId: payload.transactionId
          }
        }
      });

      if (!document) {
        return {
          success: false,
          userId: result.userId,
          status: 'not_found',
          message: 'Verification document not found'
        };
      }

      // Update document based on verification result
      if (result.status === 'APPROVED' && result.verificationData) {
        document.status = 'approved';
        document.verifiedAt = new Date();
        document.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        document.metadata = {
          ...document.metadata,
          verificationResult: result.verificationData,
          completedAt: new Date().toISOString()
        };

        // Update user verification status
        const user = await User.findByPk(result.userId);
        if (user) {
          user.profile.verified = true;
          user.profile.verificationLevel = this.calculateVerificationLevel(result.userId);
          await user.save();
        }

        await document.save();

        return {
          success: true,
          userId: result.userId,
          documentId: document.id,
          status: 'approved',
          message: 'Selfie verification approved'
        };
      } else if (result.status === 'REJECTED' || result.status === 'ERROR') {
        document.status = 'rejected';
        document.rejectionReason = result.error || 'Verification failed';
        document.metadata = {
          ...document.metadata,
          verificationResult: result.verificationData,
          completedAt: new Date().toISOString()
        };

        await document.save();

        return {
          success: true,
          userId: result.userId,
          documentId: document.id,
          status: 'rejected',
          message: result.error || 'Selfie verification rejected'
        };
      } else {
        // Still pending
        return {
          success: true,
          userId: result.userId,
          documentId: document.id,
          status: 'pending',
          message: 'Verification still in progress'
        };
      }
    } catch (error: any) {
      console.error('Selfie verification webhook processing error:', error.message);
      return {
        success: false,
        userId: '',
        status: 'error',
        message: error.message || 'Failed to process verification webhook'
      };
    }
  }

  /**
   * Check selfie verification status
   * @param userId - User ID
   * @param transactionId - Jumio transaction ID
   * @returns Verification status
   */
  async checkSelfieVerificationStatus(userId: string, transactionId: string): Promise<{
    status: string;
    verificationResult?: any;
    error?: string;
    documentId?: string;
  }> {
    try {
      // Check status with Jumio
      const jumioStatus = await this.jumioService.checkVerificationStatus(transactionId);

      // Find the verification document
      const document = await VerificationDocument.findOne({
        where: {
          userId,
          type: 'selfie',
          metadata: {
            transactionId
          }
        }
      });

      return {
        status: jumioStatus.status,
        verificationResult: jumioStatus.verificationResult,
        error: jumioStatus.error,
        documentId: document?.id
      };
    } catch (error: any) {
      console.error('Selfie verification status check error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get Jumio service status
   * @returns Service status information
   */
  getJumioServiceStatus(): {
    configured: boolean;
    serviceName: string;
    apiUrl: string;
  } {
    return this.jumioService.getServiceStatus();
  }

  /**
   * Initiate background check with Checkr
   * @param userId - User ID
   * @param callbackUrl - Callback URL for background check results
   * @param candidateData - Candidate information for background check
   * @returns Background check information
   */
  async initiateBackgroundCheck(
    userId: string,
    callbackUrl: string,
    candidateData: {
      firstName: string;
      lastName: string;
      email: string;
      phone: string;
      dob: string;
      ssn: string;
      address: {
        street: string;
        city: string;
        state: string;
        zipCode: string;
      };
    }
  ): Promise<{
    backgroundCheckId: string;
    statusUrl: string;
    documentId: string;
  }> {
    try {
      // Check if Checkr service is configured
      if (!this.checkrService.isConfigured()) {
        throw new Error('Background check service not configured');
      }

      // Initiate background check with Checkr
      const checkrResponse = await this.checkrService.initiateBackgroundCheck(
        userId,
        callbackUrl,
        candidateData
      );

      // Create a verification document record for tracking
      const verificationDocument = await VerificationDocument.create({
        userId,
        type: 'background_check',
        fileName: `background_check_${userId}_${Date.now()}`,
        fileUrl: '', // Will be updated after verification
        fileHash: '',
        status: 'pending',
        metadata: {
          verificationType: 'background_check',
          service: 'checkr',
          backgroundCheckId: checkrResponse.backgroundCheckId,
          initiatedAt: new Date().toISOString(),
          candidateData: {
            firstName: candidateData.firstName,
            lastName: candidateData.lastName,
            email: candidateData.email,
            // Don't store sensitive data like SSN in metadata
          }
        }
      });

      return {
        backgroundCheckId: checkrResponse.backgroundCheckId,
        statusUrl: checkrResponse.statusUrl,
        documentId: verificationDocument.id
      };
    } catch (error: any) {
      console.error('Background check initiation error:', error.message);
      throw new Error(`Failed to initiate background check: ${error.message}`);
    }
  }

  /**
   * Process Checkr webhook callback for background check
   * @param payload - Webhook payload
   * @param signature - Webhook signature
   * @returns Processing result
   */
  async processBackgroundCheckWebhook(payload: any, signature: string): Promise<{
    success: boolean;
    userId: string;
    documentId?: string;
    status: string;
    message: string;
  }> {
    try {
      // Process the webhook through Checkr service
      const result = await this.checkrService.processWebhook(payload, signature);

      if (!result.valid) {
        return {
          success: false,
          userId: '',
          status: 'invalid',
          message: result.error || 'Invalid webhook signature'
        };
      }

      // Find the verification document
      const document = await VerificationDocument.findOne({
        where: {
          userId: result.userId,
          type: 'background_check',
          status: 'pending',
          metadata: {
            backgroundCheckId: result.backgroundCheckId
          }
        }
      });

      if (!document) {
        return {
          success: false,
          userId: result.userId,
          status: 'not_found',
          message: 'Background check document not found'
        };
      }

      // Update document based on background check result
      if (result.status === 'complete' && result.backgroundCheckData) {
        document.status = 'approved';
        document.verifiedAt = new Date();
        document.expiresAt = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 1 year
        document.metadata = {
          ...document.metadata,
          backgroundCheckResult: result.backgroundCheckData,
          completedAt: new Date().toISOString()
        };

        // Update user verification status
        const user = await User.findByPk(result.userId);
        if (user) {
          user.profile.verified = true;
          user.profile.verificationLevel = this.calculateVerificationLevel(result.userId);
          await user.save();
        }

        await document.save();

        return {
          success: true,
          userId: result.userId,
          documentId: document.id,
          status: 'approved',
          message: 'Background check completed successfully'
        };
      } else if (result.status === 'canceled' || result.status === 'error') {
        document.status = 'rejected';
        document.rejectionReason = result.error || 'Background check failed';
        document.metadata = {
          ...document.metadata,
          backgroundCheckResult: result.backgroundCheckData,
          completedAt: new Date().toISOString()
        };

        await document.save();

        return {
          success: true,
          userId: result.userId,
          documentId: document.id,
          status: 'rejected',
          message: result.error || 'Background check failed'
        };
      } else {
        // Still pending
        return {
          success: true,
          userId: result.userId,
          documentId: document.id,
          status: 'pending',
          message: 'Background check still in progress'
        };
      }
    } catch (error: any) {
      console.error('Background check webhook processing error:', error.message);
      return {
        success: false,
        userId: '',
        status: 'error',
        message: error.message || 'Failed to process background check webhook'
      };
    }
  }

  /**
   * Check background check status
   * @param userId - User ID
   * @param backgroundCheckId - Checkr background check ID
   * @returns Background check status
   */
  async checkBackgroundCheckStatus(userId: string, backgroundCheckId: string): Promise<{
    status: string;
    backgroundCheckResult?: any;
    error?: string;
    documentId?: string;
  }> {
    try {
      // Check status with Checkr
      const checkrStatus = await this.checkrService.checkBackgroundCheckStatus(backgroundCheckId);

      // Find the verification document
      const document = await VerificationDocument.findOne({
        where: {
          userId,
          type: 'background_check',
          metadata: {
            backgroundCheckId
          }
        }
      });

      return {
        status: checkrStatus.status,
        backgroundCheckResult: checkrStatus.backgroundCheckResult,
        error: checkrStatus.error,
        documentId: document?.id
      };
    } catch (error: any) {
      console.error('Background check status check error:', error.message);
      return {
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Get Checkr service status
   * @returns Service status information
   */
  getCheckrServiceStatus(): {
    configured: boolean;
    serviceName: string;
    apiUrl: string;
  } {
    return this.checkrService.getServiceStatus();
  }

  /**
   * Get available background check packages
   * @returns Array of available background check packages
   */
  getAvailableBackgroundCheckPackages(): string[] {
    return this.checkrService.getAvailablePackages();
  }
}