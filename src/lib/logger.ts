import winston from 'winston';

const isProduction = process.env.NODE_ENV === 'production';

// Custom format for console output
const consoleFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.colorize(),
  winston.format.printf(({ timestamp, level, message, ...metadata }) => {
    let msg = `${timestamp} [${level}]: ${message}`;
    if (Object.keys(metadata).length > 0) {
      msg += ` ${JSON.stringify(metadata)}`;
    }
    return msg;
  })
);

// Custom format for file output
const fileFormat = winston.format.combine(
  winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss' }),
  winston.format.errors({ stack: true }),
  winston.format.json()
);

// Create logger instance
const logger = winston.createLogger({
  level: isProduction ? 'info' : 'debug',
  format: fileFormat,
  defaultMeta: { service: 'restaurant-daily' },
  transports: [
    // Error logs
    new winston.transports.File({
      filename: 'logs/error.log',
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
    // Combined logs
    new winston.transports.File({
      filename: 'logs/combined.log',
      maxsize: 5242880, // 5MB
      maxFiles: 5,
    }),
  ],
});

// Add console transport in non-production
if (!isProduction) {
  logger.add(
    new winston.transports.Console({
      format: consoleFormat,
    })
  );
}

// Helper methods for common logging patterns
export const logAuth = (action: string, phoneNumber: string, success: boolean, metadata?: object) => {
  logger.info('Auth Event', {
    action,
    phoneNumber: phoneNumber.slice(-4), // Only log last 4 digits for privacy
    success,
    ...metadata,
  });
};

export const logAPI = (method: string, path: string, statusCode: number, duration?: number, metadata?: object) => {
  logger.info('API Request', {
    method,
    path,
    statusCode,
    duration: duration ? `${duration}ms` : undefined,
    ...metadata,
  });
};

export const logError = (error: Error, context?: string, metadata?: object) => {
  logger.error('Application Error', {
    message: error.message,
    stack: error.stack,
    context,
    ...metadata,
  });
};

export const logDB = (operation: string, table: string, success: boolean, metadata?: object) => {
  logger.info('Database Operation', {
    operation,
    table,
    success,
    ...metadata,
  });
};

export const logSMS = (action: string, recipient: string, success: boolean, metadata?: object) => {
  logger.info('SMS Event', {
    action,
    recipient: recipient.slice(-4), // Only log last 4 digits for privacy
    success,
    ...metadata,
  });
};

export default logger;
