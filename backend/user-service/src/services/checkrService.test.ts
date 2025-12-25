/**
 * Checkr Service Tests
 * 
 * Comprehensive test suite for the Checkr background check service.
 */

import { CheckrService } from './checkrService';
import { checkrConfig } from '../config/checkrConfig';

// Mock axios
jest.mock('axios');
const mockAxios = require('axios');

describe('CheckrService', () => {
  let checkrService: CheckrService;

  beforeEach(() => {
    checkrService = new CheckrService();
    jest.clearAllMocks();
  });

  describe('initiateBackgroundCheck', () => {
    it('should initiate background check successfully', async () => {
      // Mock Checkr API response
      mockAxios.post.mockResolvedValue({
        data: {
          id: 'bgc_123',
          uri: 'https://api.checkr.com/v1/background_checks/bgc_123',
          status: 'pending'
        }
      });

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

      const result = await checkrService.initiateBackgroundCheck(
        'user_123',
        'https://callback.url',
        candidateData
      );

      expect(result).toBeDefined();
      expect(result.backgroundCheckId).toBe('bgc_123');
      expect(result.statusUrl).toBe('https://api.checkr.com/v1/background_checks/bgc_123');
      expect(result.webhookUrl).toBe('https://callback.url');

      // Verify the API was called with correct parameters
      expect(mockAxios.post).toHaveBeenCalledWith(
        expect.stringContaining('background_checks'),
        expect.objectContaining({
          candidate: expect.objectContaining({
            first_name: 'John',
            last_name: 'Doe'
          }),
          package: checkrConfig.backgroundCheck.defaultPackage,
          webhook_url: 'https://callback.url',
          custom_id: 'user_123'
        }),
        expect.objectContaining({
          headers: expect.objectContaining({
            'Content-Type': 'application/json',
            'Authorization': expect.stringContaining('Basic')
          })
        })
      );
    });

    it('should throw error when Checkr service is not configured', async () => {
      // Mock service to be unconfigured
      jest.spyOn(checkrService as any, 'apiKey', 'get').mockReturnValue('');

      await expect(
        checkrService.initiateBackgroundCheck(
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
      ).rejects.toThrow('Checkr service not configured');
    });

    it('should throw error when Checkr API call fails', async () => {
      // Mock API error
      mockAxios.post.mockRejectedValue(new Error('Checkr API error'));

      await expect(
        checkrService.initiateBackgroundCheck(
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
      ).rejects.toThrow('Failed to initiate background check: Checkr API error');
    });
  });

  describe('checkBackgroundCheckStatus', () => {
    it('should return background check status successfully', async () => {
      // Mock Checkr API response
      mockAxios.get.mockResolvedValue({
        data: {
          id: 'bgc_123',
          status: 'complete',
          report: {
            criminal_records: [],
            education_verification: {}
          },
          completed_at: '2023-01-01T00:00:00Z'
        }
      });

      const result = await checkrService.checkBackgroundCheckStatus('bgc_123');

      expect(result).toBeDefined();
      expect(result.status).toBe('complete');
      expect(result.backgroundCheckResult).toBeDefined();
      expect(result.completedAt).toBe('2023-01-01T00:00:00Z');
    });

    it('should handle background check status check error', async () => {
      // Mock API error
      mockAxios.get.mockRejectedValue(new Error('API error'));

      await expect(
        checkrService.checkBackgroundCheckStatus('bgc_123')
      ).rejects.toThrow('Failed to check background check status: API error');
    });
  });

  describe('processWebhook', () => {
    it('should process valid webhook and return approved status', async () => {
      // Mock webhook signature generation
      jest.spyOn(checkrService as any, 'generateWebhookSignature').mockReturnValue('valid-signature');

      const payload = {
        object: {
          id: 'bgc_123',
          custom_id: 'user_123',
          status: 'complete',
          report: {
            criminal_records: [],
            education_verification: {}
          }
        }
      };

      const result = await checkrService.processWebhook(payload, 'valid-signature');

      expect(result).toBeDefined();
      expect(result.valid).toBe(true);
      expect(result.userId).toBe('user_123');
      expect(result.backgroundCheckId).toBe('bgc_123');
      expect(result.status).toBe('complete');
      expect(result.backgroundCheckData).toBeDefined();
    });

    it('should handle invalid webhook signature', async () => {
      // Mock webhook signature generation
      jest.spyOn(checkrService as any, 'generateWebhookSignature').mockReturnValue('expected-signature');

      const payload = {
        object: {
          id: 'bgc_123',
          custom_id: 'user_123',
          status: 'complete'
        }
      };

      const result = await checkrService.processWebhook(payload, 'invalid-signature');

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.status).toBe('invalid');
      expect(result.error).toBe('Invalid webhook signature');
    });

    it('should handle webhook processing error', async () => {
      // Mock signature generation to throw error
      jest.spyOn(checkrService as any, 'generateWebhookSignature').mockImplementation(() => {
        throw new Error('Signature generation error');
      });

      const result = await checkrService.processWebhook({}, 'signature');

      expect(result).toBeDefined();
      expect(result.valid).toBe(false);
      expect(result.status).toBe('error');
      expect(result.error).toBe('Signature generation error');
    });
  });

  describe('isConfigured', () => {
    it('should return true when service is configured', () => {
      // Mock service to be configured
      jest.spyOn(checkrService as any, 'apiKey', 'get').mockReturnValue('test-api-key');
      jest.spyOn(checkrService as any, 'apiUrl', 'get').mockReturnValue('https://api.checkr.com');

      expect(checkrService.isConfigured()).toBe(true);
    });

    it('should return false when service is not configured', () => {
      // Mock service to be unconfigured
      jest.spyOn(checkrService as any, 'apiKey', 'get').mockReturnValue('');

      expect(checkrService.isConfigured()).toBe(false);
    });
  });

  describe('getServiceStatus', () => {
    it('should return service status', () => {
      // Mock service to be configured
      jest.spyOn(checkrService as any, 'apiKey', 'get').mockReturnValue('test-api-key');
      jest.spyOn(checkrService as any, 'apiUrl', 'get').mockReturnValue('https://api.checkr.com');

      const status = checkrService.getServiceStatus();

      expect(status).toBeDefined();
      expect(status.configured).toBe(true);
      expect(status.serviceName).toBe('Checkr Background Checks');
      expect(status.apiUrl).toBe('https://api.checkr.com');
    });
  });

  describe('getAvailablePackages', () => {
    it('should return available background check packages', () => {
      const packages = checkrService.getAvailablePackages();

      expect(packages).toBeDefined();
      expect(Array.isArray(packages)).toBe(true);
      expect(packages.length).toBeGreaterThan(0);
      expect(packages).toContain('driver_pro');
      expect(packages).toContain('criminal');
    });
  });
});

// Clean up mocks after tests
afterAll(() => {
  jest.restoreAllMocks();
});