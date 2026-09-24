import { config } from '@/lib/config';
import { InterestForm } from './interest-form';

export const dynamic = 'force-dynamic';

export default function Home() {
  const c = config();
  return <main className="narrow"><span className="eyebrow">PETITION</span><h1>{c.title || 'Petition coming soon'}</h1>
    <section className="card"><h2>What you are supporting</h2><div className="statement">{c.statement || 'The full petition statement will appear here before signing opens.'}</div><p className="hint">Statement version: {c.revision || 'pending'}</p></section>
    <section className="card second"><h2>Add your support</h2>
      <p>Confirm your email to be counted. Email confirmation does not verify your legal identity.</p>
      {c.ready ? <InterestForm dob={c.dob} dobPurpose={c.dobPurpose} /> : <p className="notice">Registration is not open yet.</p>}
    </section><footer><a href="/privacy">Privacy information</a></footer>
  </main>;
}
