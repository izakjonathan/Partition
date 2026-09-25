import { db } from '@/lib/db';
import { authorized } from '@/lib/auth';

export const dynamic = 'force-dynamic';
function field(value: unknown) {
  const s = String(value ?? '');
  const safe = /^[\s]*[=+@\-\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replaceAll('"', '""')}"`;
}
export async function GET() {
  if (!(await authorized())) return new Response('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const sql = db();
  if (!sql) return new Response('Database unavailable', { status: 503 });
  const rows = await sql`SELECT id::text, full_name, email, postal_code, date_of_birth::text, created_at::text, verified_at::text, statement_revision, statement_snapshot, privacy_version FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC LIMIT 10000`;
  const cols = ['id', 'full_name', 'email', 'postal_code', 'date_of_birth', 'created_at', 'verified_at', 'statement_revision', 'statement_snapshot', 'privacy_version'] as const;
  const csv = [cols.map(field).join(','), ...rows.map(row => cols.map(key => field(row[key])).join(','))].join('\r\n');
  return new Response('\uFEFF' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="petition-responses.csv"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
