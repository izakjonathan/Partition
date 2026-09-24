import { config, privacyVersion } from '@/lib/config';

export const dynamic = 'force-dynamic';

export default function Privacy() {
  const c = config();
  return <main className="narrow prose"><a href="/">← Event page</a><h1>Privacy information</h1>
    <p>Version {privacyVersion}</p>
    <h2>Who is responsible?</h2><p>{c.controller || 'The organiser'}{c.address ? `, ${c.address}` : ''} is the data controller. Contact: {c.email ? <a href={`mailto:${c.email}`}>{c.email}</a> : 'Contact details pending'}.</p>
    <h2>Why we collect information</h2><p>We record support for the petition “{c.title || 'the petition'}”. We send one confirmation email to verify control of the submitted email address. We do not use this submission to subscribe you to a mailing list or publish your name. The petition statement and version you agree to are stored with your response.</p>
    <h2>Which information</h2><p>We collect your name, email address, Danish postcode, submission and confirmation dates, the exact petition statement you supported and the version of this notice shown when you submitted. The postcode helps us understand the geographical distribution of support. {c.dob ? `We also collect your date of birth for this purpose: ${c.dobPurpose}.` : 'We do not collect your date of birth.'}</p>
    <h2>Legal basis and your choice</h2><p>Our legal basis is your consent (GDPR Article 6(1)(a)). Supporting the petition is voluntary. You can withdraw your consent at any time by emailing the address above. Withdrawal does not affect processing that took place before withdrawal. If the petition reveals special-category information, this notice and legal basis must be reviewed before opening the form.</p>
    <h2>Storage and access</h2><p>Responses are stored in a Neon PostgreSQL database, served through Vercel, and accessible only to the authorised organiser in the private administration area. Clerk provides organiser authentication. Resend delivers confirmation emails. These providers may use subprocessors and international transfers as described in their agreements. We do not sell your information.</p>
    <h2>How long we keep it</h2><p>Unconfirmed submissions expire after 24 hours. Confirmed submissions are deleted no later than {c.retention || 'the retention date announced before signing opens'}. We may delete them sooner when they are no longer needed. Database backups may take additional time to expire under the provider’s backup policy.</p>
    <h2>Your rights</h2><p>You can request access, correction, deletion, or portability of your information and withdraw consent by contacting the organiser above. You may complain to <a href="https://www.datatilsynet.dk/">Datatilsynet</a>. We may need to verify your identity before acting on a request.</p>
    <h2>Cookies</h2><p>The public petition form does not install analytics or advertising cookies. The private administration area uses essential authentication cookies for the organiser.</p>
  </main>;
}
