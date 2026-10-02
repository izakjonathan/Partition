import 'server-only';
import { createHmac } from 'node:crypto';

type FirebaseResponse = { idToken?: string; users?: { email?: string; emailVerified?: boolean }[]; email?: string; error?: { message?: string } };

export function mailReady() {
  return Boolean(process.env.FIREBASE_API_KEY?.trim() && process.env.ADMIN_SESSION_SECRET?.trim());
}

function passwordFor(id: string) {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) throw new Error('Session secret is missing');
  return createHmac('sha256', secret).update(`petition-firebase:${id}`).digest('base64url');
}

async function firebase(endpoint: string, payload: Record<string, unknown>): Promise<FirebaseResponse> {
  const key = process.env.FIREBASE_API_KEY;
  if (!key) throw new Error('Firebase is not configured');
  const response = await fetch(`https://identitytoolkit.googleapis.com/v1/accounts:${endpoint}?key=${encodeURIComponent(key)}`, {
    method: 'POST', headers: { 'Content-Type': 'application/json', 'X-Firebase-Locale': 'da' },
    body: JSON.stringify(payload), cache: 'no-store', signal: AbortSignal.timeout(12000),
  });
  const result = await response.json() as FirebaseResponse;
  if (!response.ok) throw new Error(`Firebase ${endpoint}: ${result.error?.message || response.status}`);
  return result;
}

export async function sendConfirmation(id: string, email: string, continueUrl: string) {
  const signedUp = await firebase('signUp', { email, password: passwordFor(id), returnSecureToken: true });
  if (!signedUp.idToken) throw new Error('Firebase did not return an ID token');
  try {
    await firebase('sendOobCode', { requestType: 'VERIFY_EMAIL', idToken: signedUp.idToken, continueUrl });
  } catch (error) {
    try { await firebase('delete', { idToken: signedUp.idToken }); } catch {}
    throw error;
  }
}

async function signIn(id: string, email: string) {
  const result = await firebase('signInWithPassword', { email, password: passwordFor(id), returnSecureToken: true });
  if (!result.idToken || result.email?.toLowerCase() !== email.toLowerCase()) throw new Error('Firebase identity mismatch');
  return result.idToken;
}

export async function verifiedEmail(id: string, email: string) {
  const idToken = await signIn(id, email);
  const account = await firebase('lookup', { idToken });
  return account.users?.[0]?.email?.toLowerCase() === email.toLowerCase() && account.users[0].emailVerified === true;
}

export async function deleteVerificationAccount(id: string, email: string) {
  let idToken: string;
  try { idToken = await signIn(id, email); }
  catch (error) {
    if (error instanceof Error && /EMAIL_NOT_FOUND|USER_NOT_FOUND/.test(error.message)) return;
    throw error;
  }
  await firebase('delete', { idToken });
}
