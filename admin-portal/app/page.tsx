import { db } from '@/lib/db';
import { authorized } from '@/lib/auth';
import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';
type Entry = { id: string; full_name: string; email: string; postal_code: string; date_of_birth: string | null; verified_at: string; privacy_version: string; statement_revision: string; statement_snapshot: string };

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!(await authorized())) redirect('/sign-in');
  const sql = db();
  if (!sql) return <main><span className="eyebrow">PRIVATE ADMIN</span><h1>Petition responses</h1><p>The database has not been connected to this private deployment yet.</p></main>;
  const requested = Number((await searchParams).page);
  const page = Number.isSafeInteger(requested) && requested >= 1 ? Math.min(requested, 10000) : 1;
  const [rows, summary] = await Promise.all([
    sql`SELECT id, full_name, email, postal_code, date_of_birth::text, verified_at::text, privacy_version, statement_revision, statement_snapshot FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC, id DESC LIMIT 50 OFFSET ${(page - 1) * 50}`,
    sql`SELECT count(*)::integer AS total FROM interests WHERE verified_at IS NOT NULL`,
  ]);
  const total = Number(summary[0]?.total || 0);
  return <main><header><div><span className="eyebrow">PRIVATE ADMIN</span><h1>Petition responses</h1><p>{total} email confirmed response{total === 1 ? '' : 's'} · Page {page}</p></div><div className="actions"><a className="button" href="/api/export">Download CSV</a><form method="post" action="/api/logout"><button type="submit">Sign out</button></form></div></header>
    <p className="hint">Email confirmation verifies control of an inbox, not a person’s legal identity.</p>
    <div className="table-wrap"><table><thead><tr><th>Confirmed (UTC)</th><th>Name</th><th>Email</th><th>Postal code</th><th>Birth date</th><th>Statement</th><th>Privacy notice</th></tr></thead><tbody>{(rows as Entry[]).map(row => <tr key={row.id}><td>{row.verified_at.slice(0, 19).replace('T', ' ')}</td><td>{row.full_name}</td><td>{row.email}</td><td>{row.postal_code}</td><td>{row.date_of_birth || '—'}</td><td><details><summary>Version {row.statement_revision}</summary><div className="statement">{row.statement_snapshot}</div></details></td><td>{row.privacy_version}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p>No confirmed responses yet.</p>}
    <nav>{page > 1 && <a href={`/?page=${page - 1}`}>← Previous</a>}{page * 50 < total && <a href={`/?page=${page + 1}`}>Next →</a>}</nav>
  </main>;
}
