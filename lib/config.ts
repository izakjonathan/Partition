export const privacyVersion = '2026-09-24';

export function config() {
  const title = process.env.PETITION_TITLE?.trim() || '';
  const statement = process.env.PETITION_STATEMENT?.trim() || '';
  const revision = process.env.PETITION_REVISION?.trim() || '';
  const controller = process.env.CONTROLLER_NAME?.trim() || '';
  const address = process.env.CONTROLLER_ADDRESS?.trim() || '';
  const email = process.env.PRIVACY_EMAIL?.trim() || '';
  const retention = process.env.RETENTION_DATE?.trim() || '';
  const dob = process.env.COLLECT_DOB === 'true';
  const dobPurpose = process.env.DOB_PURPOSE?.trim() || '';
  const date = /^\d{4}-\d{2}-\d{2}$/.test(retention) ? new Date(`${retention}T23:59:59Z`) : new Date(NaN);
  const site = process.env.SITE_URL?.trim() || '';
  let siteValid = false;
  try { siteValid = new URL(site).protocol === 'https:' || new URL(site).hostname === 'localhost'; } catch {}
  const ready = Boolean(title && statement.length >= 30 && revision && controller && address && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && !isNaN(date.getTime()) && date.getTime() > Date.now() && process.env.DATABASE_URL && siteValid && process.env.RESEND_API_KEY && process.env.VERIFICATION_FROM_EMAIL && process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32 && process.env.ADMIN_CLERK_USER_ID && process.env.CLERK_SECRET_KEY && process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY && (!dob || dobPurpose));
  return { title, statement, revision, controller, address, email, retention, dob, dobPurpose, site, ready };
}
