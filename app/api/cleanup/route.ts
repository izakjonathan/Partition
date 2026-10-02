import { timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { deleteVerificationAccount } from '@/lib/firebase-verification';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
    return new Response('Forbidden', { status: 403 });
  const sql = db();
  const accounts = await sql`SELECT id::text, email FROM interests WHERE firebase_account_pending = true
    AND (verified_at IS NOT NULL OR verification_expires_at < now() OR created_at < now() - interval '6 months')
    ORDER BY created_at LIMIT 1000`;
  for (let offset = 0; offset < accounts.length; offset += 25) {
    await Promise.allSettled(accounts.slice(offset, offset + 25).map(async row => {
      await deleteVerificationAccount(String(row.id), String(row.email));
      await sql`UPDATE interests SET firebase_account_pending = false WHERE id = ${row.id}`;
    }));
  }
  await sql`DELETE FROM interests WHERE created_at < now() - interval '6 months' AND firebase_account_pending = false`;
  await sql`DELETE FROM interests WHERE verified_at IS NULL AND verification_expires_at < now() AND firebase_account_pending = false`;
  return new Response('OK', { headers: { 'Cache-Control': 'no-store' } });
}
