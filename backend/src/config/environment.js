import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';

const cwdEnvPath = path.resolve(process.cwd(), '.env');
const rootEnvPath = path.resolve(process.cwd(), '..', '.env');
const envPath = fs.existsSync(cwdEnvPath)
    ? cwdEnvPath
    : fs.existsSync(rootEnvPath)
      ? rootEnvPath
      : null;

if (envPath) {
    dotenv.config({ path: envPath });
} else {
    dotenv.config();
}

export const config = {
    port: process.env.PORT || 4000,
    nodeEnv: process.env.NODE_ENV || 'development',
    frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
    accessTokenSecret: process.env.ACCESS_TOKEN_SECRET || 'default-secret-key-for-development',
    dbConnectionString: process.env.DB_CONNECTION_STRING || '',
    supabase: {
        url: process.env.SUPABASE_URL || '',
        serviceRoleKey: process.env.SUPABASE_KEY || '',
    },

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
        const missingSupabase = [];

        if (!process.env.SUPABASE_URL) {
            missingSupabase.push('SUPABASE_URL');
        }

        if (!process.env.SUPABASE_KEY) {
            missingSupabase.push('SUPABASE_KEY');
        }

        if (this.nodeEnv === 'production' && missingSupabase.length > 0) {
            throw new Error(`Missing required environment variables: ${missingSupabase.join(', ')}`);
        }

        if (missingSupabase.length > 0) {
            console.warn(
                '⚠️  WARNING: Supabase credentials are not fully configured. Authentication routes will be disabled until SUPABASE_URL and SUPABASE_KEY are set.'
            );
        }

        // Warn if using default values in production
        if (
            this.nodeEnv === 'production' &&
            this.accessTokenSecret === 'default-secret-key-for-development'
        ) {
            console.warn('⚠️  WARNING: Using default ACCESS_TOKEN_SECRET in production!');
        }

        if (this.nodeEnv === 'production' && this.supabase.serviceRoleKey === '') {
            console.warn('⚠️  WARNING: SUPABASE_KEY is empty in production environment');
        }
    },
};

// Validate on startup
config.validate();
