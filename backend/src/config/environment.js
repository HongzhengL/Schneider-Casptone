import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'default-secret-key-for-development',
  dbConnectionString: process.env.DB_CONNECTION_STRING || '',
  
  // Error handling configuration
  errorHandling: {
    logErrors: process.env.LOG_ERRORS !== 'false',
    logLevel: process.env.LOG_LEVEL || 'error',
    maxErrorLogs: parseInt(process.env.MAX_ERROR_LOGS) || 1000,
    errorLogRetentionDays: parseInt(process.env.ERROR_LOG_RETENTION_DAYS) || 30,
  },
  
  // Rate limiting
  rateLimit: {
    maxErrors: parseInt(process.env.MAX_ERRORS_PER_IP) || 10,
    windowMs: parseInt(process.env.RATE_LIMIT_WINDOW_MS) || 15 * 60 * 1000,
  },
  
  // Validation
  validate() {
    const required = [];  // Empty for now - no required env vars in development
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
    
    // Warn if using default values in production
    if (this.nodeEnv === 'production' && this.accessTokenSecret === 'default-secret-key-for-development') {
      console.warn('⚠️  WARNING: Using default ACCESS_TOKEN_SECRET in production!');
    }
  }
};

// Validate on startup
config.validate();
