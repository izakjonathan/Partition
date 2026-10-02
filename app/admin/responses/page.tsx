import { authorized } from '@/lib/auth';
import { db } from '@/lib/db';
import { cityForPostcode } from '@/lib/postal-city';
import { redirect } from 'next/navigation';
import { ManagerHeader } from '../manager-header';
import { ResponsesTable, type ResponseRow } from './responses-table';

export const dynamic = 'force-dynamic';
export default async function Responses() {
  if (!(await authorized())) redirect('/admin/sign-in');
  if (!process.env.DATABASE_URL) return <main className="manager-shell"><ManagerHeader section="responses"/><div className="manager-main"><h1>Responses</h1><p>Database connection is missing.</p></div></main>;
  const sql = db();
  const [rows, optinRows] = await Promise.all([
    sql`SELECT id::text, full_name, email, postal_code, date_of_birth::text, age_band, created_at::text, verified_at::text,
      privacy_version, statement_revision, statement_snapshot, marketing_consent_at::text, marketing_withdrawn_at::text
      FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC`,
    sql`SELECT email FROM interests WHERE verified_at IS NOT NULL AND marketing_consent_at IS NOT NULL
      AND marketing_withdrawn_at IS NULL AND created_at >= now() - interval '6 months' ORDER BY email`,
  ]);
  const codes = [...new Set(rows.map(row => String(row.postal_code)))];
  const cities = Object.fromEntries(await Promise.all(codes.map(async code => [code, await cityForPostcode(code)] as const)));
  return <main className="manager-shell"><ManagerHeader section="responses"/><div className="manager-main">
    <div className="section-intro"><h1>Responses<span className="title-dot">.</span></h1></div>
    <div className="list-actions"><a className="pill-button" href="/admin/api/export">Download all responses ↗</a><a className="pill-button outline" href="/admin/api/updates-export">Download email opt-ins ↗</a></div>
    <ResponsesTable rows={rows as ResponseRow[]} cities={cities} optinEmails={optinRows.map(row => String(row.email))}/>
  </div></main>;
}
