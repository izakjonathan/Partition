import { redirect } from 'next/navigation';

export const dynamic = 'force-dynamic';

export default function Admin() {
  const destination = process.env.ADMIN_URL?.trim();
  let target: string | undefined;
  if (destination) {
    try {
      const url = new URL(destination);
      if (url.protocol === 'https:') target = url.origin;
    } catch {}
  }
  if (target) redirect(target);
  return <main className="narrow"><h1>Private admin</h1><p>The private admin deployment is not connected yet.</p><a href="/">Back to petition</a></main>;
}
