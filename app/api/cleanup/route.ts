import { timingSafeEqual } from 'node:crypto';
import { db } from '@/lib/db';
import { deleteConfirmationMessage } from '@/lib/confirmation-email';

export const dynamic = 'force-dynamic';

export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  const supplied = request.headers.get('authorization') || '';
  const expected = `Bearer ${secret}`;
  if (!secret || supplied.length !== expected.length || !timingSafeEqual(Buffer.from(supplied), Buffer.from(expected)))
    return new Response('Forbidden', { status: 403 });
  const sql = db();
  const expired = await sql`SELECT id::text, confirmation_message_id FROM interests
    WHERE created_at < now() - interval '6 months' OR (verified_at IS NULL AND verification_expires_at < now())
    ORDER BY created_at LIMIT 1000`;
  for (let offset = 0; offset < expired.length; offset += 25) {
    await Promise.allSettled(expired.slice(offset, offset + 25).map(async row => {
      if (row.confirmation_message_id) await deleteConfirmationMessage(String(row.confirmation_message_id));
      await sql`DELETE FROM interests WHERE id = ${row.id}`;
    }));
  }
  return new Response('OK', { headers: { 'Cache-Control': 'no-store' } });
}
