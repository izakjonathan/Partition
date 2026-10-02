import { mailReady } from './mail';
import { petitionSettings } from './settings';

export const privacyVersion = '2026-10-02';

export async function config() {
  const settings = await petitionSettings();
  const title = settings?.title || '';
  const statement = settings?.statement || '';
  const revision = settings?.revision ? String(settings.revision) : '';
  const controller = 'Blågårds Apotek';
  const address = 'Blågårds Plads 2, 2200 København N';
  const email = process.env.PRIVACY_EMAIL?.trim() || settings?.manager_email || 'izakhyllested@icloud.com';
  const retention = 'six months after submission';
  const dob = process.env.COLLECT_DOB === 'true';
  const dobPurpose = process.env.DOB_PURPOSE?.trim() || '';
  const site = process.env.SITE_URL?.trim() || '';
  let siteValid = false;
  try { siteValid = new URL(site).protocol === 'https:' || new URL(site).hostname === 'localhost'; } catch {}
  const ready = Boolean(title && statement.length >= 30 && revision && controller && address && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && process.env.DATABASE_URL && siteValid && mailReady() && process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32 && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 32 && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 && (!dob || dobPurpose));
  return { title, statement, revision, controller, address, email, retention, dob, dobPurpose, site, ready };
}
