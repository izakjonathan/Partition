'use server';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { config, privacyVersion } from '@/lib/config';
import { db } from '@/lib/db';
import { sendConfirmation, deleteVerificationAccount } from '@/lib/firebase-verification';
import { bluesEmailConsent } from '@/lib/consent';
import { ageBands } from '@/lib/age-bands';

export type FormState = { status: 'idle' | 'success' | 'error'; message: string };

export async function registerInterest(_previous: FormState, form: FormData): Promise<FormState> {
  const c = await config();
  if (!c.ready) return { status: 'error', message: 'Signing is not available yet.' };
  const generic = { status: 'success', message: 'Hvis e-mailadressen kan bruges, kommer der snart et bekræftelseslink fra Firebase. Åbn linket for at tælle din støtte med.' } as const;
  if (form.get('website')) return generic;
  const name = String(form.get('name') || '').trim().replace(/\s+/g, ' ');
  const email = String(form.get('email') || '').trim().toLowerCase();
  const postcode = String(form.get('postcode') || '').trim();
  const ageBand = String(form.get('ageBand') || '');
  const dob = c.dob ? String(form.get('dob') || '') : '';
  if (name.length < 2 || name.length > 120 || /[<>\x00-\x1f]/.test(name))
    return { status: 'error', message: 'Enter your full name (2–120 characters).' };
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { status: 'error', message: 'Enter a valid email address.' };
  if (!/^\d{4}$/.test(postcode))
    return { status: 'error', message: 'Enter a four digit Danish postcode.' };
  if (ageBand && !ageBands.some(band => band.value === ageBand))
    return { status: 'error', message: 'Choose a valid age range.' };
  if (c.dob && (!/^\d{4}-\d{2}-\d{2}$/.test(dob) || isNaN(Date.parse(dob)) || new Date(dob).toISOString().slice(0, 10) !== dob || dob > new Date().toISOString().slice(0, 10)))
    return { status: 'error', message: 'Enter a valid date of birth.' };
  if (form.get('acknowledgement') !== 'yes')
    return { status: 'error', message: 'Please confirm that you have read the privacy information.' };
  if (form.get('support') !== 'yes')
    return { status: 'error', message: 'Please confirm that you support the petition statement.' };
  const updates = form.get('updates') === 'yes';
  const id = randomUUID();
  try {
    const sql = db();
    // A confirmation link works once; pending records expire after 24 hours.
    const expired = await sql`SELECT id::text, email, firebase_account_pending FROM interests WHERE email = ${email} AND verified_at IS NULL AND verification_expires_at < now()`;
    for (const row of expired) {
      if (row.firebase_account_pending) await deleteVerificationAccount(String(row.id), String(row.email));
      await sql`DELETE FROM interests WHERE id = ${row.id} AND verified_at IS NULL`;
    }
    const token = randomBytes(32).toString('hex');
    const digest = createHash('sha256').update(token).digest('hex');
    const rows = await sql`INSERT INTO interests (id, full_name, email, postal_code, date_of_birth, age_band, firebase_account_pending, privacy_version, statement_snapshot, statement_revision, verification_token_hash, verification_expires_at, marketing_requested, marketing_consent_text)
      VALUES (${id}, ${name}, ${email}, ${postcode}, ${dob || null}, ${ageBand || null}, true, ${privacyVersion}, ${c.statement}, ${c.revision}, ${digest}, now() + interval '24 hours', ${updates}, ${updates ? bluesEmailConsent : null})
      ON CONFLICT (email) DO NOTHING RETURNING id`;
    if (!rows.length) return generic;
    const confirmUrl = `${c.site.replace(/\/$/, '')}/confirm?token=${token}`;
    try {
      await sendConfirmation(id, email, confirmUrl);
    } catch {
      try {
        await deleteVerificationAccount(id, email);
        await sql`DELETE FROM interests WHERE id = ${id} AND verified_at IS NULL`;
      } catch { /* Keep the pending row for the cleanup job. */ }
      return { status: 'error', message: 'Bekræftelsesmailen kunne ikke sendes. Prøv igen senere.' };
    }
    return generic;
  } catch {
    // A delivery/network failure must not reserve someone's email for 24 hours.
    try {
      await deleteVerificationAccount(id, email);
      await db()`DELETE FROM interests WHERE id = ${id} AND verified_at IS NULL`;
    } catch { /* Keep the pending row for the cleanup job. */ }
    return { status: 'error', message: 'We could not save your response. Please try again later.' };
  }
}
