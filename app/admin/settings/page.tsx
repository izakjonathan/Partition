import { authorized } from '@/lib/auth';
import { config } from '@/lib/config';
import { defaultConfirmationBody, defaultConfirmationSubject, petitionSettings } from '@/lib/settings';
import { redirect } from 'next/navigation';
import { ManagerHeader } from '../manager-header';
import { UiStudio } from './ui-studio';

export const dynamic = 'force-dynamic';
const notices: Record<string,string> = {
  saved: 'Draft saved.', published: 'Statement published as a new version.',
  placeholder: 'Replace YYYYY with the correct band name before publishing.',
  invalid: 'Enter a statement between 30 and 10,000 characters.',
  'email-error': 'Check the new email address, repeat field and current password.',
  'theme-saved': 'Colors saved for the public page and manager.',
  'theme-error': 'Choose valid colors with readable contrast.',
  'confirmation-saved': 'Confirmation email text saved. New messages use this version.',
  'confirmation-error': 'Check the subject and message. Keep {{confirmation_link}} in the message.',
};
export default async function Settings({ searchParams }: { searchParams: Promise<{ notice?: string }> }) {
  if (!(await authorized())) redirect('/admin/sign-in');
  const [settings,c] = await Promise.all([petitionSettings(),config()]);
  const notice = (await searchParams).notice || '';
  return <main className="manager-shell"><ManagerHeader section="settings"/><div className="settings-overlay"><div className="settings-window">
    <div className="settings-window-head"><div><p className="eyebrow">Manager tools</p><h1>Settings<span className="title-dot">.</span></h1></div><a className="close-circle" href="/admin" aria-label="Close settings">×</a></div>
    {notices[notice] && <p className={['placeholder','invalid','email-error','theme-error','confirmation-error'].includes(notice) ? 'error-banner' : 'success-banner'} role="status">{notices[notice]}</p>}
    <section className="setting-block"><div className="setting-heading"><span>01</span><div><h2>{c.ready ? 'Registration is ready' : 'Registration is closed'}</h2></div></div>
      <div className="check-grid">{Object.entries(c.checks).map(([key,ok]) => <span className={ok ? 'check-item done' : 'check-item'} key={key}>{ok ? '✓' : '○'} {({statement:'Published statement',database:'Database',siteUrl:'Public URL',emailDelivery:'Confirmation email',cleanup:'Six-month cleanup',managerLogin:'Manager login'} as Record<string,string>)[key]}</span>)}</div>
    </section>
    <section className="setting-block"><div className="setting-heading"><span>02</span><div><h2>Petition text</h2><p>Save a private draft, then publish when it is ready. Every publication gets a new version; old responses retain the text they supported.</p></div></div>
      <form className="form" method="post" action="/admin/api/petition"><label>Statement<textarea name="statement" defaultValue={settings?.draft} rows={15} minLength={30} maxLength={10000} required /></label>
        <div className="inline"><button className="outline-button" name="intent" value="save" type="submit">Save draft</button><button name="intent" value="publish" type="submit">Publish version {Number(settings?.revision || 0)+1}</button></div></form>
      <p className="hint">Published version: {settings?.revision || 'none'}. Replace YYYYY before publishing.</p></section>
    <section className="setting-block"><div className="setting-heading"><span>03</span><div><h2>Confirmation email</h2></div></div>
      <form className="form" method="post" action="/admin/api/confirmation-text"><label>Subject<input name="subject" defaultValue={settings?.confirmation_subject || defaultConfirmationSubject} minLength={5} maxLength={160} required /></label>
        <label>Message<textarea name="body" defaultValue={settings?.confirmation_body || defaultConfirmationBody} minLength={30} maxLength={5000} rows={9} required /></label>
        <button type="submit">Save confirmation email</button></form></section>
    <section className="setting-block"><div className="setting-heading"><span>04</span><div><h2>Manager email</h2><p>Current sign-in: <strong>{settings?.manager_email}</strong>. Changing it signs out existing sessions; your password stays the same.</p></div></div>
      <form className="form" method="post" action="/admin/api/email"><label>New email<input type="email" name="email" maxLength={254} required /></label><label>Repeat new email<input type="email" name="confirmEmail" maxLength={254} required /></label><label>Current password<input type="password" name="password" autoComplete="current-password" required /></label><button type="submit">Change manager email</button></form></section>
    <section className="setting-block"><div className="setting-heading"><span>05</span><div><h2>UI Studio</h2><p>Baros colors for the public petition and manager. Preview the canvas and controls before saving.</p></div></div>
      <UiStudio canvas={settings?.canvas_color || '#fff4c4'} ink={settings?.ink_color || '#000000'} accent={settings?.accent_color || '#dfee4b'}/></section>
    <div className="setting-footer"><a href="/admin">← Back to dashboard</a><form action="/admin/api/logout" method="post"><button className="outline-button" type="submit">Sign out</button></form></div>
  </div></div></main>;
}
