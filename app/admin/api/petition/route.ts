import { authorized, requestOrigin } from '@/lib/auth';
import { db } from '@/lib/db';
import { petitionSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin) return new Response('Forbidden', { status: 403 });
  if (!(await authorized())) return new Response('Unauthorized', { status: 401 });
  const data = await request.formData();
  const draft = String(data.get('statement') || '').trim();
  const publish = data.get('intent') === 'publish';
  if (draft.length < 30 || draft.length > 10000)
    return Response.redirect(new URL('/admin?notice=invalid', origin), 303);
  if (publish && /\bYYYYY\b/.test(draft))
    return Response.redirect(new URL('/admin?notice=placeholder', origin), 303);
  await petitionSettings();
  const sql = db();
  if (publish) {
    await sql`UPDATE petition_settings SET draft = ${draft}, statement = ${draft},
      revision = revision + 1, updated_at = now() WHERE id = 1`;
  } else {
    await sql`UPDATE petition_settings SET draft = ${draft}, updated_at = now() WHERE id = 1`;
  }
  return Response.redirect(new URL(`/admin?notice=${publish ? 'published' : 'saved'}`, origin), 303);
}
