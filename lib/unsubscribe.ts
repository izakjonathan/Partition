import 'server-only';
import { createHmac, timingSafeEqual } from 'node:crypto';

export function unsubscribeToken(id: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret || secret.length < 32) throw new Error('Unsubscribe secret missing');
  return createHmac('sha256', secret).update(`blues-updates:${id}`).digest('hex');
}

export function validUnsubscribe(id: string, token: string) {
  if (!/^[0-9a-f-]{36}$/.test(id) || !/^[a-f0-9]{64}$/.test(token)) return false;
  const actual = Buffer.from(token);
  const expected = Buffer.from(unsubscribeToken(id));
  return timingSafeEqual(actual, expected);
}
