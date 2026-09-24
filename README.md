# Private petition starter

A public Next.js petition page with email confirmation and a private dashboard at `/admin`. This is an independent petition, **not an official Danish borgerforslag**. Email verification shows control of an inbox, not legal identity or voting eligibility.

## GitHub → Vercel setup

1. Create a private GitHub repository and upload the **contents of this directory** to its root (`package.json` at root). Do not commit `.env.local`.
2. Import it into Vercel. Add a Neon Postgres database through the Vercel Marketplace, preferably in an EU region. Run `db/schema.sql` once in Neon's SQL editor. Use the pooled `DATABASE_URL`.
3. Create a Clerk application, add its keys to Vercel and create your own admin account. Turn off public account creation in Clerk. Set `ADMIN_CLERK_USER_ID` to your exact Clerk user ID. Other Clerk users cannot access the data.
4. Add Resend through Vercel Marketplace or create a Resend account. Verify a sending domain and configure `RESEND_API_KEY` and `VERIFICATION_FROM_EMAIL`. Use a domain you control. Configure SPF and DKIM as Resend instructs.
5. Add all variables from `.env.example` in Vercel. `PETITION_STATEMENT` is the **complete final text**, not a placeholder. Set `PETITION_REVISION` to `1`; increment it whenever you change the statement. Set `SITE_URL` to your actual production origin with `https://` and no trailing slash. Set the controller's legal name, address, privacy email, and a justified retention date. Set `CRON_SECRET` with `openssl rand -hex 32`. Do not put secrets in `NEXT_PUBLIC_` variables.
6. Deploy. Verify `/`, `/privacy`, a test submission and its confirmation email, `/confirm`, the `/admin` count, CSV export and deletion. Delete the test record. Inspect the daily `/api/cleanup` job in the Vercel dashboard. Share `/` only after these checks.

The form remains closed until the statement (at least 30 characters), revision, legal controller details, privacy contact, database, email provider and site URL are configured. A pending response expires after 24 hours. The daily Vercel cron deletes expired pending responses and all responses after `RETENTION_DATE` (UTC). Check the cron and use the admin cleanup button if it fails. Review backup retention separately.

## What is counted

Supporters see the exact statement, tick an explicit support box and a separate privacy consent box, then receive a single-use email link. They must click **Confirm support** on a page displaying the statement again. The dashboard shows confirmed entries only and stores the exact statement and revision each person confirmed, along with the notice version and times. One response per email. The admin can delete by email or row and export confirmed records as CSV (up to 10,000 rows). A deleted person can submit again.

Email verification does not prevent someone from using aliases or submitting a false name or postcode. Do not call the count verified identities. There is no MitID integration and these entries do not count as official borgerforslag supporters.

## Privacy and security review before launch

- Check that the petition text and act of supporting it do not reveal sensitive data such as political opinions, health, religion or trade-union membership. If they do, obtain a tailored GDPR assessment, including Article 9, **before** using this form. The supplied privacy notice is a starting template, not an automatic guarantee of compliance.
- Verify the actual controller, purpose, retention, legal basis, processor agreements, subprocessors and international transfers for Vercel, Neon, Clerk and Resend. Make the notice accurate for your setup.
- Date of birth is off by default. Collect an exact date only with a documented necessity and a specific `DOB_PURPOSE`; never ask for CPR numbers for this independent petition.
- Requests for access, erasure and withdrawal go to `PRIVACY_EMAIL`. Verify the requester, locate and remove their record; exported CSV copies need the same deletion controls. Keep production data out of unprotected preview deployments.
- Public forms attract spam; use Vercel Firewall/rate limiting for production. The form includes a hidden honeypot and refuses repeated submissions for the same email, but these do not prevent determined abuse.
- Confirmation links contain a short-lived secret in the URL. Avoid external trackers, link shorteners and logging URL query strings on `/confirm`.

## Local development

Node.js 20.9+, Neon, Clerk development keys and Resend test setup are needed. `npm install`, copy `.env.example` to `.env.local`, configure it, run `npm run dev`. Build with `npm run build` and check types with `npm run typecheck`.
