import { neon } from '@neondatabase/serverless';

// This function works in Next.js Edge Functions and Server Actions
export const getDb = () => {
  const sql = neon(process.env.DATABASE_URL!);
  return sql;
};
