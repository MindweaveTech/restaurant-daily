import crypto from 'crypto';
import { execSync } from 'child_process';

export interface OTPConfig {
  length: number;
  expiry_minutes: number;
  max_attempts: number;
  rate_limit_per_hour: number;
  cleanup_interval_hours: number;
}

export interface GeneratedOTP {
  code: string;
  expiresAt: Date;
  phoneNumber: string;
  purpose: 'login' | 'registration' | 'password_reset';
}

export interface OTPValidationResult {
  isValid: boolean;
  isExpired?: boolean;
  attemptsRemaining?: number;
  error?: string;
}

/**
 * Secure OTP generation and validation service
 * Uses HashiCorp Vault for configuration
 */
export class OTPService {
  private static config: OTPConfig | null = null;
  private static otpStore: Map<string, { otp: GeneratedOTP; attempts: number }> = new Map();

  /**
   * Get OTP configuration from Vault
   */
  private static async getConfig(): Promise<OTPConfig> {
    if (this.config) return this.config;

    try {
      const vaultToken = process.env.VAULT_TOKEN || 'your_vault_dev_token';
      const command = `VAULT_ADDR='http://127.0.0.1:8200' VAULT_TOKEN='${vaultToken}' vault kv get -format=json secret/otp`;
      const result = execSync(command, { encoding: 'utf8' });
      const parsed = JSON.parse(result);

      this.config = {
        length: parseInt(parsed.data.data.length),
        expiry_minutes: parseInt(parsed.data.data.expiry_minutes),
        max_attempts: parseInt(parsed.data.data.max_attempts),
        rate_limit_per_hour: parseInt(parsed.data.data.rate_limit_per_hour),
        cleanup_interval_hours: parseInt(parsed.data.data.cleanup_interval_hours)
      };

      return this.config;
    } catch (error) {
      console.error('Failed to load OTP config from Vault:', error);

      // Fallback configuration
      this.config = {
        length: 6,
        expiry_minutes: 5,
        max_attempts: 3,
        rate_limit_per_hour: 3,
        cleanup_interval_hours: 24
      };

      return this.config;
    }
  }

  /**
   * Generate a secure OTP code
   */
  static async generateOTP(
    phoneNumber: string,
    purpose: 'login' | 'registration' | 'password_reset' = 'login'
  ): Promise<GeneratedOTP> {
    const config = await this.getConfig();

    // Generate cryptographically secure random number
    const randomBytes = crypto.randomBytes(4);
    const randomNumber = randomBytes.readUInt32BE(0);

    // Convert to OTP of specified length
    const maxValue = Math.pow(10, config.length) - 1;
    const minValue = Math.pow(10, config.length - 1);
    const otpNumber = minValue + (randomNumber % (maxValue - minValue + 1));

    const code = otpNumber.toString().padStart(config.length, '0');

    // Calculate expiration time
    const expiresAt = new Date();
    expiresAt.setMinutes(expiresAt.getMinutes() + config.expiry_minutes);

    const generatedOTP = {
      code,
      expiresAt,
      phoneNumber,
      purpose
    };

    // Store OTP for verification
    this.otpStore.set(phoneNumber, { otp: generatedOTP, attempts: 0 });

    return generatedOTP;
  }

  /**
   * Verify OTP code
   */
  static async verifyOTP(
    phoneNumber: string,
    code: string
  ): Promise<OTPValidationResult> {
    const config = await this.getConfig();
    const storedData = this.otpStore.get(phoneNumber);

    // Check if OTP exists
    if (!storedData) {
      return {
        isValid: false,
        error: 'No verification code found. Please request a new one.'
      };
    }

    const { otp, attempts } = storedData;

    // Check if too many attempts
    if (attempts >= config.max_attempts) {
      this.otpStore.delete(phoneNumber); // Clean up
      return {
        isValid: false,
        error: 'Too many failed attempts. Please request a new code.'
      };
    }

    // Check if expired
    if (this.isExpired(otp.expiresAt)) {
      this.otpStore.delete(phoneNumber); // Clean up
      return {
        isValid: false,
        isExpired: true,
        error: 'Verification code has expired. Please request a new one.'
      };
    }

    // Increment attempts
    storedData.attempts++;

    // Verify code
    if (otp.code === code) {
      this.otpStore.delete(phoneNumber); // Clean up on success
      return {
        isValid: true
      };
    }

    // Invalid code
    const remainingAttempts = config.max_attempts - storedData.attempts;

    if (remainingAttempts <= 0) {
      this.otpStore.delete(phoneNumber); // Clean up after max attempts
      return {
        isValid: false,
        error: 'Too many failed attempts. Please request a new code.'
      };
    }

    return {
      isValid: false,
      attemptsRemaining: remainingAttempts,
      error: `Invalid verification code. ${remainingAttempts} ${remainingAttempts === 1 ? 'attempt' : 'attempts'} remaining.`
    };
  }

