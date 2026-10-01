import { cookieName, requestOrigin } from '@/lib/auth';

export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin) return new Response('Forbidden', { status: 403 });
  return new Response(null, { status: 303, headers: {
    Location: new URL('/admin/sign-in', origin).toString(),
    'Set-Cookie': `${cookieName}=; Path=/; Max-Age=0; HttpOnly; Secure; SameSite=Strict`,
    'Cache-Control': 'no-store',
  } });
}
