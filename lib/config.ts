import { mailReady } from './firebase-verification';
import { petitionSettings } from './settings';

export const privacyVersion = '2026-10-02-firebase';

export async function config() {
  const settings = await petitionSettings();
  const title = settings?.title || '';
  const statement = settings?.statement || '';
  const revision = settings?.revision ? String(settings.revision) : '';
  const controller = 'Blågårds Apotek';
  const email = process.env.PRIVACY_EMAIL?.trim() || settings?.manager_email || 'izakhyllested@icloud.com';
  const retention = 'six months after submission';
  const dob = process.env.COLLECT_DOB === 'true';
  const dobPurpose = process.env.DOB_PURPOSE?.trim() || '';
  const site = process.env.SITE_URL?.trim() || '';
  let siteValid = false;
  try { siteValid = new URL(site).protocol === 'https:' || new URL(site).hostname === 'localhost'; } catch {}
  const ready = Boolean(title && statement.length >= 30 && revision && controller && /^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email) && process.env.DATABASE_URL && siteValid && mailReady() && process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32 && process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 32 && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32 && (!dob || dobPurpose));
  const checks = {
    statement: Boolean(statement.length >= 30 && revision && !/\bYYYYY\b/.test(statement)),
    database: Boolean(process.env.DATABASE_URL),
    siteUrl: siteValid,
    emailDelivery: mailReady(),
    cleanup: Boolean(process.env.CRON_SECRET && process.env.CRON_SECRET.length >= 32),
    managerLogin: Boolean(process.env.ADMIN_PASSWORD && process.env.ADMIN_PASSWORD.length >= 32 && process.env.ADMIN_SESSION_SECRET && process.env.ADMIN_SESSION_SECRET.length >= 32),
  };
  return { title, statement, revision, controller, email, retention, dob, dobPurpose, site, ready: ready && checks.statement, checks };
}
