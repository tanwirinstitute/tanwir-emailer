import { google } from 'googleapis';


export type ContentBlock =
  | { type: 'heading'; text: string }
  | { type: 'paragraph'; text: string }
  | { type: 'highlight'; label: string; value: string }
  | { type: 'code'; label: string; code: string; hint: string }
  | { type: 'steps'; title: string; items: string[] };

export interface EmailPayload {
  to: { email: string; name: string };
  subject: string;
  blocks: ContentBlock[];
}

function renderBlock(block: ContentBlock): string {
  switch (block.type) {
    case 'heading':
      return `<h2 style="color:#2c3e50;text-align:center;">${block.text}</h2>`;
    case 'paragraph':
      return `<p>${block.text}</p>`;
    case 'highlight':
      return `
        <div style="background:#f8f9fa;padding:15px;border-radius:5px;margin:20px 0;">
          <p style="font-size:18px;text-align:center;margin:0;">
            ${block.label}: <strong style="color:#28a745;">${block.value}</strong>
          </p>
        </div>`;
    case 'code':
      return `
        <div style="background:#e9f7fe;padding:20px;border-radius:5px;margin:25px 0;text-align:center;border:1px dashed #0078d4;">
          <p style="margin:0;font-size:16px;">${block.label}:</p>
          <h3 style="margin:10px 0;font-size:24px;letter-spacing:2px;color:#0078d4;font-weight:bold;">${block.code}</h3>
          <p style="margin:0;font-size:14px;">${block.hint}</p>
        </div>`;
    case 'steps':
      return `
        <h3>${block.title}</h3>
        <ol style="margin-left:20px;line-height:1.5;">
          ${block.items.map((item) => `<li>${item}</li>`).join('')}
        </ol>`;
  }
}

function buildHtml(blocks: ContentBlock[]): string {
  return `
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;border:1px solid #ddd;border-radius:5px;">
      <div style="text-align:center;margin-bottom:20px;">
        <img src="${process.env.LOGO_URL ?? ''}" alt="Tanwir Institute Logo" style="max-width:300px;height:auto;">
      </div>
      ${blocks.map(renderBlock).join('\n')}
      <hr style="border:none;border-top:1px solid #ddd;margin:20px 0;">
      <p style="font-size:12px;color:#6c757d;text-align:center;">
        This is an automated email. Please direct any questions to programs@tanwirinstitute.org.
      </p>
    </div>`;
}

function buildRawMessage(payload: EmailPayload, html: string): string {
  const from = `"${process.env.SENDER_NAME}" <${process.env.SENDER_EMAIL}>`;
  const to = `${payload.to.name} <${payload.to.email}>`;

  return [
    `From: ${from}`,
    `To: ${to}`,
    `Subject: ${payload.subject}`,
    'MIME-Version: 1.0',
    'Content-Type: text/html; charset=utf-8',
    '',
    html,
  ].join('\r\n');
}

export async function sendEmail(payload: EmailPayload): Promise<void> {
  const auth = new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
  );
  auth.setCredentials({ refresh_token: process.env.GMAIL_REFRESH_TOKEN });

  const gmail = google.gmail({ version: 'v1', auth });
  const raw = Buffer.from(buildRawMessage(payload, buildHtml(payload.blocks))).toString('base64url');

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: { raw },
  });
}
