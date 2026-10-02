import 'server-only';
import nodemailer from 'nodemailer';

export function mailReady() {
  return Boolean(process.env.ICLOUD_APP_PASSWORD && process.env.ICLOUD_APP_PASSWORD.trim().length >= 12);
}

export async function sendConfirmation(to: string, subject: string, text: string) {
  if (!mailReady()) throw new Error('iCloud Mail is not configured');
  const transport = nodemailer.createTransport({
    host: 'smtp.mail.me.com', port: 587, secure: false, requireTLS: true,
    auth: { user: 'izakhyllested@icloud.com', pass: process.env.ICLOUD_APP_PASSWORD! },
    connectionTimeout: 10000, greetingTimeout: 10000, socketTimeout: 15000,
  });
  try {
    await transport.sendMail({ from: 'Blågårds Apotek <izakhyllested@icloud.com>', to, subject, text });
  } finally { transport.close(); }
}
