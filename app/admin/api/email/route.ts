import { authorized, checkCredentials, cookieName, requestOrigin } from '@/lib/auth';
import { db } from '@/lib/db';
import { petitionSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin) return new Response('Forbidden', { status: 403 });
  if (!(await authorized())) return new Response('Unauthorized', { status: 401 });
  const data = await request.formData();
  const current = (await petitionSettings())?.manager_email || 'izakhyllested@icloud.com';
  const password = String(data.get('password') || '');
  const confirmEmail = String(data.get('confirmEmail') || '').trim().toLowerCase();
  const email = String(data.get('email') || '').trim().toLowerCase();
  if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) || email !== confirmEmail || email.length > 254 || !(await checkCredentials(current, password)))
    return Response.redirect(new URL('/admin?notice=email-error', origin), 303);
  await db()`UPDATE petition_settings SET manager_email = ${email}, updated_at = now() WHERE id = 1`;
  return new Response(null, { status: 303, headers: {
    Location: new URL('/admin/sign-in', origin).toString(),
    'Set-Cookie': `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    'Cache-Control': 'no-store',
  } });
}
