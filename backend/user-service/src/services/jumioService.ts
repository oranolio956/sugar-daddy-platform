/**
 * Jumio Identity Verification Service
 * 
 * This service handles integration with Jumio's identity verification and liveness detection API.
 * It provides methods for initiating verification sessions, checking verification status,
 * and processing verification results.
 */

import axios from 'axios';
import crypto from 'crypto';
import { SecurityUtils } from '../utils/security';
import { jumioConfig, getJumioApiUrl, getJumioAuthHeader } from '../config/jumioConfig';

export class JumioService {
  private apiKey: string;
  private apiSecret: string;
  private apiUrl: string;
  private webhookToken: string;

  constructor() {
    this.apiKey = jumioConfig.auth.apiKey;
    this.apiSecret = jumioConfig.auth.apiSecret;
    this.apiUrl = jumioConfig.api.baseUrl;
    this.webhookToken = jumioConfig.auth.webhookToken;

    if (!this.apiKey || !this.apiSecret) {
      console.warn('Jumio API credentials not configured. Liveness verification will be disabled.');
    }
  }

  /**
   * Initialize a new verification session with Jumio
   * @param userId - The user ID for tracking
   * @param callbackUrl - URL for Jumio to send verification results
   * @returns Jumio session token and URL
   */
  async initiateVerificationSession(userId: string, callbackUrl: string): Promise<{
    sessionToken: string;
    verificationUrl: string;
    transactionId: string;
  }> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Jumio service not configured');
    }

    try {
      // Generate a unique transaction ID
      const transactionId = `txn_${Date.now()}_${userId}`;

      // Create the request payload
      const payload = {
        customerInternalReference: userId,
        successUrl: `${callbackUrl}/success`,
        errorUrl: `${callbackUrl}/error`,
        callbackUrl: `${callbackUrl}/callback`,
        userReference: userId,
        verificationType: 'IDENTITY_VERIFICATION',
        workflowId: 'sugar_daddy_platform_workflow'
      };

      // Make the API call to Jumio
      const response = await axios.post(
        getJumioApiUrl('verifications'),
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getJumioAuthHeader(),
            'User-Agent': 'SugarDaddyPlatform/1.0'
          },
          timeout: jumioConfig.api.timeout
        }
      );

      if (response.data && response.data.sessionToken && response.data.redirectUrl) {
        return {
          sessionToken: response.data.sessionToken,
          verificationUrl: response.data.redirectUrl,
          transactionId: transactionId
        };
      } else {
        throw new Error('Invalid response from Jumio API');
      }
    } catch (error: any) {
      console.error('Jumio session initiation error:', error.message);
      throw new Error(`Failed to initiate verification session: ${error.message}`);
    }
  }

  /**
   * Check the status of a verification session
   * @param transactionId - The Jumio transaction ID
   * @returns Verification status and results
   */
  async checkVerificationStatus(transactionId: string): Promise<{
    status: string;
    verificationResult?: any;
    error?: string;
  }> {
    if (!this.apiKey || !this.apiSecret) {
      throw new Error('Jumio service not configured');
    }

    try {
      const response = await axios.get(
        getJumioApiUrl(`verifications/${transactionId}`),
        {
          headers: {
            'Authorization': getJumioAuthHeader(),
            'User-Agent': 'SugarDaddyPlatform/1.0'
          },
          timeout: jumioConfig.api.timeout
        }
      );

      if (response.data && response.data.status) {
        return {
          status: response.data.status,
          verificationResult: response.data.verificationResult,
          error: response.data.error
        };
      } else {
        throw new Error('Invalid response from Jumio API');
      }
    } catch (error: any) {
      console.error('Jumio status check error:', error.message);
      throw new Error(`Failed to check verification status: ${error.message}`);
    }
  }

  /**
   * Process Jumio webhook callback
   * @param payload - The webhook payload from Jumio
   * @param signature - The webhook signature for verification
   * @returns Processed verification result
   */
  async processWebhook(payload: any, signature: string): Promise<{
    valid: boolean;
    userId: string;
    status: string;
    verificationData?: any;
    error?: string;
  }> {
    try {
      // Verify the webhook signature
      const expectedSignature = this.generateWebhookSignature(payload);
      const isValid = signature === expectedSignature;

      if (!isValid) {
        console.warn('Invalid Jumio webhook signature');
        return {
          valid: false,
          userId: '',
          status: 'invalid',
          error: 'Invalid webhook signature'
        };
      }

      // Process the payload
      const userId = payload.customerInternalReference;
      const status = payload.status;
      const verificationData = payload.verificationResult;

      return {
        valid: true,
        userId,
        status,
        verificationData
      };
    } catch (error: any) {
      console.error('Webhook processing error:', error.message);
      return {
        valid: false,
        userId: '',
        status: 'error',
        error: error.message
      };
    }
  }

  /**
   * Generate webhook signature for verification
   * @param payload - The webhook payload
   * @returns Generated signature
   */
  private generateWebhookSignature(payload: any): string {
    const data = JSON.stringify(payload);
    return crypto
      .createHmac('sha256', this.webhookToken)
      .update(data)
      .digest('hex');
  }

  /**
   * Verify if the service is properly configured
   * @returns True if configured, false otherwise
   */
  isConfigured(): boolean {
    return !!(this.apiKey && this.apiSecret && this.apiUrl);
  }

  /**
   * Get service status
   * @returns Service status information
   */
  getServiceStatus(): {
    configured: boolean;
    serviceName: string;
    apiUrl: string;
  } {
    return {
      configured: this.isConfigured(),
      serviceName: 'Jumio Identity Verification',
      apiUrl: this.apiUrl
    };
  }
}