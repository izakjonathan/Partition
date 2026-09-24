'use client';

import { useActionState } from 'react';
import { registerInterest, type FormState } from './actions';

const initial: FormState = { status: 'idle', message: '' };

export function InterestForm({ dob, dobPurpose }: { dob: boolean; dobPurpose: string }) {
  const [state, action, pending] = useActionState(registerInterest, initial);
  if (state.status === 'success') return <div className="notice" role="status">{state.message}</div>;
  return <form action={action} className="form">
    <label>Full name <input name="name" autoComplete="name" maxLength={120} required /></label>
    <label>Email address <input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
    <label>Danish postcode <input name="postcode" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{4}" maxLength={4} required /></label>
    {dob && <label>Date of birth <span className="hint">{dobPurpose}</span><input name="dob" type="date" max={new Date().toISOString().slice(0, 10)} required /></label>}
    <div className="trap" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="check"><input type="checkbox" name="support" value="yes" required /> <span>I support the petition statement shown above.</span></label>
    <label className="check"><input type="checkbox" name="acknowledgement" value="yes" required /> <span>I consent to the organiser using my details to record and verify my support for this petition. I have read the <a href="/privacy" target="_blank" rel="noopener noreferrer">privacy information</a>.</span></label>
    {state.status === 'error' && <p className="error" role="alert">{state.message}</p>}
    <button disabled={pending}>{pending ? 'Submitting…' : 'Send confirmation email'}</button>
  </form>;
}
