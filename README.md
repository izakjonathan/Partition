# Blågårds Apotek blues petition

One Next.js app on the existing Vercel `partition` project. The public page is `/`, and the private manager dashboard is `/admin`. It records email-confirmed expressions of support, not identity-verified signatures or an official borgerforslag.

## Update the GitHub repository

Extract this ZIP and commit its contents at the repository root, with `package.json` at the root. Replace the previous app files, including removal of the old `admin-portal` folder and Clerk routes. The project uses the existing Neon `DATABASE_URL`; the new `petition_settings`, age range, and email opt-in columns are created on its first database request. The Danish wording is a **draft** in `/admin/settings`, not public until you publish it. Replace `YYYYY` with the correct band name before the Publish button accepts the statement. Each publication increases the version, and response records preserve the exact version they confirmed.

The manager email starts at `izakhyllested@icloud.com`. Settings can change it after confirming the current password. The change signs out current sessions; sign in with the new email and the same `ADMIN_PASSWORD`. An email typo could lock you out, so enter the address twice and check it carefully. This is an application login, not a change to the Vercel account.

The Baros-inspired manager has a dashboard with confirmed totals, postcode-to-city breakdown and age ranges. `/admin/responses` has a filter on every column and one active A–Z/Z–A sort at a time. The copy action takes **all currently confirmed, active blues-email opt-ins**, regardless of table filters; the export also supplies unsubscribe links. Settings contains the statement editor, login email and UI Studio. UI Studio colors are stored in Neon and applied to the public site and manager.

## Required setup before collecting responses

The organiser is shown as Blågårds Apotek. The privacy contact defaults to the manager email, initially `izakhyllested@icloud.com`. Records, including optional blues-email consent, expire six months after submission. The form asks for an optional age range; no birth dates are collected by default.

Set up a dedicated Firebase project and add a Web app in its console. Under **Authentication → Sign-in method**, enable **Email/Password**. In Authentication settings, add `partition-mu.vercel.app` (or your actual production Vercel hostname) to **Authorized domains**. Firebase supplies the default verification sender `noreply@PROJECT_ID.firebaseapp.com`; you do not need to provide a sending mailbox, custom domain, or iCloud app password. In Authentication → Templates, edit the email-verification subject and message to explain that it confirms petition support. Copy the project's **Web API key** from Project settings. The default action handler can be used without hosting the petition on Firebase. The respondent verifies there, follows the continue link back to `/confirm`, reviews the statement, and completes support. Test that path on a phone before opening registration.

In the existing Vercel `partition` project's **Production** environment, set `DATABASE_URL`, `ADMIN_PASSWORD`, `ADMIN_SESSION_SECRET`, `SITE_URL=https://partition-mu.vercel.app` (if that is still the address), a random 32+ character `CRON_SECRET`, and `FIREBASE_API_KEY` (the Web API key). Redeploy after changing environment variables. Remove the obsolete `ICLOUD_APP_PASSWORD` variable if present. Do not rotate `ADMIN_SESSION_SECRET` while Firebase confirmations are pending because it also derives short-lived verification credentials.

Firebase sends the confirmation email using its default project address. The integration must be tested after deployment with a real sign-up; a passing build cannot prove delivery. The petition stays closed if `FIREBASE_API_KEY` is missing. The temporary Firebase account is deleted after confirmation; the daily cleanup retries failed deletions and removes expired pending accounts. Keep `COLLECT_DOB=false` unless a specific purpose warrants collecting full birth dates.

The form has a separate, unticked choice for email updates about blues events at Blågårds Apotek. That choice is recorded only once the respondent confirms the email. The response list has a copy button and a separate CSV of currently active opt-ins, including the exact consent wording, time, and a personal unsubscribe link. Unsubscribing does not remove their petition support. Firebase Authentication handles verification only, **not event-update campaigns**. Name a mailing platform in the privacy notice before importing the list, include each person's unsubscribe link in every update, and refresh the export before each campaign.

After committing and configuring Vercel and Firebase, redeploy. Replace `YYYYY`, publish the statement from `/admin/settings`, inspect `/` and `/privacy`, and test sign-up, the Firebase email and return link, confirmation, opt-in export, unsubscribe, manager list and CSV. Remove test records according to your retention process.

## Privacy and maintenance

The app shows a privacy notice, but its controller details, retention period, and provider arrangements must reflect the real campaign. A responder can contact the address shown on `/privacy` about their data. The daily cleanup route deletes expired unconfirmed entries and entries older than the configured date. Confirm Vercel Cron is active for this project and review Neon backup retention. The privacy notice is a template for review, not a legal certification. If the campaign would reveal sensitive political or other special-category views, get specific advice before collecting responses.

Build locally with Node 22: `npm ci && npm run build`.
