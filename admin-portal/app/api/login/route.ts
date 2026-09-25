import { checkCredentials, cookieName, session } from '@/lib/auth';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  const form = await request.formData();
  const email = form.get('email');
  const password = form.get('password');
  if (typeof email !== 'string' || typeof password !== 'string' || !checkCredentials(email, password)) {
    return Response.redirect(new URL('/sign-in?error=1', request.url), 303);
  }
  const data = session();
  if (!data) return new Response('Login unavailable', { status: 503 });
  const response = Response.redirect(new URL('/', request.url), 303);
  response.headers.append('Set-Cookie', `${cookieName}=${data.value}; Path=/; Max-Age=${data.maxAge}; HttpOnly; Secure; SameSite=Strict`);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
