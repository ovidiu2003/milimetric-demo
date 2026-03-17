import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';

interface OfferPayload {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  configType: string;
  pdfBase64: string;
  pdfFilename: string;
}

interface SmtpConfig {
  host: string;
  port: number;
  secure: boolean;
  user?: string;
  pass?: string;
  from: string;
}

function getSmtpConfig(): SmtpConfig {
  const required = ['SMTP_HOST'] as const;
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    throw new Error(
      `Configurare SMTP incompleta. Lipsesc: ${missing.join(', ')}. ` +
      'Adauga variabilele in fisierul .env.local si reporneste serverul.'
    );
  }

  const host = process.env.SMTP_HOST as string;
  const user = process.env.SMTP_USER;
  const pass = process.env.SMTP_PASS;
  const port = Number(process.env.SMTP_PORT || '587');
  const secure = process.env.SMTP_SECURE === 'true';
  const from = process.env.SMTP_FROM || user || 'oferta@localhost';

  return { host, port, secure, user, pass, from };
}

export async function POST(req: Request) {
  try {
    const smtp = getSmtpConfig();
    const payload = (await req.json()) as OfferPayload;

    if (!payload.firstName || !payload.lastName || !payload.phone || !payload.email || !payload.pdfBase64 || !payload.pdfFilename) {
      return NextResponse.json({ error: 'Date incomplete.' }, { status: 400 });
    }

    const transporter = nodemailer.createTransport({
      host: smtp.host,
      port: smtp.port,
      secure: smtp.secure,
      auth: smtp.user && smtp.pass
        ? {
            user: smtp.user,
            pass: smtp.pass,
          }
        : undefined,
    });

    const from = smtp.from;
    const targetEmail = 'comenzi@milimetric.ro';
    const fullName = `${payload.firstName} ${payload.lastName}`;

    await transporter.sendMail({
      from,
      to: targetEmail,
      replyTo: payload.email,
      subject: `Cerere oferta configurator - ${fullName}`,
      text:
        `Cerere noua de oferta\n\n` +
        `Nume: ${fullName}\n` +
        `Telefon: ${payload.phone}\n` +
        `Email: ${payload.email}\n` +
        `Tip configurare: ${payload.configType}\n\n` +
        `Configuratia este atasata in PDF.`,
      attachments: [
        {
          filename: payload.pdfFilename,
          content: payload.pdfBase64,
          encoding: 'base64',
          contentType: 'application/pdf',
          contentDisposition: 'attachment',
        },
      ],
    });

    return NextResponse.json({ ok: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Eroare la trimiterea email-ului.';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
