import nodemailer from 'nodemailer'

interface EmailOptions {
  to: string
  subject: string
  html: string
}

// Create reusable transporter
const createTransporter = () => {
  const config = {
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  }

  return nodemailer.createTransport(config)
}

export const sendEmail = async (options: EmailOptions): Promise<void> => {
  try {
    const transporter = createTransporter()

    const mailOptions = {
      from: `"${process.env.SMTP_FROM_NAME || 'TaxFlow'}" <${process.env.SMTP_FROM_EMAIL || process.env.SMTP_USER}>`,
      to: options.to,
      subject: options.subject,
      html: options.html,
    }

    const info = await transporter.sendMail(mailOptions)
    console.log('Email sent successfully:', info.messageId)
  } catch (error) {
    console.error('Error sending email:', error)
    throw new Error('Failed to send email')
  }
}

export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
          line-height: 1.6;
          color: #1f2937 !important;
          background-color: #f3f4f6;
          margin: 0;
          padding: 20px;
        }
        .container {
          background-color: #ffffff !important;
          border-radius: 12px;
          padding: 40px;
          max-width: 600px;
          margin: 0 auto;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
        }
        .header {
          text-align: center;
          margin-bottom: 30px;
          padding-bottom: 20px;
          border-bottom: 2px solid #e5e7eb;
        }
        .logo-text {
          font-size: 36px;
          font-weight: bold;
          color: #2563eb;
          margin-bottom: 15px;
          letter-spacing: -0.5px;
        }
        .content {
          margin-bottom: 30px;
          color: #374151 !important;
        }
        .content p {
          color: #374151 !important;
          margin: 16px 0;
        }
        .content strong {
          color: #1f2937 !important;
        }
        .button {
          display: inline-block;
          background-color: #2563eb !important;
          color: #ffffff !important;
          text-decoration: none;
          padding: 14px 32px;
          border-radius: 8px;
          font-weight: 600;
          text-align: center;
          margin: 24px 0;
          font-size: 16px;
        }
        .button:hover {
          background-color: #1d4ed8 !important;
        }
        .link {
          word-break: break-all;
          color: #2563eb !important;
          font-size: 13px;
          background-color: #eff6ff;
          padding: 10px;
          border-radius: 6px;
          display: inline-block;
          margin: 10px 0;
        }
        .footer {
          text-align: center;
          margin-top: 30px;
          padding-top: 20px;
          border-top: 1px solid #e5e7eb;
          font-size: 13px;
          color: #6b7280 !important;
        }
        .footer p {
          color: #6b7280 !important;
          margin: 8px 0;
        }
        .warning {
          background-color: #fef3c7 !important;
          border-left: 4px solid #f59e0b;
          padding: 16px;
          margin: 24px 0;
          font-size: 14px;
          border-radius: 6px;
          color: #78350f !important;
        }
        .warning strong {
          color: #78350f !important;
        }
        h2 {
          color: #111827 !important;
          margin: 0;
          font-size: 24px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <h2>Recupera la tua Password</h2>
        </div>

        <div class="content">
          <p><strong>Ciao,</strong></p>
          <p>Abbiamo ricevuto una richiesta per reimpostare la password del tuo account TaxFlow.</p>
          <p>Clicca sul pulsante qui sotto per reimpostare la tua password:</p>

          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">Reimposta Password</a>
          </div>

          <p style="font-size: 14px; color: #6b7280 !important;">
            Se il pulsante non funziona, copia e incolla questo link nel tuo browser:
          </p>
          <div style="text-align: center;">
            <span class="link">${resetUrl}</span>
          </div>

          <div class="warning">
            <strong>⚠️ Importante:</strong> Questo link è valido per 1 ora. Se non hai richiesto questa reimpostazione, ignora questa email e la tua password rimarrà invariata.
          </div>

          <p style="color: #374151 !important;">Per qualsiasi domanda, contattaci a <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>© 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: 'Reimposta la tua password - TaxFlow',
    html,
  })
}
