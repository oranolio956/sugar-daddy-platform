/**
 * Verification Service Tests
 * 
 * Comprehensive test suite for the verification service including selfie liveness verification.
 */

import { VerificationService } from './verificationService';
import { JumioService } from './jumioService';
import { User } from '../models/User';
import { VerificationDocument } from '../models/VerificationDocument';
import { Profile } from '../models/Profile';

// Mock the Jumio service
jest.mock('./jumioService');

describe('VerificationService', () => {
  let verificationService: VerificationService;
  let mockJumioService: jest.Mocked<JumioService>;

  beforeEach(() => {
    verificationService = new VerificationService();
    mockJumioService = new JumioService() as jest.Mocked<JumioService>;
    
    // Replace the jumioService in verificationService with our mock
    (verificationService as any).jumioService = mockJumioService;
  });

  describe('initiateSelfieVerification', () => {
    it('should initiate selfie verification session successfully', async () => {
      // Mock Jumio service response
      mockJumioService.isConfigured.mockReturnValue(true);
      mockJumioService.initiateVerificationSession.mockResolvedValue({
        sessionToken: 'test-session-token',
        verificationUrl: 'https://jumio.com/verify/test',
        transactionId: 'txn_123'
      });

      // Mock User and VerificationDocument
      const mockUser = {
        id: 'user_123',
        profile: {
          verified: false,
          verificationLevel: 'none'
        }
      };

      // Mock VerificationDocument.create
      const mockCreate = jest.spyOn(VerificationDocument, 'create');
      mockCreate.mockResolvedValue({
        id: 'doc_123',
        userId: 'user_123',
        type: 'selfie',
        status: 'pending',
        metadata: {
          verificationType: 'liveness',
          service: 'jumio',
          transactionId: 'txn_123'
        }
      } as any);

      const result = await verificationService.initiateSelfieVerification('user_123', 'https://callback.url');

      expect(result).toBeDefined();
      expect(result.sessionToken).toBe('test-session-token');
      expect(result.verificationUrl).toBe('https://jumio.com/verify/test');
      expect(result.transactionId).toBe('txn_123');
      expect(result.requiresManualReview).toBe(false);
    });

    it('should throw error when Jumio service is not configured', async () => {
      mockJumioService.isConfigured.mockReturnValue(false);

      await expect(
        verificationService.initiateSelfieVerification('user_123', 'https://callback.url')
      ).rejects.toThrow('Liveness verification service not configured');
    });

    it('should throw error when Jumio session initiation fails', async () => {
      mockJumioService.isConfigured.mockReturnValue(true);
      mockJumioService.initiateVerificationSession.mockRejectedValue(
        new Error('Jumio API error')
      );

      await expect(
        verificationService.initiateSelfieVerification('user_123', 'https://callback.url')
      ).rejects.toThrow('Failed to initiate selfie verification: Jumio API error');
    });
  });

  describe('processSelfieVerificationWebhook', () => {
    it('should process valid webhook and approve verification', async () => {
      // Mock webhook processing
      mockJumioService.processWebhook.mockResolvedValue({
        valid: true,
        userId: 'user_123',
        status: 'APPROVED',
        verificationData: {
          livenessScore: 0.95,
          identityMatch: true
        }
      });

      // Mock VerificationDocument.findOne
      const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
      mockFindOne.mockResolvedValue({
        id: 'doc_123',
        userId: 'user_123',
        type: 'selfie',
        status: 'pending',
        metadata: {
          transactionId: 'txn_123'
        },
        save: jest.fn().mockResolvedValue(true)
      } as any);

      // Mock User.findByPk
      const mockUserFind = jest.spyOn(User, 'findByPk');
      mockUserFind.mockResolvedValue({
        id: 'user_123',
        profile: {
          verified: false,
          verificationLevel: 'none'
        },
        save: jest.fn().mockResolvedValue(true)
      } as any);

      const result = await verificationService.processSelfieVerificationWebhook(
        {
          customerInternalReference: 'user_123',
          status: 'APPROVED',
          transactionId: 'txn_123',
          verificationResult: {
            livenessScore: 0.95,
            identityMatch: true
          }
        },
        'valid-signature'
      );

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.status).toBe('approved');
      expect(result.message).toBe('Selfie verification approved');
    });

    it('should process valid webhook and reject verification', async () => {
      // Mock webhook processing
      mockJumioService.processWebhook.mockResolvedValue({
        valid: true,
        userId: 'user_123',
        status: 'REJECTED',
        error: 'Liveness detection failed'
      });

      // Mock VerificationDocument.findOne
      const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
      mockFindOne.mockResolvedValue({
        id: 'doc_123',
        userId: 'user_123',
        type: 'selfie',
        status: 'pending',
        metadata: {
          transactionId: 'txn_123'
        },
        save: jest.fn().mockResolvedValue(true)
      } as any);

      const result = await verificationService.processSelfieVerificationWebhook(
        {
          customerInternalReference: 'user_123',
          status: 'REJECTED',
          transactionId: 'txn_123',
          error: 'Liveness detection failed'
        },
        'valid-signature'
      );

      expect(result.success).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.status).toBe('rejected');
      expect(result.message).toBe('Liveness detection failed');
    });

    it('should handle invalid webhook signature', async () => {
      // Mock webhook processing with invalid signature
      mockJumioService.processWebhook.mockResolvedValue({
        valid: false,
        userId: '',
        status: 'invalid',
        error: 'Invalid webhook signature'
      });

      const result = await verificationService.processSelfieVerificationWebhook(
        {},
        'invalid-signature'
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('invalid');
      expect(result.message).toBe('Invalid webhook signature');
    });

    it('should handle missing verification document', async () => {
      // Mock webhook processing
      mockJumioService.processWebhook.mockResolvedValue({
        valid: true,
        userId: 'user_123',
        status: 'APPROVED'
      });

      // Mock VerificationDocument.findOne to return null
      const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
      mockFindOne.mockResolvedValue(null);

      const result = await verificationService.processSelfieVerificationWebhook(
        {
          customerInternalReference: 'user_123',
          status: 'APPROVED',
          transactionId: 'txn_123'
        },
        'valid-signature'
      );

      expect(result.success).toBe(false);
      expect(result.status).toBe('not_found');
      expect(result.message).toBe('Verification document not found');
    });
  });

  describe('checkSelfieVerificationStatus', () => {
    it('should return verification status successfully', async () => {
      // Mock Jumio service response
      mockJumioService.checkVerificationStatus.mockResolvedValue({
        status: 'APPROVED',
        verificationResult: {
          livenessScore: 0.95
        }
      });

      // Mock VerificationDocument.findOne
      const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
      mockFindOne.mockResolvedValue({
        id: 'doc_123',
        userId: 'user_123',
        type: 'selfie',
        metadata: {
          transactionId: 'txn_123'
        }
      } as any);

      const result = await verificationService.checkSelfieVerificationStatus('user_123', 'txn_123');

      expect(result.status).toBe('APPROVED');
      expect(result.verificationResult).toBeDefined();
      expect(result.documentId).toBe('doc_123');
    });

    it('should handle verification status check error', async () => {
      // Mock Jumio service to throw error
      mockJumioService.checkVerificationStatus.mockRejectedValue(
        new Error('API error')
      );

      const result = await verificationService.checkSelfieVerificationStatus('user_123', 'txn_123');

      expect(result.status).toBe('error');
      expect(result.error).toBe('API error');
    });
  });

  describe('getJumioServiceStatus', () => {
    it('should return service status', () => {
      mockJumioService.getServiceStatus.mockReturnValue({
        configured: true,
        serviceName: 'Jumio Identity Verification',
        apiUrl: 'https://api.jumio.com'
      });

      const status = verificationService.getJumioServiceStatus();

      expect(status.configured).toBe(true);
      expect(status.serviceName).toBe('Jumio Identity Verification');
    });
  });

  describe('calculateVerificationLevel', () => {
    it('should calculate verification level correctly', async () => {
      // Mock VerificationDocument.findAll
      const mockFindAll = jest.spyOn(VerificationDocument, 'findAll');
      mockFindAll.mockResolvedValue([
        {
          type: 'photo_id',
          status: 'approved',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        } as any,
        {
          type: 'selfie',
          status: 'approved',
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000)
        } as any
      ]);

      const level = await (verificationService as any).calculateVerificationLevel('user_123');

      expect(level).toBe('verified');
    });

    it('should return none when no valid documents', async () => {
      // Mock VerificationDocument.findAll to return empty array
      const mockFindAll = jest.spyOn(VerificationDocument, 'findAll');
      mockFindAll.mockResolvedValue([]);

      const level = await (verificationService as any).calculateVerificationLevel('user_123');

      expect(level).toBe('none');
    });
  });
});

  describe('Background Check Methods', () => {
    let mockCheckrService: jest.Mocked<CheckrService>;

    beforeEach(() => {
      mockCheckrService = new CheckrService() as jest.Mocked<CheckrService>;
      (verificationService as any).checkrService = mockCheckrService;
    });

    describe('initiateBackgroundCheck', () => {
      it('should initiate background check successfully', async () => {
        // Mock Checkr service response
        mockCheckrService.isConfigured.mockReturnValue(true);
        mockCheckrService.initiateBackgroundCheck.mockResolvedValue({
          backgroundCheckId: 'bgc_123',
          statusUrl: 'https://api.checkr.com/v1/background_checks/bgc_123',
          webhookUrl: 'https://callback.url'
        });

        // Mock VerificationDocument.create
        const mockCreate = jest.spyOn(VerificationDocument, 'create');
        mockCreate.mockResolvedValue({
          id: 'doc_123',
          userId: 'user_123',
          type: 'background_check',
          status: 'pending',
          metadata: {
            backgroundCheckId: 'bgc_123',
            service: 'checkr'
          }
        } as any);

        const candidateData = {
          firstName: 'John',
          lastName: 'Doe',
          email: 'john@example.com',
          phone: '555-123-4567',
          dob: '1980-01-01',
          ssn: '123-45-6789',
          address: {
            street: '123 Main St',
            city: 'Anytown',
            state: 'CA',
            zipCode: '90210'
          }
        };

        const result = await verificationService.initiateBackgroundCheck(
          'user_123',
          'https://callback.url',
          candidateData
        );

        expect(result).toBeDefined();
        expect(result.backgroundCheckId).toBe('bgc_123');
        expect(result.statusUrl).toBe('https://api.checkr.com/v1/background_checks/bgc_123');
        expect(result.documentId).toBe('doc_123');
      });

      it('should throw error when Checkr service is not configured', async () => {
        mockCheckrService.isConfigured.mockReturnValue(false);

        await expect(
          verificationService.initiateBackgroundCheck(
            'user_123',
            'https://callback.url',
            {
              firstName: 'John',
              lastName: 'Doe',
              email: 'john@example.com',
              phone: '555-123-4567',
              dob: '1980-01-01',
              ssn: '123-45-6789',
              address: {
                street: '123 Main St',
                city: 'Anytown',
                state: 'CA',
                zipCode: '90210'
              }
            }
          )
        ).rejects.toThrow('Background check service not configured');
      });
    });

    describe('processBackgroundCheckWebhook', () => {
      it('should process valid webhook and approve background check', async () => {
        // Mock webhook processing
        mockCheckrService.processWebhook.mockResolvedValue({
          valid: true,
          userId: 'user_123',
          backgroundCheckId: 'bgc_123',
          status: 'complete',
          backgroundCheckData: {
            criminal_records: [],
            education_verification: {}
          }
        });

        // Mock VerificationDocument.findOne
        const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
        mockFindOne.mockResolvedValue({
          id: 'doc_123',
          userId: 'user_123',
          type: 'background_check',
          status: 'pending',
          metadata: {
            backgroundCheckId: 'bgc_123'
          },
          save: jest.fn().mockResolvedValue(true)
        } as any);

        // Mock User.findByPk
        const mockUserFind = jest.spyOn(User, 'findByPk');
        mockUserFind.mockResolvedValue({
          id: 'user_123',
          profile: {
            verified: false,
            verificationLevel: 'none'
          },
          save: jest.fn().mockResolvedValue(true)
        } as any);

        const result = await verificationService.processBackgroundCheckWebhook(
          {
            object: {
              id: 'bgc_123',
              custom_id: 'user_123',
              status: 'complete',
              report: {}
            }
          },
          'valid-signature'
        );

        expect(result.success).toBe(true);
        expect(result.userId).toBe('user_123');
        expect(result.documentId).toBe('doc_123');
        expect(result.status).toBe('approved');
        expect(result.message).toBe('Background check completed successfully');
      });

      it('should process valid webhook and reject background check', async () => {
        // Mock webhook processing
        mockCheckrService.processWebhook.mockResolvedValue({
          valid: true,
          userId: 'user_123',
          backgroundCheckId: 'bgc_123',
          status: 'canceled',
          error: 'Background check failed'
        });

        // Mock VerificationDocument.findOne
        const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
        mockFindOne.mockResolvedValue({
          id: 'doc_123',
          userId: 'user_123',
          type: 'background_check',
          status: 'pending',
          metadata: {
            backgroundCheckId: 'bgc_123'
          },
          save: jest.fn().mockResolvedValue(true)
        } as any);

        const result = await verificationService.processBackgroundCheckWebhook(
          {
            object: {
              id: 'bgc_123',
              custom_id: 'user_123',
              status: 'canceled'
            }
          },
          'valid-signature'
        );

        expect(result.success).toBe(true);
        expect(result.userId).toBe('user_123');
        expect(result.documentId).toBe('doc_123');
        expect(result.status).toBe('rejected');
        expect(result.message).toBe('Background check failed');
      });

      it('should handle invalid webhook signature', async () => {
        // Mock webhook processing with invalid signature
        mockCheckrService.processWebhook.mockResolvedValue({
          valid: false,
          userId: '',
          backgroundCheckId: '',
          status: 'invalid',
          error: 'Invalid webhook signature'
        });

        const result = await verificationService.processBackgroundCheckWebhook(
          {},
          'invalid-signature'
        );

        expect(result.success).toBe(false);
        expect(result.status).toBe('invalid');
        expect(result.message).toBe('Invalid webhook signature');
      });

      it('should handle missing background check document', async () => {
        // Mock webhook processing
        mockCheckrService.processWebhook.mockResolvedValue({
          valid: true,
          userId: 'user_123',
          backgroundCheckId: 'bgc_123',
          status: 'complete'
        });

        // Mock VerificationDocument.findOne to return null
        const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
        mockFindOne.mockResolvedValue(null);

        const result = await verificationService.processBackgroundCheckWebhook(
          {
            object: {
              id: 'bgc_123',
              custom_id: 'user_123',
              status: 'complete'
            }
          },
          'valid-signature'
        );

        expect(result.success).toBe(false);
        expect(result.status).toBe('not_found');
        expect(result.message).toBe('Background check document not found');
      });
    });

    describe('checkBackgroundCheckStatus', () => {
      it('should return background check status successfully', async () => {
        // Mock Checkr service response
        mockCheckrService.checkBackgroundCheckStatus.mockResolvedValue({
          status: 'complete',
          backgroundCheckResult: {
            criminal_records: []
          },
          completedAt: '2023-01-01T00:00:00Z'
        });

        // Mock VerificationDocument.findOne
        const mockFindOne = jest.spyOn(VerificationDocument, 'findOne');
        mockFindOne.mockResolvedValue({
          id: 'doc_123',
          userId: 'user_123',
          type: 'background_check',
          metadata: {
            backgroundCheckId: 'bgc_123'
          }
        } as any);

        const result = await verificationService.checkBackgroundCheckStatus('user_123', 'bgc_123');

        expect(result.status).toBe('complete');
        expect(result.backgroundCheckResult).toBeDefined();
        expect(result.documentId).toBe('doc_123');
      });

      it('should handle background check status check error', async () => {
        // Mock Checkr service to throw error
        mockCheckrService.checkBackgroundCheckStatus.mockRejectedValue(
          new Error('API error')
        );

        const result = await verificationService.checkBackgroundCheckStatus('user_123', 'bgc_123');

        expect(result.status).toBe('error');
        expect(result.error).toBe('API error');
      });
    });

    describe('getCheckrServiceStatus', () => {
      it('should return Checkr service status', () => {
        mockCheckrService.getServiceStatus.mockReturnValue({
          configured: true,
          serviceName: 'Checkr Background Checks',
          apiUrl: 'https://api.checkr.com'
        });

        const status = verificationService.getCheckrServiceStatus();

        expect(status.configured).toBe(true);
        expect(status.serviceName).toBe('Checkr Background Checks');
      });
    });

    describe('getAvailableBackgroundCheckPackages', () => {
      it('should return available background check packages', () => {
        mockCheckrService.getAvailablePackages.mockReturnValue([
          'driver_pro',
          'criminal',
          'education_verification'
        ]);

        const packages = verificationService.getAvailableBackgroundCheckPackages();

        expect(packages).toBeDefined();
        expect(Array.isArray(packages)).toBe(true);
        expect(packages).toContain('driver_pro');
      });
    });
  });

// Clean up mocks after tests
afterAll(() => {
  jest.restoreAllMocks();
});