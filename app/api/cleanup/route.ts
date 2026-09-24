import { timingSafeEqual } from 'node:crypto';
import { config } from '@/lib/config';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
    return new Response('Forbidden', { status: 403 });
  const c = config();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.retention)) return new Response('Retention date missing', { status: 503 });
  await db()`DELETE FROM interests WHERE created_at < ((${c.retention}::date + interval '1 day') AT TIME ZONE 'UTC')`;
  await db()`DELETE FROM interests WHERE verified_at IS NULL AND verification_expires_at < now()`;
  return new Response('OK', { headers: { 'Cache-Control': 'no-store' } });
}
