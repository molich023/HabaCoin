import { neon } from '@neondatabase/serverless';

if (!process.env.DATABASE_URL) {
  throw new Error('DATABASE_URL is not defined in your environment variables');
}

// The serverless driver handles connection pooling automatically
export const sql = neon(process.env.DATABASE_URL);
