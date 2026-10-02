import 'server-only';

export function mailReady() {
  return Boolean(process.env.AGENTMAIL_API_KEY?.trim() && process.env.AGENTMAIL_INBOX_ID?.trim());
}

export async function sendConfirmation(email: string, confirmUrl: string) {
  const key = process.env.AGENTMAIL_API_KEY?.trim();
  const inbox = process.env.AGENTMAIL_INBOX_ID?.trim();
  if (!key || !inbox) throw new Error('Confirmation email is not configured');

  const response = await fetch(`https://api.agentmail.to/v0/inboxes/${encodeURIComponent(inbox)}/messages/send`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      to: email,
      subject: 'Bekræft din støtte til flere blueskoncerter',
      text: `Du har bedt om at støtte forslaget om flere blueskoncerter på Blågårds Apotek.\n\nBekræft din e-mail og læs forslaget igen her:\n${confirmUrl}\n\nLinket udløber om 24 timer. Hvis du ikke har udfyldt formularen, kan du ignorere denne e-mail.`,
      html: `<p>Du har bedt om at støtte forslaget om flere blueskoncerter på Blågårds Apotek.</p><p><a href="${confirmUrl}">Bekræft din e-mail og læs forslaget igen</a></p><p>Linket udløber om 24 timer. Hvis du ikke har udfyldt formularen, kan du ignorere denne e-mail.</p>`,
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
