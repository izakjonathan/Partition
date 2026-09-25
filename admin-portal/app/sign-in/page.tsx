import { redirect } from 'next/navigation';
import { authorized, configured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await authorized()) redirect('/');
  const error = (await searchParams).error;
  return <main className="sign-in"><span className="eyebrow">PRIVATE ADMIN</span><h1>Sign in</h1><p>Petition responses are restricted to the administrator.</p>
    {!configured() ? <p>Admin login has not been configured in Vercel yet.</p> : <form method="post" action="/api/login"><label htmlFor="email">Email</label><input id="email" name="email" type="email" autoComplete="username" required />
      <label htmlFor="password">Password</label><input id="password" name="password" type="password" autoComplete="current-password" required />
      {error && <p role="alert">The email or password was incorrect.</p>}<button className="button" type="submit">Sign in</button></form>}
  </main>;
}
