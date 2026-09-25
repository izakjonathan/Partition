import 'server-only';
import { neon } from '@neondatabase/serverless';

export function db() {
  if (!process.env.DATABASE_URL) return null;
  return neon(process.env.DATABASE_URL);
}
