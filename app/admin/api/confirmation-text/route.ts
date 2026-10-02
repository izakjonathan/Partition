import { authorized, requestOrigin } from '@/lib/auth';
import { db } from '@/lib/db';
import { petitionSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';

export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin) return new Response('Forbidden', { status: 403 });
  if (!(await authorized())) return new Response('Unauthorized', { status: 401 });
  const data = await request.formData();
  const subject = String(data.get('subject') || '').trim();
  const body = String(data.get('body') || '').trim();
  const valid = subject.length >= 5 && subject.length <= 160 && !/[\r\n\x00-\x1f]/.test(subject)
    && body.length >= 30 && body.length <= 5000 && body.includes('{{confirmation_link}}') && !/[\x00-\x08\x0b\x0c\x0e-\x1f]/.test(body);
  if (!valid) return Response.redirect(new URL('/admin/settings?notice=confirmation-error', origin), 303);
  await petitionSettings();
  await db()`UPDATE petition_settings SET confirmation_subject=${subject}, confirmation_body=${body}, updated_at=now() WHERE id=1`;
  return Response.redirect(new URL('/admin/settings?notice=confirmation-saved', origin), 303);
}
