'use server';

import { createHash, randomBytes, randomUUID } from 'node:crypto';
import { config, privacyVersion } from '@/lib/config';
import { db } from '@/lib/db';
import { sendConfirmation } from '@/lib/mail';
import { bluesEmailConsent } from '@/lib/consent';

export type FormState = { status: 'idle' | 'success' | 'error'; message: string };

export async function registerInterest(_previous: FormState, form: FormData): Promise<FormState> {
  const c = await config();
  if (!c.ready) return { status: 'error', message: 'Signing is not available yet.' };
  const generic = { status: 'success', message: 'If this email can be used, a confirmation link will arrive shortly. Open it to count your support.' } as const;
  if (form.get('website')) return generic;
  const name = String(form.get('name') || '').trim().replace(/\s+/g, ' ');
  const email = String(form.get('email') || '').trim().toLowerCase();
  const postcode = String(form.get('postcode') || '').trim();
  const dob = c.dob ? String(form.get('dob') || '') : '';
  if (name.length < 2 || name.length > 120 || /[<>\x00-\x1f]/.test(name))
    return { status: 'error', message: 'Enter your full name (2–120 characters).' };
  if (email.length > 254 || !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))
    return { status: 'error', message: 'Enter a valid email address.' };
  if (!/^\d{4}$/.test(postcode))
    return { status: 'error', message: 'Enter a four digit Danish postcode.' };
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
    await sql`DELETE FROM interests WHERE email = ${email} AND verified_at IS NULL AND verification_expires_at < now()`;
    const token = randomBytes(32).toString('hex');
    const digest = createHash('sha256').update(token).digest('hex');
    const rows = await sql`INSERT INTO interests (id, full_name, email, postal_code, date_of_birth, privacy_version, statement_snapshot, statement_revision, verification_token_hash, verification_expires_at, marketing_requested, marketing_consent_text)
      VALUES (${id}, ${name}, ${email}, ${postcode}, ${dob || null}, ${privacyVersion}, ${c.statement}, ${c.revision}, ${digest}, now() + interval '24 hours', ${updates}, ${updates ? bluesEmailConsent : null})
      ON CONFLICT (email) DO NOTHING RETURNING id`;
    if (!rows.length) return generic;
    const confirmUrl = `${c.site.replace(/\/$/, '')}/confirm?token=${token}`;
    try {
      await sendConfirmation(email, `Bekræft din støtte: ${c.title}`,
        `Bekræft din støtte til “${c.title}” (version ${c.revision}) her:\n\n${confirmUrl}\n\n${updates ? 'Du valgte også at modtage e-mails fra Blågårds Apotek om kommende bluesarrangementer. Dette begynder først, når du bekræfter din støtte.\n\n' : ''}Linket udløber efter 24 timer. Hvis du ikke har bedt om det, kan du ignorere denne e-mail.`);
    } catch {
      await sql`DELETE FROM interests WHERE id = ${id} AND verified_at IS NULL`;
      return { status: 'error', message: 'Confirmation email could not be sent. Please try again later.' };
    }
    return generic;
  } catch {
    // A delivery/network failure must not reserve someone's email for 24 hours.
    try { await db()`DELETE FROM interests WHERE id = ${id} AND verified_at IS NULL`; } catch {}
    return { status: 'error', message: 'We could not save your response. Please try again later.' };
  }
}
