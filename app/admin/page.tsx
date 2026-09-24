import { redirect } from 'next/navigation';
import { UserButton } from '@clerk/nextjs';
import { auth } from '@clerk/nextjs/server';
import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import { deleteByEmail, deleteInterest, purgeExpired } from './actions';

export const dynamic = 'force-dynamic';

type Entry = { id: string; full_name: string; email: string; postal_code: string; date_of_birth: string | null; verified_at: string; privacy_version: string; statement_revision: string; statement_snapshot: string };

export default async function Admin({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  if (!(await isAdmin())) {
    const { userId } = await auth();
    if (!userId) redirect('/admin/sign-in');
    return <main className="narrow"><h1>Access denied</h1><p>This account is not authorised to view responses.</p><UserButton /></main>;
  }
  const requested = Number((await searchParams).page);
  const page = Number.isSafeInteger(requested) && requested >= 1 ? Math.min(requested, 10000) : 1;
  const sql = db();
  const [rows, summary] = await Promise.all([
    sql`SELECT id, full_name, email, postal_code, date_of_birth::text, verified_at::text, privacy_version, statement_revision, statement_snapshot FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC, id DESC LIMIT 50 OFFSET ${(page - 1) * 50}`,
    sql`SELECT count(*)::integer AS total FROM interests WHERE verified_at IS NOT NULL`,
  ]);
  const total = Number(summary[0]?.total || 0);
  return <main className="wide"><div className="admin-head"><div><span className="eyebrow">PRIVATE ADMIN</span><h1>{config().title || 'Petition'}</h1><p>{total} email confirmed supporter{total === 1 ? '' : 's'} · Page {page}</p></div><UserButton /></div>
    <div className="toolbar"><a className="button secondary" href="/api/admin/export">Download CSV</a><form action={purgeExpired}><button className="secondary">Delete expired responses</button></form></div>
    <details><summary>Delete a response by email</summary><p>Use this after verifying an access or deletion request from the person concerned.</p><form action={deleteByEmail} className="inline"><input type="email" name="email" placeholder="person@example.com" required /><button>Delete matching response</button></form></details>
    <div className="table-wrap"><table><thead><tr><th>Confirmed (UTC)</th><th>Name</th><th>Email</th><th>Postcode</th><th>Date of birth</th><th>Statement</th><th>Privacy version</th><th></th></tr></thead><tbody>{(rows as Entry[]).map(row => <tr key={row.id}><td>{row.verified_at.slice(0, 19).replace('T', ' ')}</td><td>{row.full_name}</td><td><a href={`mailto:${row.email}`}>{row.email}</a></td><td>{row.postal_code}</td><td>{row.date_of_birth || '—'}</td><td><details><summary>Version {row.statement_revision}</summary><div className="statement">{row.statement_snapshot}</div></details></td><td>{row.privacy_version}</td><td><form action={deleteInterest}><input type="hidden" name="id" value={row.id} /><button className="danger" aria-label={`Delete ${row.full_name}`}>Delete</button></form></td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p>No responses on this page.</p>}
    <nav className="pager">{page > 1 && <a href={`/admin?page=${page - 1}`}>← Previous</a>}{page * 50 < total && <a href={`/admin?page=${page + 1}`}>Next →</a>}</nav>
  </main>;
}
