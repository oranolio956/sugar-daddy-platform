import { User } from '../models/User';
import { VerificationDocument } from '../models/VerificationDocument';
import { SecurityUtils } from '../utils/security';

export class VerificationService {
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
}