# Petition on one Vercel project

The shareable public page is `/` and the manager login is `/admin/sign-in` on the **same** Vercel deployment. The protected manager dashboard is `/admin`; the CSV export is `/admin/api/export`. This collects expressions of support after an email confirmation. It is not an official Danish borgerforslag or a verified voter signature.

## Deploy

1. Replace the repository's application files with the contents of this ZIP at the **root** of `Partition`; copying files over the old tree alone leaves obsolete routes. Remove any earlier `admin-portal/`, `proxy.ts`, `lib/admin.ts`, `app/api/admin/`, and `app/admin/sign-in/[[...sign-in]]/` from the commit if present. This version has one app. The existing Vercel project `partition` builds it. Framework Preset: Next.js; Root Directory: repository root; Output Directory: unset. Do not commit credentials or `.env.local`.
2. In the **existing public** Vercel project's Production environment, set `ADMIN_PASSWORD` to a unique random password of at least 32 characters and `ADMIN_SESSION_SECRET` to a different random secret of at least 32 characters. The secrets previously set on `partition-private-admin` are in a different project and will not be available here. You can reuse that admin password, but set both secrets on `partition` itself. Redeploy after adding them. The login email is `izakhyllested@icloud.com`.
3. Check `/admin` redirects to `/admin/sign-in` when signed out, and `/admin/api/export` returns HTTP 401. Sign in and confirm the response list and CSV work. The public project already has a connected Neon database; verify its `DATABASE_URL` is still present. Do not enable project-wide Vercel Authentication on the public project, since that would block respondents.
4. Configure the remaining values in `.env.example`. Replace the placeholder petition statement with the exact final text and increment `PETITION_REVISION` if it changes. Set the controller's legal name, address and privacy email, a justified `RETENTION_DATE`, and a random 32+ byte `CRON_SECRET`. Keep `COLLECT_DOB=false` unless exact birth dates are necessary and documented.
5. Supply a working public email sender for confirmations (`RESEND_API_KEY` and verified `VERIFICATION_FROM_EMAIL`). Resend generally requires a domain you control for public mail. If you have no domain, adapt `app/actions.ts` to an email provider that supports a verified individual sender before opening the form.
6. Test public registration, confirmation, manager list and export, then remove test data. Confirm the daily cleanup job runs. Share `/` only after the legal notice, statement and mail delivery are ready.

The form stays closed until all required settings are present. Unconfirmed responses expire after 24 hours. The daily cleanup deletes them and confirmed responses past `RETENTION_DATE`. Review Neon backup retention separately. Manager sessions use a secure, HTTP-only cookie and expire after eight hours. The admin password is deliberately high entropy because this simple login has no shared rate limiter or password recovery. Rotate either secret to invalidate sessions.

## Privacy review

Petition support may reveal political opinion or other special-category information. Obtain a tailored GDPR assessment before collecting support. The privacy page is a template, not a guarantee of compliance. Review the legal bases, controller details, retention, provider agreements, subprocessors and transfers. Do not collect CPR numbers. Email confirmation verifies inbox control, not legal identity.

## Local development

Use Node.js 22, run `npm ci`, copy `.env.example` to `.env.local`, then `npm run dev`. Run `npm run build` before committing.
