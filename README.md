# Blågårds Apotek blues petition

One Next.js app on the existing Vercel `partition` project. The public page is `/`, and the private manager dashboard is `/admin`. It records email-confirmed expressions of support, not identity-verified signatures or an official borgerforslag.

## Update the GitHub repository

Extract this ZIP and commit its contents at the repository root, with `package.json` at the root. Replace the previous app files, including removal of the old `admin-portal` folder and Clerk routes. The project uses the existing Neon `DATABASE_URL`; the new `petition_settings`, exact-age, and email opt-in columns are created on its first database request. Earlier age-range responses remain readable. The Danish wording is a **draft** in `/admin/settings`, not public until you publish it. Replace `YYYYY` with the correct band name before the Publish button accepts the statement. Each publication increases the version, and response records preserve the exact version they confirmed.

The manager email starts at `izakhyllested@icloud.com`. Settings can change it after confirming the current password. The change signs out current sessions; sign in with the new email and the same `ADMIN_PASSWORD`. An email typo could lock you out, so enter the address twice and check it carefully. This is an application login, not a change to the Vercel account.

The Baros-inspired manager has a dashboard with confirmed totals, postcode-to-city breakdown and age ranges. `/admin/responses` has a filter on every column and one active A–Z/Z–A sort at a time. The copy action takes **all currently confirmed, active blues-email opt-ins**, regardless of table filters; the export also supplies unsubscribe links. Settings contains the statement editor, login email and UI Studio. UI Studio colors are stored in Neon and applied to the public site and manager.

## Required setup before collecting responses

The organiser is shown as Blågårds Apotek. The privacy contact defaults to the manager email, initially `izakhyllested@icloud.com`. Records, including optional blues-email consent, expire six months after submission. The form asks for an optional exact age in years (1–120) as a text input; no birth dates are collected by default. The dashboard groups exact ages into ranges; exports include both exact ages and any legacy range responses.

### Create a sender without an owned domain

1. Sign up at [AgentMail Console](https://console.agentmail.to/). The direct free plan includes one or more inboxes on AgentMail's `@agentmail.to` domain. Create an inbox there and copy its exact address as `AGENTMAIL_INBOX_ID`. Create an API key in **API Keys → Create New API Key** and copy it as `AGENTMAIL_API_KEY`. You do not need Firebase, a custom domain, or an iCloud app password. The free plan is limited to 100 messages per day and 3,000 per month; check current limits before public launch. The free inbox may add an AgentMail footer.
2. Open the existing `partition` project in [Vercel](https://vercel.com/dashboard), then **Settings → Environment Variables**. Add the exact names below, selecting **Production** for each. Save and redeploy after committing this ZIP. If you add or edit variables after a deployment, redeploy again. Do not put the key/password values in GitHub or screenshots.

| Name | Value / source |
| --- | --- |
| `AGENTMAIL_API_KEY` | The key beginning `am_` from AgentMail Console. |
| `AGENTMAIL_INBOX_ID` | The full address of the new `@agentmail.to` inbox. |
| `DATABASE_URL` | Existing Neon Postgres connection string; if Neon is connected through Vercel, check its existing variables and copy the connection URL into this exact name if needed. |
| `SITE_URL` | Public production URL, such as `https://partition-mu.vercel.app`, with `https://` and no `/confirm` suffix. |
| `CRON_SECRET` | A fresh random string of at least 32 characters. Vercel attaches it to the daily `/api/cleanup` request. |
| `ADMIN_PASSWORD` | A unique manager password of at least 32 characters; use it with the manager email at `/admin/sign-in`. |
| `ADMIN_SESSION_SECRET` | A different fresh random string of at least 32 characters; signs manager sessions and unsubscribe links. |

Use a password manager's generator for the three random strings. They must be distinct. The manager email itself is edited in `/admin/settings` after login, initially `izakhyllested@icloud.com`. Remove the obsolete `FIREBASE_API_KEY` and `ICLOUD_APP_PASSWORD` variables if they are present. Finish by replacing `YYYYY` and publishing the statement in `/admin/settings`. Check that the Settings readiness items are complete and test one registration on the production URL through the emailed link and final **Confirm support** button. A configured API key alone does not prove mail delivery.

AgentMail sends the confirmation email. The integration must be tested after deployment with a real sign-up; a passing build cannot prove delivery. The petition stays closed if either AgentMail variable is missing. The one-time link expires after 24 hours. The daily cleanup removes expired pending records and six-month-old confirmed records, and asks AgentMail to delete each associated sent confirmation message. Failed deletions are retried on the next daily run. Keep `COLLECT_DOB=false` unless a specific purpose warrants collecting full birth dates.

The form has a separate, unticked choice for email updates about blues events at Blågårds Apotek. That choice is recorded only once the respondent confirms the email. The response list has a copy button and a separate CSV of currently active opt-ins, including the exact consent wording, time, and a personal unsubscribe link. Unsubscribing does not remove their petition support. This integration sends confirmation emails only, **not event-update campaigns**. Name a mailing platform in the privacy notice before importing the list, include each person's unsubscribe link in every update, and refresh the export before each campaign.

After committing and configuring Vercel and AgentMail, redeploy. Replace `YYYYY`, publish the statement from `/admin/settings`, inspect `/` and `/privacy`, and test sign-up, the AgentMail email and return link, confirmation, opt-in export, unsubscribe, manager list and CSV. Remove test records according to your retention process. Existing unconfirmed Firebase links from the previous version should be submitted afresh after the change.

## Privacy and maintenance

The app shows a privacy notice, but its controller details, retention period, and provider arrangements must reflect the real campaign. A responder can contact the address shown on `/privacy` about their data. The daily cleanup route deletes expired unconfirmed entries and entries older than the configured date. Confirm Vercel Cron is active for this project and review Neon backup retention. The privacy notice is a template for review, not a legal certification. If the campaign would reveal sensitive political or other special-category views, get specific advice before collecting responses.

Build locally with Node 22: `npm ci && npm run build`.
