/**
 * Checkr Background Check Service
 * 
 * This service handles integration with Checkr's background check API.
 * It provides methods for initiating background checks, checking status,
 * and processing background check results.
 */

import axios from 'axios';
import crypto from 'crypto';
import { SecurityUtils } from '../utils/security';
import { checkrConfig, getCheckrApiUrl, getCheckrAuthHeader } from '../config/checkrConfig';

export class CheckrService {
  private apiKey: string;
  private apiUrl: string;
  private webhookToken: string;

  constructor() {
    this.apiKey = checkrConfig.auth.apiKey;
    this.apiUrl = checkrConfig.api.baseUrl;
    this.webhookToken = process.env.CHECKR_WEBHOOK_TOKEN || '';

    if (!this.apiKey) {
      console.warn('Checkr API credentials not configured. Background checks will be disabled.');
    }
  }

  /**
   * Initialize a new background check with Checkr
   * @param userId - The user ID for tracking
   * @param callbackUrl - URL for Checkr to send background check results
   * @param candidateData - Candidate information for background check
   * @returns Checkr background check information
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
    webhookUrl: string;
  }> {
    if (!this.apiKey) {
      throw new Error('Checkr service not configured');
    }

    try {
      // Generate a unique background check ID
      const backgroundCheckId = `bgc_${Date.now()}_${userId}`;

      // Create the request payload
      const payload = {
        candidate: {
          first_name: candidateData.firstName,
          last_name: candidateData.lastName,
          email: candidateData.email,
          phone: candidateData.phone,
          dob: candidateData.dob,
          ssn: candidateData.ssn,
          zipcode: candidateData.address.zipCode,
          driver_license_number: '', // Optional
          driver_license_state: '', // Optional
          middle_name: '', // Optional
          address: {
            street: candidateData.address.street,
            city: candidateData.address.city,
            state: candidateData.address.state,
            zipcode: candidateData.address.zipCode
          }
        },
        package: checkrConfig.backgroundCheck.defaultPackage,
        webhook_url: callbackUrl,
        custom_id: userId,
        tags: ['sugar_daddy_platform']
      };

      // Make the API call to Checkr
      const response = await axios.post(
        getCheckrApiUrl('background_checks'),
        payload,
        {
          headers: {
            'Content-Type': 'application/json',
            'Authorization': getCheckrAuthHeader(),
            'User-Agent': 'SugarDaddyPlatform/1.0'
          },
          timeout: checkrConfig.api.timeout
        }
      );

      if (response.data && response.data.id && response.data.uri) {
        return {
          backgroundCheckId: response.data.id,
          statusUrl: response.data.uri,
          webhookUrl: callbackUrl
        };
      } else {
        throw new Error('Invalid response from Checkr API');
      }
    } catch (error: any) {
      console.error('Checkr background check initiation error:', error.message);
      throw new Error(`Failed to initiate background check: ${error.message}`);
    }
  }

  /**
   * Check the status of a background check
   * @param backgroundCheckId - The Checkr background check ID
   * @returns Background check status and results
   */
  async checkBackgroundCheckStatus(backgroundCheckId: string): Promise<{
    status: string;
    backgroundCheckResult?: any;
    error?: string;
    completedAt?: string;
    estimatedCompletion?: string;
  }> {
    if (!this.apiKey) {
      throw new Error('Checkr service not configured');
    }

    try {
      const response = await axios.get(
        getCheckrApiUrl(`background_checks/${backgroundCheckId}`),
        {
          headers: {
            'Authorization': getCheckrAuthHeader(),
            'User-Agent': 'SugarDaddyPlatform/1.0'
          },
          timeout: checkrConfig.api.timeout
        }
      );

      if (response.data && response.data.status) {
        return {
          status: response.data.status,
          backgroundCheckResult: response.data.report,
          error: response.data.error,
          completedAt: response.data.completed_at,
          estimatedCompletion: response.data.estimated_completion_time
        };
      } else {
        throw new Error('Invalid response from Checkr API');
      }
    } catch (error: any) {
      console.error('Checkr status check error:', error.message);
      throw new Error(`Failed to check background check status: ${error.message}`);
    }
  }

  /**
   * Process Checkr webhook callback
   * @param payload - The webhook payload from Checkr
   * @param signature - The webhook signature for verification
   * @returns Processed background check result
   */
  async processWebhook(payload: any, signature: string): Promise<{
    valid: boolean;
    userId: string;
    backgroundCheckId: string;
    status: string;
    backgroundCheckData?: any;
    error?: string;
  }> {
    try {
      // Verify the webhook signature
      const expectedSignature = this.generateWebhookSignature(payload);
      const isValid = signature === expectedSignature;

      if (!isValid) {
        console.warn('Invalid Checkr webhook signature');
        return {
          valid: false,
          userId: '',
          backgroundCheckId: '',
          status: 'invalid',
          error: 'Invalid webhook signature'
        };
      }

      // Process the payload
      const userId = payload.object.custom_id;
      const backgroundCheckId = payload.object.id;
      const status = payload.object.status;
      const backgroundCheckData = payload.object.report;

      return {
        valid: true,
        userId,
        backgroundCheckId,
        status,
        backgroundCheckData
      };
    } catch (error: any) {
      console.error('Webhook processing error:', error.message);
      return {
        valid: false,
        userId: '',
        backgroundCheckId: '',
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
    return !!(this.apiKey && this.apiUrl);
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
      serviceName: 'Checkr Background Checks',
      apiUrl: this.apiUrl
    };
  }

  /**
   * Get available background check packages
   * @returns Array of available background check packages
   */
  getAvailablePackages(): string[] {
    return [
      'driver_pro',
      'criminal',
      'education_verification',
      'employment_verification',
      'international_criminal',
      'motor_vehicle_report'
    ];
  }
}