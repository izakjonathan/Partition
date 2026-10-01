import { checkCredentials, cookieName, requestOrigin, session } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  if (typeof email !== 'string' || typeof password !== 'string' || !checkCredentials(email, password)) {
    return Response.redirect(new URL('/admin/sign-in?error=1', origin), 303);
  }
  const data = session();
  if (!data) return new Response('Login unavailable', { status: 503 });
  return new Response(null, { status: 303, headers: {
    Location: new URL('/admin', origin).toString(),
    'Set-Cookie': `${cookieName}=${data.value}; Path=/; Max-Age=${data.maxAge}; HttpOnly; Secure; SameSite=Strict`,
    'Cache-Control': 'no-store',
  } });
}
