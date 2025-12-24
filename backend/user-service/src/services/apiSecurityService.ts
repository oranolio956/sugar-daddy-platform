import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import { User } from '../models/User';
import { securityConfig } from '../config/security';

export interface APIKey {
  id: string;
  userId: string;
  name: string;
  key: string;
  secret: string;
  permissions: string[];
  isActive: boolean;
  createdAt: Date;
  lastUsedAt: Date | null;
  rateLimit: {
    requests: number;
    window: number; // in seconds
  };
}

export interface SignedRequest {
  timestamp: number;
  nonce: string;
  signature: string;
  payload: string;
}

export class APISecurityService {
  private readonly NONCE_TTL = 300; // 5 minutes
  private readonly TIMESTAMP_TOLERANCE = 300; // 5 minutes
  private readonly activeNonces = new Map<string, number>();

  /**
   * Generate API key and secret for a user
   */
  async generateAPIKey(userId: string, name: string, permissions: string[] = ['read']): Promise<APIKey> {
    const key = `ak_${crypto.randomBytes(16).toString('hex')}`;
    const secret = crypto.randomBytes(32).toString('hex');
    
    const apiKey: APIKey = {
      id: crypto.randomUUID(),
      userId,
      name,
      key,
      secret,
      permissions,
      isActive: true,
      createdAt: new Date(),
      lastUsedAt: null,
      rateLimit: {
        requests: 1000,
        window: 3600 // 1 hour
      }
    };

    // Store API key in user's metadata (in production, use a separate table)
    const user = await User.findByPk(userId);
    if (user) {
      const currentKeys = user.apiKeys || [];
      await user.update({
        apiKeys: [...currentKeys, apiKey]
      });
    }

    return apiKey;
  }

  /**
   * Validate API key
   */
  async validateAPIKey(apiKey: string): Promise<APIKey | null> {
    const users = await User.findAll({
      where: {
        apiKeys: {
          $contains: [{ key: apiKey }]
        }
      }
    });

    for (const user of users) {
      const keys = user.apiKeys || [];
      const foundKey = keys.find(k => k.key === apiKey && k.isActive);
      if (foundKey) {
        // Update last used timestamp
        await user.update({
          apiKeys: keys.map(k => 
            k.key === apiKey 
              ? { ...k, lastUsedAt: new Date() }
              : k
          )
        });
        return foundKey;
      }
    }

    return null;
  }

  /**
   * Validate signed request
   */
  validateSignedRequest(req: Request): boolean {
    const timestamp = parseInt(req.get('X-Timestamp') || '0');
    const nonce = req.get('X-Nonce') || '';
    const signature = req.get('X-Signature') || '';
    const apiKey = req.get('X-API-Key') || '';

    if (!timestamp || !nonce || !signature || !apiKey) {
      return false;
    }

    // Check timestamp tolerance
    const now = Math.floor(Date.now() / 1000);
    if (Math.abs(now - timestamp) > this.TIMESTAMP_TOLERANCE) {
      return false;
    }

    // Check nonce replay attack
    if (this.activeNonces.has(nonce)) {
      return false;
    }

    // Get API key
    const apiKeys = this.getStoredAPIKeys();
    const keyData = apiKeys.find(k => k.key === apiKey);
    
    if (!keyData || !keyData.isActive) {
      return false;
    }

    // Calculate expected signature
    const payload = this.getPayloadForSigning(req);
    const expectedSignature = this.calculateSignature(
      keyData.secret,
      timestamp,
      nonce,
      payload
    );

    // Verify signature
    const isValid = crypto.timingSafeEqual(
      Buffer.from(signature),
      Buffer.from(expectedSignature)
    );

    if (isValid) {
      // Store nonce to prevent replay
      this.activeNonces.set(nonce, Date.now());
      
      // Clean up old nonces
      this.cleanupNonces();
    }

    return isValid;
  }

  /**
   * Middleware for API key authentication
   */
  apiKeyAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const apiKey = req.get('X-API-Key') || req.query.apiKey as string;
    
