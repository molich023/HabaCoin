import { neon, neonConfig } from '@neondatabase/serverless';

// Optimize connection pipelines across Edge networks
neonConfig.fetchConnectionCache = true;

if (!process.env.DATABASE_URL) {
  throw new Error('[CRITICAL] DATABASE_URL is unassigned in the system environment variables.');
}

// Global cached connection reference instance
let cachedSqlInstance: any = null;

export const getDb = () => {
  if (!cachedSqlInstance) {
    cachedSqlInstance = neon(process.env.DATABASE_URL!);
  }
  return cachedSqlInstance;
};

// Export direct variable handle for traditional Node pipelines
export const sql = getDb();
