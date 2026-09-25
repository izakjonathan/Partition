import { cookieName } from '@/lib/auth';

export async function POST(request: Request) {
  const origin = request.headers.get('origin');
  if (!origin || origin !== new URL(request.url).origin) return new Response('Forbidden', { status: 403 });
  const response = Response.redirect(new URL('/sign-in', request.url), 303);
  response.headers.append('Set-Cookie', `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`);
  response.headers.set('Cache-Control', 'no-store');
  return response;
}
