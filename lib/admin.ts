import 'server-only';
import { auth } from '@clerk/nextjs/server';

export async function isAdmin() {
  const { userId } = await auth();
  return Boolean(userId && process.env.ADMIN_CLERK_USER_ID && userId === process.env.ADMIN_CLERK_USER_ID);
}