  /**
   * Validate OTP format
   */
  static async validateOTPFormat(code: string): Promise<boolean> {
    const config = await this.getConfig();

    // Check if code has correct length and is numeric
    const codeRegex = new RegExp(`^\\d{${config.length}}$`);
    return codeRegex.test(code);
  }

  /**
   * Check if OTP is expired
   */
  static isExpired(expiresAt: Date): boolean {
    return new Date() > expiresAt;
  }

  /**
   * Generate OTP hash for storage (security best practice)
   */
  static hashOTP(code: string, phoneNumber: string): string {
    const salt = phoneNumber.slice(-4); // Use last 4 digits as salt
    return crypto
      .createHash('sha256')
      .update(`${code}${salt}${process.env.OTP_SECRET || 'restaurant-daily-secret'}`)
      .digest('hex');
  }

  /**
   * Verify OTP hash
   */
  static verifyOTPHash(code: string, phoneNumber: string, hash: string): boolean {
    const computedHash = this.hashOTP(code, phoneNumber);
    return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(computedHash));
  }

  /**
   * Get human-readable expiry time
   */
  static getExpiryTimeText(expiresAt: Date): string {
    const now = new Date();
    const diffMs = expiresAt.getTime() - now.getTime();
    const diffMinutes = Math.ceil(diffMs / 60000);

    if (diffMinutes <= 0) return 'expired';
    if (diffMinutes === 1) return '1 minute';
    return `${diffMinutes} minutes`;
  }

  /**
   * Generate OTP for display in messages
   */
  static formatOTPForMessage(code: string): string {
    // Add spacing for better readability: 123456 -> 123 456
    if (code.length === 6) {
      return `${code.slice(0, 3)} ${code.slice(3)}`;
    }
    return code;
  }

  /**
   * Clean up expired OTPs (utility function for background jobs)
   */
  static async getCleanupThreshold(): Promise<Date> {
    const config = await this.getConfig();
    const threshold = new Date();
    threshold.setHours(threshold.getHours() - config.cleanup_interval_hours);
    return threshold;
  }
}

/**
 * Rate limiting utilities
 */
export class OTPRateLimit {
  private static attempts: Map<string, number[]> = new Map();

  /**
   * Check if phone number has exceeded rate limit
   */
  static async isRateLimited(phoneNumber: string): Promise<boolean> {
    const config = await OTPService['getConfig']();
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000); // 1 hour ago

    // Get existing attempts for this phone number
    const phoneAttempts = this.attempts.get(phoneNumber) || [];

    // Filter to only recent attempts (within last hour)
    const recentAttempts = phoneAttempts.filter(timestamp => timestamp > hourAgo);

    // Update the map with filtered attempts
    this.attempts.set(phoneNumber, recentAttempts);

    // Check if rate limit exceeded
    return recentAttempts.length >= config.rate_limit_per_hour;
  }

  /**
   * Record an OTP attempt
   */
  static recordAttempt(phoneNumber: string): void {
    const attempts = this.attempts.get(phoneNumber) || [];
    attempts.push(Date.now());
    this.attempts.set(phoneNumber, attempts);
  }

  /**
   * Get remaining attempts for a phone number
   */
  static async getRemainingAttempts(phoneNumber: string): Promise<number> {
    const config = await OTPService['getConfig']();
    const now = Date.now();
    const hourAgo = now - (60 * 60 * 1000);

    const phoneAttempts = this.attempts.get(phoneNumber) || [];
    const recentAttempts = phoneAttempts.filter(timestamp => timestamp > hourAgo);

    return Math.max(0, config.rate_limit_per_hour - recentAttempts.length);
  }

  /**
   * Clear rate limit for a phone number (for testing or admin override)
   */
  static clearRateLimit(phoneNumber: string): void {
    this.attempts.delete(phoneNumber);
  }
}

export default OTPService;