'use server';

import { revalidatePath } from 'next/cache';
import { isAdmin } from '@/lib/admin';
import { db } from '@/lib/db';
import { config } from '@/lib/config';

export async function deleteInterest(form: FormData) {
  if (!(await isAdmin())) throw new Error('Forbidden');
  const id = String(form.get('id') || '');
  if (!/^[0-9a-f]{8}-[0-9a-f-]{27,36}$/i.test(id)) throw new Error('Invalid ID');
  await db()`DELETE FROM interests WHERE id = ${id}`;
  revalidatePath('/admin');
}

export async function deleteByEmail(form: FormData) {
  if (!(await isAdmin())) throw new Error('Forbidden');
  const email = String(form.get('email') || '').trim().toLowerCase();
  if (!email || email.length > 254) throw new Error('Invalid email');
  await db()`DELETE FROM interests WHERE email = ${email}`;
  revalidatePath('/admin');
}

export async function purgeExpired() {
  if (!(await isAdmin())) throw new Error('Forbidden');
  const c = config();
  if (!/^\d{4}-\d{2}-\d{2}$/.test(c.retention)) throw new Error('Invalid retention date');
  await db()`DELETE FROM interests WHERE created_at < ((${c.retention}::date + interval '1 day') AT TIME ZONE 'UTC')`;
  await db()`DELETE FROM interests WHERE verified_at IS NULL AND verification_expires_at < now()`;
  revalidatePath('/admin');
}
