'use client';

import { useActionState } from 'react';
import { registerInterest, type FormState } from './actions';
import { bluesEmailConsent } from '@/lib/consent';

const initial: FormState = { status: 'idle', message: '' };

export function InterestForm({ dob, dobPurpose }: { dob: boolean; dobPurpose: string }) {
  const [state, action, pending] = useActionState(registerInterest, initial);
  if (state.status === 'success') return <div className="notice" role="status">{state.message}</div>;
  return <form action={action} className="form">
    <label>Fulde navn <input name="name" autoComplete="name" maxLength={120} required /></label>
    <label>E-mail <input name="email" type="email" autoComplete="email" maxLength={254} required /></label>
    <label>Postnummer <input name="postcode" inputMode="numeric" autoComplete="postal-code" pattern="[0-9]{4}" maxLength={4} required /></label>
    <label>Alder (valgfrit) <input name="ageYears" type="text" inputMode="numeric" autoComplete="off" pattern="[0-9]{1,3}" maxLength={3} placeholder="35" /></label>
    {dob && <label>Fødselsdato <span className="hint">{dobPurpose}</span><input name="dob" type="date" max={new Date().toISOString().slice(0, 10)} required /></label>}
    <div className="trap" aria-hidden="true"><label>Website <input name="website" tabIndex={-1} autoComplete="off" /></label></div>
    <label className="check"><input type="checkbox" name="support" value="yes" required /> <span>Jeg støtter forslaget, som det står ovenfor.</span></label>
    <label className="check"><input type="checkbox" name="updates" value="yes" /> <span>{bluesEmailConsent}</span></label>
    <label className="check"><input type="checkbox" name="acknowledgement" value="yes" required /> <span>Jeg accepterer, at arrangøren bruger mine oplysninger til at registrere og bekræfte min støtte. Jeg har læst <a href="/privacy" target="_blank" rel="noopener noreferrer">privatlivsinformationen</a>.</span></label>
    {state.status === 'error' && <p className="error" role="alert">{state.message}</p>}
    <button disabled={pending}>{pending ? 'Sender…' : 'Send bekræftelsesmail'}</button>
  </form>;
}
