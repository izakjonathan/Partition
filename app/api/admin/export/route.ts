import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

function field(value: unknown) {
  // Quote CSV cells and prevent spreadsheet formula execution on opening export.
  const s = String(value ?? '');
  const safe = /^[\s]*[=+@\-\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replaceAll('"', '""')}"`;
}

export async function GET() {
  if (!(await isAdmin())) return new Response('Forbidden', { status: 403 });
  const rows = await db()`SELECT id::text, full_name, email, postal_code, date_of_birth::text, created_at::text, verified_at::text, statement_revision, statement_snapshot, privacy_version FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC LIMIT 10000`;
  const cols = ['id', 'full_name', 'email', 'postal_code', 'date_of_birth', 'created_at', 'verified_at', 'statement_revision', 'statement_snapshot', 'privacy_version'] as const;
  const csv = [cols.map(field).join(','), ...rows.map(row => cols.map(key => field(row[key])).join(','))].join('\r\n');
  return new Response('\uFEFF' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="petition-support.csv"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
