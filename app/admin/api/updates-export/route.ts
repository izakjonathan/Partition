import { db } from '@/lib/db';
import { authorized } from '@/lib/auth';
import { unsubscribeToken } from '@/lib/unsubscribe';

export const dynamic = 'force-dynamic';
function field(value: unknown) {
  const s = String(value ?? '');
  const safe = /^[\s]*[=+@\-\t\r]/.test(s) ? `'${s}` : s;
  return `"${safe.replaceAll('"', '""')}"`;
}
export async function GET() {
  if (!(await authorized())) return new Response('Unauthorized', { status: 401, headers: { 'Cache-Control': 'no-store' } });
  const site = process.env.SITE_URL?.replace(/\/$/, '');
  if (!site || !process.env.DATABASE_URL) return new Response('Configuration missing', { status: 503 });
  const rows = await db()`SELECT id::text, email, full_name, marketing_consent_at::text, marketing_consent_text
    FROM interests WHERE verified_at IS NOT NULL AND marketing_consent_at IS NOT NULL AND marketing_withdrawn_at IS NULL AND created_at >= now() - interval '6 months'
    ORDER BY marketing_consent_at DESC`;
  const columns = ['email', 'full_name', 'marketing_consent_at', 'marketing_consent_text', 'unsubscribe_url'];
  const csv = [columns.map(field).join(','), ...rows.map(row => [row.email, row.full_name, row.marketing_consent_at, row.marketing_consent_text,
    `${site}/unsubscribe?id=${row.id}&token=${unsubscribeToken(String(row.id))}`].map(field).join(','))].join('\r\n');
  return new Response('\uFEFF' + csv, { headers: { 'Content-Type': 'text/csv; charset=utf-8', 'Content-Disposition': 'attachment; filename="blues-email-opt-ins.csv"', 'Cache-Control': 'private, no-store', 'X-Content-Type-Options': 'nosniff' } });
}
