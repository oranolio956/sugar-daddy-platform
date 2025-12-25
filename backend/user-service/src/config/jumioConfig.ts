/**
 * Jumio Service Configuration
 * 
 * This file contains configuration settings for the Jumio identity verification service.
 * It includes API endpoints, authentication settings, and service-specific parameters.
 */

export const jumioConfig = {
  // API Configuration
  api: {
    baseUrl: process.env.JUMIO_API_URL || 'https://api.jumio.com',
    version: 'v4',
    timeout: 30000, // 30 seconds
    maxRetries: 3,
    retryDelay: 1000 // 1 second between retries
  },

  // Authentication
  auth: {
    apiKey: process.env.JUMIO_API_KEY || '',
    apiSecret: process.env.JUMIO_API_SECRET || '',
    webhookToken: process.env.JUMIO_WEBHOOK_TOKEN || '',
    authHeader: 'Basic'
  },

  // Verification Settings
  verification: {
    defaultWorkflowId: 'sugar_daddy_platform_workflow',
    verificationType: 'IDENTITY_VERIFICATION',
    sessionExpiryMinutes: 30,
    maxSessionDurationMinutes: 15,
    allowedAttempts: 3
  },

  // Webhook Configuration
  webhook: {
    signatureHeader: 'X-Jumio-Signature',
    signatureAlgorithm: 'sha256',
    maxAgeSeconds: 300, // 5 minutes
    allowedIps: process.env.JUMIO_WEBHOOK_ALLOWED_IPS?.split(',') || []
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

export const getJumioApiUrl = (endpoint: string = ''): string => {
  return `${jumioConfig.api.baseUrl}/${jumioConfig.api.version}/${endpoint}`;
};

export const getJumioAuthHeader = (): string => {
  const authString = `${jumioConfig.auth.apiKey}:${jumioConfig.auth.apiSecret}`;
  return `${jumioConfig.auth.authHeader} ${Buffer.from(authString).toString('base64')}`;
};

export default jumioConfig;