# Private petition admin portal

This is a separate Vercel project for the petition dashboard. Every data view and CSV route checks its own admin login. The allowed email is `izakhyllested@icloud.com`. The administrator password and session signing secret are stored only as Vercel environment variables. Never put this dashboard on the public petition project.

## Deployment order (important)

1. Commit this `admin-portal` folder to the same GitHub repository as the public petition.
2. Connect the existing empty Vercel project `partition-private-admin` to that repository, set Root Directory to `admin-portal`, Framework Preset Next.js and remove any Output Directory override.
3. The admin Vercel project already has `ADMIN_PASSWORD` and `ADMIN_SESSION_SECRET` set as **Production** secrets. Save the password given separately to the owner in a password manager; never commit it to GitHub. If you change either value, existing sessions are invalidated. Redeploy after changing them.
4. Visit the deployed `/sign-in` page. Verify that `/` redirects to sign-in and `/api/export` returns HTTP 401 when signed out. Sign in with the email above and the configured password. If Vercel Authentication → All Deployments becomes available, turn it on as another layer of protection; its control is currently disabled in this account even on an already deployed project.
5. Connect the existing `partition-signatures` Neon database to this project with environment variable prefix `DATABASE` (`DATABASE_URL`), Production only. Redeploy and confirm that only the signed-in administrator can see responses or export a CSV. Keep the repository public only if it contains no credentials; never commit `.env` files.

The app login protects all current data routes even if Vercel Deployment Protection cannot be enabled. Use a high-entropy password: the app does not provide account recovery or a shared rate limiter for failed attempts. The dashboard is read-only: deletion requests must be handled in the database or a later audited feature.
