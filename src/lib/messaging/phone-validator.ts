import { parsePhoneNumber, isValidPhoneNumber } from 'libphonenumber-js';

export interface PhoneValidationResult {
  isValid: boolean;
  formatted?: string; // E.164 format
  country?: string;
  nationalNumber?: string;
  error?: string;
}

/**
 * Validates and formats phone numbers for restaurant staff
 * Supports international formats with focus on Indian numbers
 */
export class PhoneValidator {
  private static readonly SUPPORTED_COUNTRIES = ['IN', 'US', 'GB', 'AU'];

  /**
   * Validate and format a phone number
   */
  static validate(phoneNumber: string, defaultCountry: string = 'IN'): PhoneValidationResult {
    try {
      // Clean the input
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');

      if (!cleanPhone) {
        return {
          isValid: false,
          error: 'Phone number is required'
        };
      }

      // Parse the phone number
      const parsed = parsePhoneNumber(cleanPhone, defaultCountry as 'IN' | 'US' | 'GB' | 'AU');

      if (!parsed) {
        return {
          isValid: false,
          error: 'Invalid phone number format'
        };
      }

      // Validate the phone number
      if (!parsed.isValid()) {
        return {
          isValid: false,
          error: 'Phone number is not valid'
        };
      }

      // Check if country is supported
      if (!this.SUPPORTED_COUNTRIES.includes(parsed.country!)) {
        return {
          isValid: false,
          error: `Phone numbers from ${parsed.country} are not supported yet`
        };
      }

      return {
        isValid: true,
        formatted: parsed.format('E.164'), // +911234567890
        country: parsed.country,
        nationalNumber: parsed.nationalNumber
      };

    } catch (error) {
      return {
        isValid: false,
        error: error instanceof Error ? error.message : 'Unknown validation error'
      };
    }
  }

  /**
   * Quick validation without detailed parsing
   */
  static isValid(phoneNumber: string, defaultCountry: string = 'IN'): boolean {
    try {
      const cleanPhone = phoneNumber.replace(/[^\d+]/g, '');
      return isValidPhoneNumber(cleanPhone, defaultCountry as 'IN' | 'US' | 'GB' | 'AU');
    } catch {
      return false;
    }
  }

  /**
   * Format phone number for display
   */
  static formatForDisplay(phoneNumber: string): string {
    try {
      const parsed = parsePhoneNumber(phoneNumber);
      return parsed ? parsed.formatInternational() : phoneNumber;
    } catch {
      return phoneNumber;
    }
  }

  /**
   * Extract country code from phone number
   */
  static getCountryCode(phoneNumber: string): string | null {
    try {
      const parsed = parsePhoneNumber(phoneNumber);
      return parsed ? parsed.country || null : null;
    } catch {
      return null;
    }
  }

  /**
   * Check if phone number is a mobile number (required for SMS/WhatsApp)
   */
  static isMobile(phoneNumber: string): boolean {
    try {
      const parsed = parsePhoneNumber(phoneNumber);
      if (!parsed) return false;

      // For India, check if it's a mobile number (starts with 7, 8, 9)
      if (parsed.country === 'IN') {
        const nationalNumber = parsed.nationalNumber;
        return /^[789]/.test(nationalNumber);
      }

      // For other countries, assume all are mobile for now
      return true;
    } catch {
      return false;
    }
  }
}

/**
 * Utility functions for common phone operations
 */
export const phoneUtils = {
  /**
   * Convert phone number to WhatsApp format
   */
  toWhatsAppFormat: (phoneNumber: string): string => {
    const validation = PhoneValidator.validate(phoneNumber);
    return validation.isValid && validation.formatted
      ? `whatsapp:${validation.formatted}`
      : '';
  },

  /**
   * Check if phone number can receive WhatsApp messages
   */
  canReceiveWhatsApp: (phoneNumber: string): boolean => {
    const validation = PhoneValidator.validate(phoneNumber);
    return validation.isValid && PhoneValidator.isMobile(phoneNumber);
  },

  /**
   * Get preferred messaging method for a phone number
   * Current setup: WhatsApp-primary (sandbox), SMS when upgraded
   */
  getPreferredMethod: (phoneNumber: string): 'whatsapp' | 'sms' | 'none' => {
    if (!PhoneValidator.isValid(phoneNumber)) return 'none';

    const countryCode = PhoneValidator.getCountryCode(phoneNumber);

    // WhatsApp is popular in India and we have sandbox access
    if (countryCode === 'IN' && PhoneValidator.isMobile(phoneNumber)) {
      return 'whatsapp';
    }

    // For other countries, also prefer WhatsApp (sandbox works globally)
    if (PhoneValidator.isMobile(phoneNumber)) {
      return 'whatsapp';
    }

    // For landlines, WhatsApp won't work, return 'none' until SMS is available
    return 'none';
  }
};

export default PhoneValidator;