import { db } from '@/lib/db';
import { authorized } from '@/lib/auth';
import { redirect } from 'next/navigation';
import { petitionSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
type Entry = { id: string; full_name: string; email: string; postal_code: string; date_of_birth: string | null; verified_at: string; privacy_version: string; statement_revision: string; statement_snapshot: string; marketing_consent_at: string | null; marketing_withdrawn_at: string | null };

export default async function Home({ searchParams }: { searchParams: Promise<{ page?: string; notice?: string }> }) {
  if (!(await authorized())) redirect('/admin/sign-in');
  if (!process.env.DATABASE_URL) return <main className="narrow"><span className="eyebrow">MANAGER</span><h1>Petition responses</h1><p>The database connection is not configured in this Vercel project.</p></main>;
  const settings = await petitionSettings();
  const notice = (await searchParams).notice;
  const sql = db();
  const requested = Number((await searchParams).page);
  const page = Number.isSafeInteger(requested) && requested >= 1 ? Math.min(requested, 10000) : 1;
  const [rows, summary] = await Promise.all([
    sql`SELECT id, full_name, email, postal_code, date_of_birth::text, verified_at::text, privacy_version, statement_revision, statement_snapshot, marketing_consent_at::text, marketing_withdrawn_at::text FROM interests WHERE verified_at IS NOT NULL ORDER BY verified_at DESC, id DESC LIMIT 50 OFFSET ${(page - 1) * 50}`,
    sql`SELECT count(*)::integer AS total FROM interests WHERE verified_at IS NOT NULL`,
  ]);
  const total = Number(summary[0]?.total || 0);
  return <main className="wide admin"><header className="admin-head"><div><span className="eyebrow">MANAGER</span><h1>Petition responses</h1><p>{total} email confirmed response{total === 1 ? '' : 's'} · Page {page}</p></div><div className="inline"><a className="button" href="/admin/api/export">Download responses</a><a className="button" href="/admin/api/updates-export">Download blues email opt-ins</a><form method="post" action="/admin/api/logout"><button className="secondary" type="submit">Sign out</button></form></div></header>
    {notice && <p className={notice.includes('error') || notice === 'placeholder' || notice === 'invalid' ? 'error' : 'notice'} role="status">{({saved: 'Draft saved.', published: 'Statement published as a new version.', placeholder: 'Replace YYYYY with the correct band name before publishing.', invalid: 'Enter a statement between 30 and 10,000 characters.', 'email-error': 'Check the new email address and your current password.'} as Record<string, string>)[notice] || ''}</p>}
    <section className="card admin-settings"><h2>Petition statement</h2><p>Draft changes are private until you publish. Each publication creates a new version; existing responses retain their own statement.</p>
      <form className="form" method="post" action="/admin/api/petition">
        <label>Statement<textarea name="statement" defaultValue={settings?.draft} rows={17} minLength={30} maxLength={10000} required /></label>
        <div className="inline"><button name="intent" value="save" type="submit">Save draft</button><button name="intent" value="publish" type="submit">Publish new version</button></div>
      </form><p className="hint">Published version: {settings?.revision || 'none'}. Replace YYYYY before publishing.</p>
    </section>
    <section className="card admin-settings"><h2>Manager sign-in email</h2><p>Current address: {settings?.manager_email}. Changing it signs you out; use the new email and the same password next time.</p>
      <form className="form" method="post" action="/admin/api/email">
        <label>New email<input type="email" name="email" maxLength={254} required /></label>
        <label>Repeat new email<input type="email" name="confirmEmail" maxLength={254} required /></label>
        <label>Current password<input type="password" name="password" autoComplete="current-password" required /></label>
        <button type="submit">Change manager email</button>
      </form>
    </section>
<p className="hint">The blues email export includes only confirmed, active opt-ins and an unsubscribe link per person. Use an email platform that supports consent and opt-outs; refresh the export before sending. Do not send bulk mail through iCloud.</p>
    <p className="hint">Email confirmation verifies control of an inbox, not a person’s legal identity.</p>
    <div className="table-wrap"><table><thead><tr><th>Confirmed (UTC)</th><th>Name</th><th>Email</th><th>Postal code</th><th>Birth date</th><th>Blues email opt-in</th><th>Statement</th><th>Privacy notice</th></tr></thead><tbody>{(rows as Entry[]).map(row => <tr key={row.id}><td>{row.verified_at.slice(0, 19).replace('T', ' ')}</td><td>{row.full_name}</td><td>{row.email}</td><td>{row.postal_code}</td><td>{row.date_of_birth || '—'}</td><td>{row.marketing_consent_at && !row.marketing_withdrawn_at ? `Yes · ${row.marketing_consent_at.slice(0,10)}` : 'No'}</td><td><details><summary>Version {row.statement_revision}</summary><div className="statement">{row.statement_snapshot}</div></details></td><td>{row.privacy_version}</td></tr>)}</tbody></table></div>
    {rows.length === 0 && <p>No confirmed responses yet.</p>}
    <nav className="pager">{page > 1 && <a href={`/admin?page=${page - 1}`}>← Previous</a>}{page * 50 < total && <a href={`/admin?page=${page + 1}`}>Next →</a>}</nav>
  </main>;
}
