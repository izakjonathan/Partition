# Blågårds Apotek blues petition

One Next.js app on the existing Vercel `partition` project. The public page is `/`, and the private manager dashboard is `/admin`. It records email-confirmed expressions of support, not identity-verified signatures or an official borgerforslag.

## Update the GitHub repository

Extract this ZIP and commit its contents at the repository root, with `package.json` at the root. Replace the previous app files, including removal of the old `admin-portal` folder and Clerk routes. The project uses the existing Neon `DATABASE_URL`; the new `petition_settings`, age range, and email opt-in columns are created on its first database request. The Danish wording is a **draft** in `/admin/settings`, not public until you publish it. Replace `YYYYY` with the correct band name before the Publish button accepts the statement. Each publication increases the version, and response records preserve the exact version they confirmed.

The manager email starts at `izakhyllested@icloud.com`. Settings can change it after confirming the current password. The change signs out current sessions; sign in with the new email and the same `ADMIN_PASSWORD`. An email typo could lock you out, so enter the address twice and check it carefully. This is an application login, not a change to the Vercel account.

The Baros-inspired manager has a dashboard with confirmed totals, postcode-to-city breakdown and age ranges. `/admin/responses` has a filter on every column and one active A–Z/Z–A sort at a time. The copy action takes **all currently confirmed, active blues-email opt-ins**, regardless of table filters; the export also supplies unsubscribe links. Settings contains the statement editor, login email and UI Studio. UI Studio colors are stored in Neon and applied to the public site and manager.

## Required setup before collecting responses

The organiser is shown as Blågårds Apotek. The privacy contact defaults to the manager email, initially `izakhyllested@icloud.com`. Records, including optional blues-email consent, expire six months after submission. The form asks for an optional age range; no birth dates are collected by default.

In the existing Vercel `partition` project's **Production** environment, keep `DATABASE_URL`, `ADMIN_PASSWORD`, and `ADMIN_SESSION_SECRET`. Set `SITE_URL=https://partition-mu.vercel.app` (if this remains the production address), a random 32+ character `CRON_SECRET`, and `ICLOUD_APP_PASSWORD` from the Apple Account that owns `izakhyllested@icloud.com`. Generate the latter at account.apple.com → Sign-In and Security → App-Specific Passwords. It is not your normal Apple password. Store it only in Vercel, never in GitHub or chat. Redeploy after changing environment variables.

Confirmation emails use iCloud SMTP on port 587. The integration must be tested after deployment with a real sign-up; a passing build cannot prove delivery. The petition stays closed if the mail credential is missing. Keep `COLLECT_DOB=false` unless a specific purpose warrants collecting full birth dates.

The form has a separate, unticked choice for email updates about blues events at Blågårds Apotek. That choice is recorded only once the respondent confirms the email. The response list has a copy button and a separate CSV of currently active opt-ins, including the exact consent wording, time, and a personal unsubscribe link. Unsubscribing does not remove their petition support. The CSV is for import into a suitable mailing platform; **do not use iCloud SMTP for bulk event announcements**. Name the platform in the privacy notice before importing the list, include each person's unsubscribe link in every update, and refresh the export before each campaign.

After committing and configuring Vercel, redeploy. Replace `YYYYY`, publish the statement from `/admin`, inspect `/` and `/privacy`, and test sign-up, confirmation, opt-in export, unsubscribe, manager list and CSV. Remove test records according to your retention process.

## Privacy and maintenance

The app shows a privacy notice, but its controller details, retention period, and provider arrangements must reflect the real campaign. A responder can contact the address shown on `/privacy` about their data. The daily cleanup route deletes expired unconfirmed entries and entries older than the configured date. Confirm Vercel Cron is active for this project and review Neon backup retention. The privacy notice is a template for review, not a legal certification. If the campaign would reveal sensitive political or other special-category views, get specific advice before collecting responses.

Build locally with Node 22: `npm ci && npm run build`.
