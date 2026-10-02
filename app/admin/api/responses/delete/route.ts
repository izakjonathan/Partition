import { authorized, requestOrigin } from '@/lib/auth';
import { db } from '@/lib/db';
import { deleteConfirmationMessage } from '@/lib/confirmation-email';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  if (!requestOrigin(request)) return new Response('Forbidden', { status: 403 });
  if (!(await authorized())) return new Response('Unauthorized', { status: 401 });
  if (!process.env.DATABASE_URL) return new Response('Database unavailable', { status: 503 });
  let id: string;
  try { id = String((await request.json() as { id?: unknown }).id || ''); }
  catch { return new Response('Invalid request', { status: 400 }); }
  if (!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(id))
    return new Response('Invalid response ID', { status: 400 });
  const sql = db();
  const rows = await sql`SELECT confirmation_message_id FROM interests WHERE id=${id} AND verified_at IS NOT NULL LIMIT 1`;
  if (!rows.length) return new Response('Response not found', { status: 404 });
  try {
    if (rows[0].confirmation_message_id) await deleteConfirmationMessage(String(rows[0].confirmation_message_id));
    await sql`DELETE FROM interests WHERE id=${id} AND verified_at IS NOT NULL`;
    return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store' } });
  } catch {
    return new Response('Could not delete this response. Please try again.', { status: 503, headers: { 'Cache-Control': 'no-store' } });
  }
}
