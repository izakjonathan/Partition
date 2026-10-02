import { createHash } from 'node:crypto';
import { db } from '@/lib/db';
import { config } from '@/lib/config';
import { deleteVerificationAccount, verifiedEmail } from '@/lib/firebase-verification';

export const dynamic = 'force-dynamic';

export default async function Confirm({ searchParams }: { searchParams: Promise<{ token?: string; done?: string; error?: string }> }) {
  const { token, done, error } = await searchParams;
  if (done === 'yes') return <main className="narrow"><h1>Support confirmed</h1><p>Thank you. Your support has been counted.</p><a href="/">Back to petition</a></main>;
  if (!token || !/^[0-9a-f]{64}$/.test(token)) return <main className="narrow"><h1>Invalid link</h1><p>Please request a new link using the petition form.</p></main>;
  const digest = createHash('sha256').update(token).digest('hex');
  const rows = await db()`SELECT statement_snapshot, statement_revision, marketing_requested FROM interests WHERE verification_token_hash = ${digest} AND verified_at IS NULL AND verification_expires_at > now() LIMIT 1`;
  if (!rows.length) return <main className="narrow"><h1>Link expired or already used</h1><p>Submit the form again if you still want to support the petition.</p></main>;
  const current = await config();
  return <main className="narrow"><span className="eyebrow">CONFIRM SUPPORT</span><h1>{current.title}</h1><p>Check the exact text below, then confirm. Your email address has not yet been counted.</p>
    {error && <p className="error" role="alert">Complete the verification in the Firebase email first, then return here. The link may have expired; if so, submit the form again.</p>}
    {rows[0].marketing_requested && <p>You also chose to receive email updates about blues events at Blågårds Apotek. You can unsubscribe at any time.</p>}
    <section className="card"><h2>Petition statement · version {String(rows[0].statement_revision)}</h2><div className="statement">{String(rows[0].statement_snapshot)}</div>
      <form action={confirmSupport}><input type="hidden" name="token" value={token} /><button>Confirm support</button></form></section>
  </main>;
}

async function confirmSupport(form: FormData) {
  'use server';
  const { redirect } = await import('next/navigation');
  const token = String(form.get('token') || '');
  if (!/^[0-9a-f]{64}$/.test(token)) redirect('/confirm');
  const digest = createHash('sha256').update(token).digest('hex');
  const c = await config();
  if (!c.ready) redirect('/');
  const pending = await db()`SELECT id::text, email, firebase_account_pending FROM interests WHERE verification_token_hash = ${digest} AND verified_at IS NULL AND verification_expires_at > now() LIMIT 1`;
  if (!pending.length) redirect('/confirm');
  const row = pending[0];
  if (row.firebase_account_pending) {
    let verified = false;
    try { verified = await verifiedEmail(String(row.id), String(row.email)); } catch {}
    if (!verified) redirect(`/confirm?token=${token}&error=verify`);
  }
  const rows = await db()`UPDATE interests SET verified_at = now(), marketing_consent_at = CASE WHEN marketing_requested THEN now() ELSE NULL END, verification_token_hash = NULL, verification_expires_at = NULL
    WHERE verification_token_hash = ${digest} AND verified_at IS NULL AND verification_expires_at > now() RETURNING id`;
  if (!rows.length) redirect('/confirm');
  if (row.firebase_account_pending) {
    try {
      await deleteVerificationAccount(String(row.id), String(row.email));
      await db()`UPDATE interests SET firebase_account_pending = false WHERE id = ${row.id}`;
    } catch { /* The cleanup job will retry deletion. */ }
  }
  redirect('/confirm?done=yes');
}
