import dotenv from 'dotenv';
import path from 'path';
dotenv.config({ path: path.resolve(process.cwd(), '.env') });
export const config = {
  port: process.env.PORT || 4000,
  nodeEnv: process.env.NODE_ENV || 'development',
  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:5173',
  accessTokenSecret: process.env.ACCESS_TOKEN_SECRET,
  dbConnectionString: process.env.DB_CONNECTION_STRING,
  
  // Validation
  validate() {
    const required = ['ACCESS_TOKEN_SECRET'];
    const missing = required.filter(key => !process.env[key]);
    
    if (missing.length > 0) {
      throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
    }
  }
};
// Validate on startup
config.validate();
