import { validUnsubscribe } from '@/lib/unsubscribe';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';
export default async function Unsubscribe({ searchParams }: { searchParams: Promise<{ id?: string; token?: string; done?: string }> }) {
  const { id = '', token = '', done } = await searchParams;
  if (done === '1') return <main className="narrow"><h1>Afmeldt</h1><p>Du får ikke flere e-mails om bluesarrangementer via denne liste.</p></main>;
  if (!validUnsubscribe(id, token)) return <main className="narrow"><h1>Ugyldigt link</h1><p>Kontakt arrangøren for at afmelde dig.</p></main>;
  return <main className="narrow"><h1>Afmeld e-mails</h1><p>Du kan stoppe e-mails om bluesarrangementer fra Blågårds Apotek. Din støtte til forslaget påvirkes ikke.</p>
    <form action={unsubscribe} method="post"><input type="hidden" name="id" value={id}/><input type="hidden" name="token" value={token}/><button type="submit">Afmeld e-mails</button></form></main>;
}

async function unsubscribe(form: FormData) {
  'use server';
  const { redirect } = await import('next/navigation');
  const id = String(form.get('id') || '');
  const token = String(form.get('token') || '');
  if (!validUnsubscribe(id, token)) redirect('/unsubscribe');
  await db()`UPDATE interests SET marketing_withdrawn_at = COALESCE(marketing_withdrawn_at, now()) WHERE id = ${id} AND marketing_consent_at IS NOT NULL`;
  redirect('/unsubscribe?done=1');
}
