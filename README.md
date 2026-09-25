# Independent petition on Vercel

The public Next.js petition collects expressions of support after an email confirmation. It is **not** an official Danish borgerforslag or a verified voter signature. The private dashboard lives in a separate Vercel project at `admin-portal/` with its own email and password login. Both projects can use only `*.vercel.app` addresses.

## Deployment

1. Commit the contents of this package to the `Partition` repository root. Vercel project `partition` builds the root Next.js app. Do not commit `.env.local` or database credentials.
2. Connect the already created empty Vercel project `partition-private-admin` to this same repository, with Root Directory `admin-portal`, Framework Preset Next.js, and no Output Directory override.
3. The admin project's production `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` are already configured. Deploy and verify the sign-in page and unauthorized CSV response before connecting the Neon database `partition-signatures`, prefix `DATABASE` for `DATABASE_URL`. If Vercel Authentication → All Deployments is available later, enable it too. The Vercel settings currently say additional permissions are required to change it, including on an already deployed project.
4. Set `ADMIN_URL` on the public project to the second project's HTTPS origin. `/admin` then redirects there. The public Vercel project already has `DATABASE_URL` and `SITE_URL`; verify its environment variables after committing this update.
5. Configure the remaining settings in `.env.example`. Replace the placeholder `PETITION_STATEMENT` with the exact final text. Advance `PETITION_REVISION` whenever it changes. Supply the controller's legal name, postal address, privacy email, and a justified `RETENTION_DATE`. Keep `COLLECT_DOB=false` unless an exact birth date is necessary and the purpose documented. Set a random 32+ byte `CRON_SECRET`.
6. Configure an email provider that can send confirmation messages to the public, with `RESEND_API_KEY` and a verified `VERIFICATION_FROM_EMAIL`. Resend generally requires verifying a domain you control; the Vercel site URL alone is insufficient to send public confirmation emails. If you have no domain, select an email provider that supports a verified individual sender and adapt `app/actions.ts` before opening the form.
7. Test the public form, confirmation flow, private dashboard and CSV download, then remove test data. Review the daily `/api/cleanup` invocation. Share the public URL only after the legal notice and delivery setup are complete.

The form stays closed until every required item is configured. Pending responses expire after 24 hours. The cron deletes expired pending entries and responses after `RETENTION_DATE`. The private dashboard is read-only; handle verified access or deletion requests in Neon and remove any exported copies. Review database backup retention separately.

## Privacy review

Support for a petition can reveal political opinion or another special-category attribute. Obtain a tailored GDPR assessment before collecting such support. The privacy page is a starting template, not a guarantee of compliance. Verify the controller, purpose, legal basis, retention, provider agreements, subprocessors, international transfers and accurate wording before launch. Do not request CPR numbers. Email confirmation shows control of an inbox, not a person's legal identity.

## Local development

Node.js 22. Install packages with `npm ci`, copy `.env.example` to `.env.local`, and run `npm run dev`. Run `npm run build` before committing. The separate admin project has its own README.
