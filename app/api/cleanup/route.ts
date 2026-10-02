import { timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
    return new Response('Forbidden', { status: 403 });
  await db()`DELETE FROM interests WHERE created_at < now() - interval '6 months'`;
  await db()`DELETE FROM interests WHERE verified_at IS NULL AND verification_expires_at < now()`;
  return new Response('OK', { headers: { 'Cache-Control': 'no-store' } });
}