    if (!apiKey) {
      res.status(401).json({
        success: false,
        error: 'API key required',
        message: 'Please provide a valid API key'
      });
      return;
    }

    const keyData = await this.validateAPIKey(apiKey);
    
    if (!keyData) {
      res.status(401).json({
        success: false,
        error: 'Invalid API key',
        message: 'The provided API key is invalid or inactive'
      });
      return;
    }

    // Check permissions
    const requiredPermission = req.route?.path || req.path;
    if (!this.hasPermission(keyData, requiredPermission)) {
      res.status(403).json({
        success: false,
        error: 'Insufficient permissions',
        message: 'You do not have permission to access this resource'
      });
      return;
    }

    // Add API key info to request
    req.apiKey = keyData;
    next();
  };

  /**
   * Middleware for signed request validation
   */
  signedRequestAuth = (req: Request, res: Response, next: NextFunction): void => {
    if (!this.validateSignedRequest(req)) {
      res.status(401).json({
        success: false,
        error: 'Invalid signature',
        message: 'Request signature validation failed'
      });
      return;
    }
    next();
  };

  /**
   * Calculate signature for request
   */
  private calculateSignature(secret: string, timestamp: number, nonce: string, payload: string): string {
    const data = `${timestamp}\n${nonce}\n${payload}`;
    return crypto
      .createHmac('sha256', secret)
      .update(data)
      .digest('hex');
  }

  /**
   * Get payload for signing
   */
  private getPayloadForSigning(req: Request): string {
    const method = req.method.toUpperCase();
    const path = req.path;
    const query = this.getSortedQueryString(req.query);
    const body = req.body ? JSON.stringify(req.body) : '';
    
    return `${method}\n${path}\n${query}\n${body}`;
  }

  /**
   * Get sorted query string
   */
  private getSortedQueryString(query: any): string {
    if (!query || Object.keys(query).length === 0) {
      return '';
    }
    
    const sortedKeys = Object.keys(query).sort();
    return sortedKeys.map(key => `${key}=${query[key]}`).join('&');
  }

  /**
   * Check if API key has required permission
   */
  private hasPermission(apiKey: APIKey, requiredPermission: string): boolean {
    // Simple permission check - in production, implement more sophisticated logic
    return apiKey.permissions.includes('admin') || 
           apiKey.permissions.includes(requiredPermission) ||
           apiKey.permissions.includes('read');
  }

  /**
   * Get stored API keys (in production, this would query the database)
   */
  private getStoredAPIKeys(): APIKey[] {
    // This is a placeholder - in production, query from database
    return [];
  }

  /**
   * Cleanup old nonces
   */
  private cleanupNonces(): void {
    const now = Date.now();
    for (const [nonce, timestamp] of this.activeNonces.entries()) {
      if (now - timestamp > this.NONCE_TTL * 1000) {
        this.activeNonces.delete(nonce);
      }
    }
  }

  /**
   * Revoke API key
   */
  async revokeAPIKey(userId: string, apiKeyId: string): Promise<boolean> {
    const user = await User.findByPk(userId);
    if (!user) {
      return false;
    }

    const keys = user.apiKeys || [];
    const updatedKeys = keys.map(k => 
      k.id === apiKeyId ? { ...k, isActive: false } : k
    );

    await user.update({ apiKeys: updatedKeys });
    return true;
  }

  /**
   * Get API key usage statistics
   */
  async getAPIKeyStats(apiKey: string): Promise<{ requests: number; lastUsed: Date | null }> {
    const keyData = await this.validateAPIKey(apiKey);
    if (!keyData) {
      return { requests: 0, lastUsed: null };
    }

    return {
      requests: keyData.rateLimit.requests,
      lastUsed: keyData.lastUsedAt
    };
  }

  /**
   * Rate limiting for API keys
   */
  async checkRateLimit(apiKey: string): Promise<boolean> {
    // Implement rate limiting logic here
    // This would typically use Redis for distributed rate limiting
    return true;
  }
}

export default new APISecurityService();