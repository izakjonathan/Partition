import { redirect } from 'next/navigation';
import { authorized, configured } from '@/lib/auth';

export const dynamic = 'force-dynamic';

export default async function SignIn({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  if (await authorized()) redirect('/admin');
  const error = (await searchParams).error;
  return <main className="login-shell"><a className="wordmark" href="/"><span>Blågårds</span><strong>Apotek</strong><small>Manager</small></a><section className="login-card"><p className="eyebrow">MANAGER ACCESS</p><h1>Welcome back<span className="title-dot">.</span></h1><p>Sign in to view responses and manage the petition.</p>
    {!(await configured()) ? <p className="notice">Manager login has not been configured in Vercel yet.</p> : <form className="form" method="post" action="/admin/api/login"><label htmlFor="email">Email<input id="email" name="email" type="email" autoComplete="username" required /></label>
      <label htmlFor="password">Password<input id="password" name="password" type="password" autoComplete="current-password" required /></label>
      {error && <p className="error" role="alert">The email or password was incorrect.</p>}<button type="submit">Sign in</button></form>}
    <p><a href="/">← Back to public page</a></p></section>
  </main>;
}
