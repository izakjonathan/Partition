import { redirect } from 'next/navigation';
import { authorized, configured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await authorized()) redirect('/admin');
  const error = (await searchParams).error;
  return <main className="narrow"><span className="eyebrow">MANAGER</span><h1>Sign in</h1><p>Petition responses are restricted to the administrator.</p>
    {!configured() ? <p className="notice">Manager login has not been configured in Vercel yet.</p> : <form className="form" method="post" action="/admin/api/login"><label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="username" required /></label>
      <label htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p className="error" role="alert">The email or password was incorrect.</p>}<button type="submit">Sign in</button></form>}
    <p><a href="/">← Public page</a></p>
  </main>;
}
