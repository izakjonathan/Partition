import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';
import { petitionSettings } from './settings';

export const cookieName = '__Host-petition_admin';
const duration = 8 * 60 * 60;

export function requestOrigin(request: Request) {
  const supplied = request.headers.get('origin');
  const host = request.headers.get('host');
  if (!supplied || !host) return null;
  try {
    const url = new URL(supplied);
    if (url.host !== host || (url.protocol !== 'https:' && !(url.protocol === 'http:' && ['localhost', '127.0.0.1'].includes(url.hostname)))) return null;
    return url.origin;
  } catch { return null; }
}

async function settings() {
  const password = process.env.ADMIN_PASSWORD || '';
  const secret = process.env.ADMIN_SESSION_SECRET || '';
  if (password.length < 32 || secret.length < 32) return null;
  const stored = await petitionSettings();
  return { password, secret, email: stored?.manager_email || 'izakhyllested@icloud.com' };
}

function mac(value: string, secret: string) {
  return createHmac('sha256', secret).update(value).digest('hex');
}

function equal(a: string, b: string) {
  const first = Buffer.from(a);
  const second = Buffer.from(b);
  return first.length === second.length && timingSafeEqual(first, second);
}

export async function configured() { return !!(await settings()); }

export async function checkCredentials(email: string, password: string) {
  const s = await settings();
  if (!s || password.length > 512 || email.length > 256) return false;
  const supplied = mac(password, s.secret);
  const expected = mac(s.password, s.secret);
  return equal(email.trim().toLowerCase(), s.email) && equal(supplied, expected);
}

export async function session() {
  const s = await settings();
  if (!s) return null;
  const expires = Math.floor(Date.now() / 1000) + duration;
  const value = `${expires}.${mac(`${expires}:${s.email}`, s.secret)}`;
  return { value, maxAge: duration };
}

export async function authorized() {
  const s = await settings();
  if (!s) return false;
  const value = (await cookies()).get(cookieName)?.value || '';
  const match = /^(\d{10})\.([a-f0-9]{64})$/.exec(value);
  if (!match) return false;
  const expires = Number(match[1]);
  if (expires < Date.now() / 1000 || expires > Date.now() / 1000 + duration) return false;
  return equal(match[2], mac(`${expires}:${s.email}`, s.secret));
}
