import { db } from '@/lib/db';
import { authorized } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
type Entry = { id: string; full_name: string; email: string; postal_code: string; date_of_birth: string | null; verified_at: string; privacy_version: string; statement_revision: string; statement_snapshot: string };

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!(await authorized())) redirect('/admin/sign-in');
  if (!process.env.DATABASE_URL) return <main className="narrow"><span className="eyebrow">MANAGER</span><h1>Petition responses</h1><p>The database connection is not configured in this Vercel project.</p></main>;
  const sql = db();
  const requested = Number((await searchParams).page);
  const page = Number.isSafeInteger(requested) && requested >= 1 ? Math.min(requested, 10000) : 1;
  const [rows, summary] = await Promise.all([
    sql`SELECT id, full_name, email, postal_code, date_of_birth::text, verified_at::text, privacy_version, statement_revision, statement_snapshot FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC, id DESC LIMIT 50 OFFSET ${(page - 1) * 50}`,
    sql`SELECT count(*)::integer AS total FROM interests WHERE verified_at IS NOT NULL`,
  ]);
  const total = Number(summary[0]?.total || 0);
  return <main className="wide admin"><header className="admin-head"><div><span className="eyebrow">MANAGER</span><h1>Petition responses</h1><p>{total} email confirmed response{total === 1 ? '' : 's'} · Page {page}</p></div><div className="inline"><a className="button" href="/admin/api/export">Download CSV</a><form method="post" action="/admin/api/logout"><button className="secondary" type="submit">Sign out</button></form></div></header>
    <p className="hint">Email confirmation verifies control of an inbox, not a person’s legal identity.</p>
    <div className="table-wrap"><table><thead><tr><th>Confirmed (UTC)</th><th>Name</th><th>Email</th><th>Postal code</th><th>Birth date</th><th>Statement</th><th>Privacy notice</th></tr></thead><tbody>{(rows as Entry[]).map(row => <tr key={row.id}><td>{row.verified_at.slice(0, 19).replace('T', ' ')}</td><td>{row.full_name}</td><td>{row.email}</td><td>{row.postal_code}</td><td>{row.date_of_birth || '—'}</td><td><details><summary>Version {row.statement_revision}</summary><div className="statement">{row.statement_snapshot}</div></details></td><td>{row.privacy_version}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p>No confirmed responses yet.</p>}
    <nav className="pager">{page > 1 && <a href={`/admin?page=${page - 1}`}>← Previous</a>}{page * 50 < total && <a href={`/admin?page=${page + 1}`}>Next →</a>}</nav>
  </main>;
}
