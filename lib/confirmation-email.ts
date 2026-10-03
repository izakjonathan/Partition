import 'server-only';

export function mailReady() {
  return Boolean(process.env.AGENTMAIL_API_KEY?.trim() && process.env.AGENTMAIL_INBOX_ID?.trim());
}

function escapeHtml(value: string) {
  return value.replace(/[&<>"']/g, character => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[character]!);
}

export async function sendConfirmation(email: string, confirmUrl: string, participantName: string, subject: string, body: string) {
  const key = process.env.AGENTMAIL_API_KEY?.trim();
  const inbox = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (!key || !inbox) throw new Error('Confirmation email is not configured');
  if (!subject || !body.includes('{{confirmation_link}}')) throw new Error('Confirmation email text is missing');
  const renderedSubject = subject.replaceAll('{{participant_name}}', participantName);
  const text = body.replaceAll('{{participant_name}}', participantName).replaceAll('{{confirmation_link}}', confirmUrl);
  const html = body.split(/(\{\{confirmation_link\}\}|\{\{participant_name\}\})/g).map(part => {
    if (part === '{{confirmation_link}}') return `<a href="${escapeHtml(confirmUrl)}">${escapeHtml(confirmUrl)}</a>`;
    if (part === '{{participant_name}}') return escapeHtml(participantName);
    return escapeHtml(part).replace(/\r?\n/g, '<br>');
  }).join('');

  const response = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: renderedSubject,
      text,
      html: `<div>${html}</div>`,
    }),
    cache: 'no-store',
    signal: AbortSignal.timeout(12000),
  });
  if (!response.ok) throw new Error(`Confirmation email failed (${response.status})`);
  const sent = await response.json() as { message_id?: string };
  if (!sent.message_id) throw new Error('Confirmation provider did not return a message ID');
  return sent.message_id;
}

export async function deleteConfirmationMessage(messageId: string) {
  const key = process.env.AGENTMAIL_API_KEY?.trim();
  const inbox = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (!key || !inbox) throw new Error('Confirmation email is not configured');
  const response = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/${encodeURIComponent(messageId)}`, {
    method: 'DELETE', headers: { Authorization: `Bearer ${key}` }, cache: 'no-store', signal: AbortSignal.timeout(12000),
  });
  if (!response.ok && response.status !== 404) throw new Error(`Confirmation message deletion failed (${response.status})`);
}
