/**
 * Jumio Service Tests
 * 
 * Comprehensive test suite for the Jumio identity verification service.
 */

import { JumioService } from './jumioService';
import axios from 'axios';
import { jumioConfig } from '../config/jumioConfig';

// Mock axios
jest.mock('axios');
const mockedAxios = axios as jest.Mocked<typeof axios>;

describe('JumioService', () => {
  let jumioService: JumioService;

  beforeEach(() => {
    // Set up environment variables for testing
    process.env.JUMIO_API_KEY = 'test_api_key';
    process.env.JUMIO_API_SECRET = 'test_api_secret';
    process.env.JUMIO_API_URL = 'https://api.test.jumio.com';
    process.env.JUMIO_WEBHOOK_TOKEN = 'test_webhook_token';

    jumioService = new JumioService();
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('constructor', () => {
    it('should initialize with environment variables', () => {
      expect(jumioService['apiKey']).toBe('test_api_key');
      expect(jumioService['apiSecret']).toBe('test_api_secret');
      expect(jumioService['apiUrl']).toBe('https://api.test.jumio.com');
      expect(jumioService['webhookToken']).toBe('test_webhook_token');
    });

    it('should warn when credentials are not configured', () => {
      // Clear environment variables
      delete process.env.JUMIO_API_KEY;
      delete process.env.JUMIO_API_SECRET;

      const consoleWarnSpy = jest.spyOn(console, 'warn');
      const service = new JumioService();

      expect(consoleWarnSpy).toHaveBeenCalledWith(
        'Jumio API credentials not configured. Liveness verification will be disabled.'
      );

      consoleWarnSpy.mockRestore();
    });
  });

  describe('isConfigured', () => {
    it('should return true when configured', () => {
      expect(jumioService.isConfigured()).toBe(true);
    });

    it('should return false when not configured', () => {
      // Clear environment variables
      delete process.env.JUMIO_API_KEY;
      delete process.env.JUMIO_API_SECRET;

      const service = new JumioService();
      expect(service.isConfigured()).toBe(false);
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status', () => {
      const status = jumioService.getServiceStatus();

      expect(status).toEqual({
        configured: true,
        serviceName: 'Jumio Identity Verification',
        apiUrl: 'https://api.test.jumio.com'
      });
    });
  });

  describe('initiateVerificationSession', () => {
    it('should initiate verification session successfully', async () => {
      // Mock axios response
      mockedAxios.post.mockResolvedValue({
        data: {
          sessionToken: 'test-session-token',
          redirectUrl: 'https://jumio.com/verify/test'
        }
      });

      const result = await jumioService.initiateVerificationSession(
        'user_123',
        'https://callback.url'
      );

      expect(result).toEqual({
        sessionToken: 'test-session-token',
        verificationUrl: 'https://jumio.com/verify/test',
        transactionId: expect.stringContaining('txn_')
      });

      // Verify axios was called with correct parameters
      expect(mockedAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('/v4/verifications'),
        expect.objectContaining({
          customerInternalReference: 'user_123',
          successUrl: 'https://callback.url/success',
          errorUrl: 'https://callback.url/error',
          callbackUrl: 'https://callback.url/callback',
          userReference: 'user_123',
          verificationType: 'IDENTITY_VERIFICATION',
          workflowId: 'sugar_daddy_platform_workflow'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Basic'),
            'User-Agent': 'SugarDaddyPlatform/1.0'
          })
        })
      );
    });

    it('should throw error when service is not configured', async () => {
      // Clear environment variables
      delete process.env.JUMIO_API_KEY;
      delete process.env.JUMIO_API_SECRET;

      const service = new JumioService();

      await expect(
        service.initiateVerificationSession('user_123', 'https://callback.url')
      ).rejects.toThrow('Jumio service not configured');
    });

    it('should throw error when API call fails', async () => {
      // Mock axios to reject
      mockedAxios.post.mockRejectedValue(new Error('API error'));

      await expect(
        jumioService.initiateVerificationSession('user_123', 'https://callback.url')
      ).rejects.toThrow('Failed to initiate verification session: API error');
    });

    it('should throw error when response is invalid', async () => {
      // Mock axios with invalid response
      mockedAxios.post.mockResolvedValue({ data: {} });

      await expect(
        jumioService.initiateVerificationSession('user_123', 'https://callback.url')
      ).rejects.toThrow('Invalid response from Jumio API');
    });
  });

  describe('checkVerificationStatus', () => {
    it('should check verification status successfully', async () => {
      // Mock axios response
      mockedAxios.get.mockResolvedValue({
        data: {
          status: 'APPROVED',
          verificationResult: {
            livenessScore: 0.95
          }
        }
      });

      const result = await jumioService.checkVerificationStatus('txn_123');

      expect(result).toEqual({
        status: 'APPROVED',
        verificationResult: {
          livenessScore: 0.95
        }
      });

      // Verify axios was called with correct parameters
      expect(mockedAxios.get).toHaveBeenCalledWith(
        expect.stringContaining('/v4/verifications/txn_123'),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Authorization': expect.stringContaining('Basic'),
            'User-Agent': 'SugarDaddyPlatform/1.0'
          })
        })
      );
    });

    it('should throw error when service is not configured', async () => {
      // Clear environment variables
      delete process.env.JUMIO_API_KEY;
      delete process.env.JUMIO_API_SECRET;

      const service = new JumioService();

      await expect(
        service.checkVerificationStatus('txn_123')
      ).rejects.toThrow('Jumio service not configured');
    });

    it('should throw error when API call fails', async () => {
      // Mock axios to reject
      mockedAxios.get.mockRejectedValue(new Error('API error'));

      await expect(
        jumioService.checkVerificationStatus('txn_123')
      ).rejects.toThrow('Failed to check verification status: API error');
    });
  });

  describe('processWebhook', () => {
    it('should process valid webhook successfully', async () => {
      const payload = {
        customerInternalReference: 'user_123',
        status: 'APPROVED',
        transactionId: 'txn_123',
        verificationResult: {
          livenessScore: 0.95
        }
      };

      const result = await jumioService.processWebhook(payload, 'valid-signature');

      expect(result).toEqual({
        valid: true,
        userId: 'user_123',
        status: 'APPROVED',
        verificationData: {
          livenessScore: 0.95
        }
      });
    });

    it('should handle invalid webhook signature', async () => {
      const payload = {
        customerInternalReference: 'user_123',
        status: 'APPROVED'
      };

      const result = await jumioService.processWebhook(payload, 'invalid-signature');

      expect(result).toEqual({
        valid: false,
        userId: '',
        status: 'invalid',
        error: 'Invalid webhook signature'
      });
    });

    it('should handle webhook processing error', async () => {
      // Mock generateWebhookSignature to throw error
      const originalMethod = (jumioService as any).generateWebhookSignature;
      (jumioService as any).generateWebhookSignature = jest.fn(() => {
        throw new Error('Signature generation error');
      });

      const result = await jumioService.processWebhook({}, 'signature');

      expect(result).toEqual({
        valid: false,
        userId: '',
        status: 'error',
        error: 'Signature generation error'
      });

      // Restore original method
      (jumioService as any).generateWebhookSignature = originalMethod;
    });
  });

  describe('generateWebhookSignature', () => {
    it('should generate consistent signature for same payload', () => {
      const payload = { test: 'data' };
      const signature1 = (jumioService as any).generateWebhookSignature(payload);
      const signature2 = (jumioService as any).generateWebhookSignature(payload);

      expect(signature1).toBe(signature2);
      expect(typeof signature1).toBe('string');
      expect(signature1.length).toBeGreaterThan(0);
    });

    it('should generate different signatures for different payloads', () => {
      const signature1 = (jumioService as any).generateWebhookSignature({ test: 'data1' });
      const signature2 = (jumioService as any).generateWebhookSignature({ test: 'data2' });

      expect(signature1).not.toBe(signature2);
    });
  });
});