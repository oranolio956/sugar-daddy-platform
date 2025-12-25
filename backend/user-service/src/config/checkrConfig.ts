/**
 * Checkr Background Check Service Configuration
 * 
 * This file contains configuration settings for the Checkr background check service.
 * It includes API endpoints, authentication settings, and service-specific parameters.
 */

export const checkrConfig = {
  // API Configuration
  api: {
    baseUrl: process.env.CHECKR_API_URL || 'https://api.checkr.com',
    version: 'v1',
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 1000 // 1 second between retries
  },

  // Authentication
  auth: {
    apiKey: process.env.CHECKR_API_KEY || '',
    authHeader: 'Basic'
  },

  // Background Check Settings
  backgroundCheck: {
    defaultPackage: 'driver_pro',
    maxProcessingDays: 7,
    webhookTimeoutSeconds: 300, // 5 minutes
    allowedAttempts: 3
  },

  // Webhook Configuration
  webhook: {
    signatureHeader: 'X-Checkr-Signature',
    signatureAlgorithm: 'sha256',
    maxAgeSeconds: 300, // 5 minutes
    allowedIps: process.env.CHECKR_WEBHOOK_ALLOWED_IPS?.split(',') || []
  },

  // Security Settings
  security: {
    dataEncryption: true,
    ipWhitelisting: true,
    rateLimiting: {
      enabled: true,
      maxRequestsPerMinute: 60,
      burstLimit: 10
    }
  },

  // Service Monitoring
  monitoring: {
    logRequests: true,
    logResponses: false, // Don't log sensitive response data
    logErrors: true,
    metricsEnabled: true
  },

  // Error Handling
  errors: {
    retryableStatusCodes: [408, 429, 500, 502, 503, 504],
    nonRetryableStatusCodes: [400, 401, 403, 404, 410],
    maxErrorLogSize: 1024 // 1KB
  }
};

export const getCheckrApiUrl = (endpoint: string = ''): string => {
  return `${checkrConfig.api.baseUrl}/${checkrConfig.api.version}/${endpoint}`;
};

export const getCheckrAuthHeader = (): string => {
  const authString = `${checkrConfig.auth.apiKey}:`;
  return `${checkrConfig.auth.authHeader} ${Buffer.from(authString).toString('base64')}`;
};

export default checkrConfig;