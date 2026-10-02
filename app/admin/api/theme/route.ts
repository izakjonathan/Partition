import { authorized, requestOrigin } from '@/lib/auth';
import { db } from '@/lib/db';
import { petitionSettings } from '@/lib/settings';

export const dynamic = 'force-dynamic';
function luminance(hex: string) {
  const parts = [1,3,5].map(i => parseInt(hex.slice(i,i+2),16)/255).map(x => x <= .04045 ? x / 12.92 : ((x+.055)/1.055)**2.4);
  return parts[0]*.2126 + parts[1]*.7152 + parts[2]*.0722;
}
function contrast(a: string,b: string) {
  const x = luminance(a), y = luminance(b);
  return (Math.max(x,y)+.05)/(Math.min(x,y)+.05);
}
export async function POST(request: Request) {
  const origin = requestOrigin(request);
  if (!origin) return new Response('Forbidden',{status:403});
  if (!(await authorized())) return new Response('Unauthorized',{status:401});
  const data = await request.formData();
  const canvas = String(data.get('canvas')||'').toLowerCase();
  const ink = String(data.get('ink')||'').toLowerCase();
  const accent = String(data.get('accent')||'').toLowerCase();
  const valid = [canvas,ink,accent].every(color => /^#[0-9a-f]{6}$/.test(color)) && contrast(canvas,ink) >= 4.5 && contrast(accent,ink) >= 4.5;
  if (!valid) return Response.redirect(new URL('/admin/settings?notice=theme-error',origin),303);
  await petitionSettings();
  await db()`UPDATE petition_settings SET canvas_color=${canvas}, ink_color=${ink}, accent_color=${accent}, updated_at=now() WHERE id=1`;
  return Response.redirect(new URL('/admin/settings?notice=theme-saved',origin),303);
}
