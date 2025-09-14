/**
 * Message templates for SMS and WhatsApp OTP delivery
 * Supports multiple languages and formatting
 */

export interface MessageTemplate {
  type: 'sms' | 'whatsapp';
  template: string;
  contentSid?: string; // For WhatsApp rich templates
}

export interface OTPMessageData {
  otpCode: string;
  expiryTime: string;
  appName?: string;
  userName?: string;
}

export class MessageTemplates {
  private static readonly APP_NAME = 'Restaurant Daily';

  /**
   * WhatsApp rich template configuration
   */
  static readonly WHATSAPP_TEMPLATE: MessageTemplate = {
    type: 'whatsapp',
    template: 'rich_template',
    contentSid: 'HXb5b62575e6e4ff6129ad7c8efe1f983e' // Your Twilio content SID
  };

  /**
   * SMS fallback template
   */
  static readonly SMS_TEMPLATE: MessageTemplate = {
    type: 'sms',
    template: `${this.APP_NAME}: Your login code is {{otpCode}}. Valid for {{expiryTime}}. Don't share this code.`
  };

  /**
   * Generate WhatsApp content variables for rich template
   */
  static getWhatsAppContentVariables(data: OTPMessageData): Record<string, string> {
    return {
      "1": data.otpCode,        // OTP code
      "2": data.expiryTime      // Expiry time
    };
  }

  /**
   * Generate SMS message content
   */
  static getSMSContent(data: OTPMessageData): string {
    return this.SMS_TEMPLATE.template
      .replace('{{otpCode}}', data.otpCode)
      .replace('{{expiryTime}}', data.expiryTime);
  }

  /**
   * Get template based on message type and context
   */
  static getTemplate(
    messageType: 'sms' | 'whatsapp',
    purpose: 'login' | 'registration' | 'password_reset' = 'login'
  ): MessageTemplate {
    switch (messageType) {
      case 'whatsapp':
        return this.WHATSAPP_TEMPLATE;
      case 'sms':
        return this.getSMSTemplate(purpose);
      default:
        return this.SMS_TEMPLATE;
    }
  }

  /**
   * Get SMS template based on purpose
   */
  private static getSMSTemplate(purpose: 'login' | 'registration' | 'password_reset'): MessageTemplate {
    const templates = {
      login: `${this.APP_NAME}: Your login code is {{otpCode}}. Valid for {{expiryTime}}. Don't share this code.`,
      registration: `Welcome to ${this.APP_NAME}! Your verification code is {{otpCode}}. Valid for {{expiryTime}}.`,
      password_reset: `${this.APP_NAME}: Password reset code: {{otpCode}}. Valid for {{expiryTime}}. Contact support if you didn't request this.`
    };

    return {
      type: 'sms',
      template: templates[purpose]
    };
  }

  /**
   * Validate message content length (SMS has 160 character limit)
   */
  static validateSMSLength(content: string): { isValid: boolean; length: number; segments: number } {
    const length = content.length;
    const segments = Math.ceil(length / 160);

    return {
      isValid: length <= 480, // Max 3 segments for cost efficiency
      length,
      segments
    };
  }

  /**
   * Generate test message for validation
   */
  static generateTestMessage(messageType: 'sms' | 'whatsapp'): string {
    const testData: OTPMessageData = {
      otpCode: '123456',
      expiryTime: '5 minutes',
      appName: this.APP_NAME
    };

    if (messageType === 'whatsapp') {
      // For WhatsApp, return the content variables as JSON
      return JSON.stringify(this.getWhatsAppContentVariables(testData));
    } else {
      return this.getSMSContent(testData);
    }
  }

  /**
   * Get message preview for admin interface
   */
  static getMessagePreview(
    messageType: 'sms' | 'whatsapp',
    purpose: 'login' | 'registration' | 'password_reset' = 'login'
  ): string {
    const template = this.getTemplate(messageType, purpose);

    if (messageType === 'whatsapp') {
      return `🍽️ Restaurant Daily Login\n\nYour verification code: [OTP]\nExpires in: [TIME]\n\nKeep this code secure and don't share it.`;
    } else {
      return template.template
        .replace('{{otpCode}}', '[OTP]')
        .replace('{{expiryTime}}', '[TIME]');
    }
  }

  /**
   * Format OTP code for better readability in messages
   */
  static formatOTPForDisplay(otpCode: string): string {
    // Add spacing: 123456 -> 123 456
    if (otpCode.length === 6) {
      return `${otpCode.slice(0, 3)} ${otpCode.slice(3)}`;
    }
    return otpCode;
  }

  /**
   * Get estimated message cost (for monitoring)
   */
  static getEstimatedCost(messageType: 'sms' | 'whatsapp', countryCode: string): number {
    // Cost in INR (approximate)
    const costs = {
      whatsapp: {
        'IN': 0.35,   // India
        'US': 0.50,   // United States
        'GB': 0.40,   // United Kingdom
        default: 0.45
      },
      sms: {
        'IN': 0.50,   // India
        'US': 0.75,   // United States
        'GB': 0.60,   // United Kingdom
        default: 0.65
      }
    };

    const messageCosts = costs[messageType];
    return messageCosts[countryCode as keyof typeof messageCosts] || messageCosts.default;
  }
}

/**
 * Multi-language support (for future expansion)
 */
export class MultiLanguageTemplates {
  private static readonly templates = {
    en: {
      login: 'Your login code is {{otpCode}}. Valid for {{expiryTime}}.',
      registration: 'Welcome! Your verification code is {{otpCode}}. Valid for {{expiryTime}}.',
      password_reset: 'Password reset code: {{otpCode}}. Valid for {{expiryTime}}.'
    },
    hi: {
      login: 'आपका लॉगिन कोड {{otpCode}} है। {{expiryTime}} तक वैध।',
      registration: 'स्वागत! आपका सत्यापन कोड {{otpCode}} है। {{expiryTime}} तक वैध।',
      password_reset: 'पासवर्ड रीसेट कोड: {{otpCode}}। {{expiryTime}} तक वैध।'
    }
  };

  static getTemplate(
    language: 'en' | 'hi',
    purpose: 'login' | 'registration' | 'password_reset'
  ): string {
    return this.templates[language]?.[purpose] || this.templates.en[purpose];
  }
}

export default MessageTemplates;