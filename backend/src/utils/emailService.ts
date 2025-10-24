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

// Base email template styles
const getBaseStyles = () => `
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
  .button-success {
    background-color: #22c55e !important;
  }
  .button-success:hover {
    background-color: #16a34a !important;
  }
  .badge {
    display: inline-block;
    padding: 8px 16px;
    border-radius: 20px;
    font-weight: 600;
    font-size: 14px;
    margin-bottom: 20px;
  }
  .badge-success {
    background-color: #dcfce7 !important;
    color: #166534 !important;
  }
  .badge-info {
    background-color: #dbeafe !important;
    color: #1e40af !important;
  }
  .badge-warning {
    background-color: #fef3c7 !important;
    color: #78350f !important;
  }
  .badge-error {
    background-color: #fee2e2 !important;
    color: #991b1b !important;
  }
  .info-box {
    background-color: #eff6ff !important;
    border-left: 4px solid #2563eb;
    padding: 16px;
    margin: 24px 0;
    border-radius: 6px;
    color: #1e40af !important;
  }
  .info-box p {
    color: #1e40af !important;
    margin: 8px 0;
  }
  .info-box strong {
    color: #1e3a8a !important;
  }
  .warning-box {
    background-color: #fef3c7 !important;
    border-left: 4px solid #f59e0b;
    padding: 16px;
    margin: 24px 0;
    border-radius: 6px;
    color: #78350f !important;
  }
  .warning-box p {
    color: #78350f !important;
    margin: 8px 0;
  }
  .warning-box strong {
    color: #78350f !important;
  }
  .success-box {
    background-color: #dcfce7 !important;
    border-left: 4px solid #22c55e;
    padding: 16px;
    margin: 24px 0;
    border-radius: 6px;
    color: #166534 !important;
  }
  .success-box p {
    color: #166534 !important;
    margin: 8px 0;
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
  h2 {
    color: #111827 !important;
    margin: 0;
    font-size: 24px;
  }
  ul {
    color: #374151 !important;
    padding-left: 20px;
  }
  li {
    margin: 10px 0;
    color: #374151 !important;
  }
  .icon {
    display: inline-block;
    width: 20px;
    height: 20px;
    line-height: 20px;
    text-align: center;
    font-weight: bold;
    margin-right: 8px;
  }
`

// ============================================
// AUTHENTICATION & REGISTRATION EMAILS
// ============================================

export const sendPasswordResetEmail = async (email: string, resetUrl: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
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
            <div style="word-break: break-all; color: #2563eb !important; font-size: 13px; background-color: #eff6ff; padding: 10px; border-radius: 6px; display: inline-block; margin: 10px 0;">
              ${resetUrl}
            </div>
          </div>

          <div class="warning-box">
            <strong>&#9888; Importante:</strong> Questo link è valido per 1 ora. Se non hai richiesto questa reimpostazione, ignora questa email e la tua password rimarrà invariata.
          </div>

          <p style="color: #374151 !important;">Per qualsiasi domanda, contattaci a <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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

export const sendRegistrationConfirmationEmail = async (
  email: string,
  userName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-info">Registrazione Ricevuta</span>
          <h2>Benvenuto su TaxFlow!</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Grazie per esserti registrato su TaxFlow!</p>

          <p>Abbiamo ricevuto la tua richiesta di registrazione e il nostro team la sta verificando.</p>

          <div class="info-box">
            <p><strong>Cosa succede ora?</strong></p>
            <p>&#8226; Il nostro team verificherà i tuoi dati entro 24 ore</p>
            <p>&#8226; Riceverai un'email di conferma quando la tua registrazione sarà approvata</p>
            <p>&#8226; Potrai accedere alla piattaforma e iniziare a usare tutti i servizi TaxFlow</p>
          </div>

          <p><strong>Perché verifichiamo le registrazioni?</strong></p>
          <p>Per garantire la massima sicurezza e qualità del servizio ai nostri clienti, verifichiamo manualmente ogni nuova registrazione.</p>

          <p style="margin-top: 30px;">Nel frattempo, se hai domande, non esitare a contattarci:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Registrazione Ricevuta - TaxFlow',
    html,
  })
}

export const sendRegistrationApprovalEmail = async (
  email: string,
  userName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Registrazione Approvata</span>
          <h2>La tua registrazione è stata approvata!</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Ottime notizie! La tua registrazione su TaxFlow è stata <strong>approvata</strong>!</p>

          <p>Puoi ora accedere alla piattaforma e usufruire di tutti i nostri servizi.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/login" class="button button-success">Accedi alla Piattaforma</a>
          </div>

          <div class="info-box">
            <p><strong>Prossimi passi:</strong></p>
            <p>&#8226; Accedi alla dashboard con le tue credenziali</p>
            <p>&#8226; Compila il modulo di richiesta apertura P.IVA</p>
            <p>&#8226; Il nostro team ti guiderà in ogni fase del processo</p>
          </div>

          <p><strong>Cosa puoi fare su TaxFlow:</strong></p>
          <ul>
            <li>Richiedere l'apertura della Partita IVA in regime forfettario</li>
            <li>Gestire la fatturazione elettronica</li>
            <li>Ricevere consulenza fiscale personalizzata</li>
            <li>Simulare le tue imposte</li>
            <li>Creare e gestire il tuo business plan</li>
          </ul>

          <p style="margin-top: 30px;">Hai domande? Siamo qui per aiutarti:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Registrazione Approvata - Accedi a TaxFlow',
    html,
  })
}

export const sendRegistrationRejectionEmail = async (
  email: string,
  userName: string,
  reason?: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-error">&#10005; Registrazione Non Approvata</span>
          <h2>Informazioni sulla tua registrazione</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Grazie per il tuo interesse in TaxFlow. Purtroppo, al momento non siamo in grado di approvare la tua registrazione.</p>

          ${reason ? `
          <div class="warning-box">
            <p><strong>Motivo:</strong></p>
            <p>${reason}</p>
          </div>
          ` : ''}

          <div class="info-box">
            <p><strong>Cosa puoi fare?</strong></p>
            <p>Se ritieni che ci sia stato un errore o desideri maggiori informazioni, contatta il nostro supporto:</p>
            <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
          </div>

          <p>Saremo lieti di aiutarti e chiarire eventuali dubbi.</p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Informazioni sulla tua Registrazione - TaxFlow',
    html,
  })
}

// ============================================
// P.IVA REQUEST EMAILS
// ============================================

export const sendPivaApprovalEmail = async (
  email: string,
  userName: string,
  planName: string,
  planPrice: number,
  paymentUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Richiesta Approvata</span>
          <h2>La tua richiesta P.IVA è stata approvata!</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Siamo felici di comunicarti che la tua richiesta di apertura Partita IVA è stata <strong>approvata</strong>!</p>

          <div class="info-box">
            <p><strong>Piano selezionato:</strong> ${planName}</p>
            <p><strong>Importo:</strong> &euro;${planPrice.toFixed(2)}</p>
          </div>

          <p><strong>Prossimi passi:</strong></p>
          <ul>
            <li>Completa il pagamento cliccando sul pulsante qui sotto</li>
            <li>Riceverai conferma immediata via email</li>
            <li>Il nostro team inizierà subito la pratica di apertura P.IVA</li>
            <li>Ti terremo aggiornato su ogni fase del processo</li>
          </ul>

          <div style="text-align: center;">
            <a href="${paymentUrl}" class="button button-success">Procedi al Pagamento</a>
          </div>

          <p style="margin-top: 30px;">Hai domande? Il nostro team è a tua disposizione:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Richiesta P.IVA Approvata - TaxFlow',
    html,
  })
}

export const sendPivaRejectionEmail = async (
  email: string,
  userName: string,
  reason: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-warning">&#9888; Richiesta da Revisionare</span>
          <h2>La tua richiesta P.IVA necessita di modifiche</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Grazie per aver inviato la tua richiesta di apertura Partita IVA. Dopo un'attenta revisione, abbiamo riscontrato alcune informazioni che necessitano di chiarimenti o documentazione aggiuntiva.</p>

          <div class="warning-box">
            <p><strong>Motivo della revisione:</strong></p>
            <p>${reason}</p>
          </div>

          <p><strong>Come procedere:</strong></p>
          <ul>
            <li>Accedi alla tua dashboard TaxFlow</li>
            <li>Aggiorna le informazioni richieste nella sezione "Apertura P.IVA"</li>
            <li>Carica eventuali documenti mancanti</li>
            <li>Invia nuovamente la richiesta</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button">Vai alla Dashboard</a>
          </div>

          <div class="info-box">
            <p><strong>Hai bisogno di aiuto?</strong></p>
            <p>Il nostro team è a disposizione per qualsiasi chiarimento:</p>
            <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
          </div>

          <p style="margin-top: 20px;">Siamo qui per aiutarti a completare con successo la tua richiesta!</p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Richiesta P.IVA - Documentazione da Completare - TaxFlow',
    html,
  })
}

// ============================================
// STRIPE PAYMENT EMAILS
// ============================================

export const sendPaymentSuccessEmail = async (
  email: string,
  userName: string,
  amount: number,
  description: string,
  invoiceUrl?: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Pagamento Confermato</span>
          <h2>Pagamento ricevuto con successo</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Il tuo pagamento è stato elaborato con successo!</p>

          <div class="success-box">
            <p><strong>Dettagli pagamento:</strong></p>
            <p>Descrizione: ${description}</p>
            <p>Importo: <strong>&euro;${amount.toFixed(2)}</strong></p>
            <p>Data: ${new Date().toLocaleDateString('it-IT')}</p>
          </div>

          ${invoiceUrl ? `
          <div style="text-align: center;">
            <a href="${invoiceUrl}" class="button">Scarica Ricevuta</a>
          </div>
          ` : ''}

          <p>Grazie per aver scelto TaxFlow. Ti terremo aggiornato su tutti gli sviluppi del tuo servizio.</p>

          <p style="margin-top: 30px;">Per assistenza:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Conferma Pagamento - TaxFlow',
    html,
  })
}

export const sendPaymentFailedEmail = async (
  email: string,
  userName: string,
  amount: number,
  retryUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-error">&#10005; Pagamento Non Riuscito</span>
          <h2>Il pagamento non è andato a buon fine</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Purtroppo il tuo pagamento di <strong>&euro;${amount.toFixed(2)}</strong> non è stato completato.</p>

          <div class="warning-box">
            <p><strong>Possibili cause:</strong></p>
            <p>&#8226; Fondi insufficienti</p>
            <p>&#8226; Carta scaduta o non valida</p>
            <p>&#8226; Limite di spesa raggiunto</p>
            <p>&#8226; Errore di rete durante la transazione</p>
          </div>

          <p><strong>Cosa fare ora:</strong></p>
          <ul>
            <li>Verifica i dati della tua carta</li>
            <li>Assicurati di avere fondi sufficienti</li>
            <li>Riprova il pagamento</li>
          </ul>

          <div style="text-align: center;">
            <a href="${retryUrl}" class="button">Riprova Pagamento</a>
          </div>

          <p style="margin-top: 30px;">Se il problema persiste, contattaci:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Pagamento Non Riuscito - TaxFlow',
    html,
  })
}

export const sendSubscriptionCreatedEmail = async (
  email: string,
  userName: string,
  planName: string,
  amount: number,
  interval: string,
  nextBillingDate: Date
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Abbonamento Attivato</span>
          <h2>Benvenuto in TaxFlow!</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Il tuo abbonamento è stato attivato con successo!</p>

          <div class="success-box">
            <p><strong>Dettagli abbonamento:</strong></p>
            <p>Piano: ${planName}</p>
            <p>Importo: &euro;${amount.toFixed(2)}/${interval === 'month' ? 'mese' : 'anno'}</p>
            <p>Prossimo rinnovo: ${nextBillingDate.toLocaleDateString('it-IT')}</p>
          </div>

          <p><strong>Cosa include il tuo piano:</strong></p>
          <ul>
            <li>Gestione completa Partita IVA forfettaria</li>
            <li>Fatturazione elettronica illimitata</li>
            <li>Consulenza fiscale dedicata</li>
            <li>Supporto prioritario</li>
            <li>Dashboard analytics avanzata</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button button-success">Vai alla Dashboard</a>
          </div>

          <p style="margin-top: 30px;">Il tuo abbonamento si rinnoverà automaticamente. Puoi gestire o annullare l'abbonamento in qualsiasi momento dalla tua dashboard.</p>

          <p>Per assistenza:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Abbonamento Attivato - TaxFlow',
    html,
  })
}

export const sendSubscriptionUpdatedEmail = async (
  email: string,
  userName: string,
  oldPlan: string,
  newPlan: string,
  newAmount: number
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-info">Abbonamento Aggiornato</span>
          <h2>Il tuo piano è stato modificato</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Il tuo piano di abbonamento è stato aggiornato con successo.</p>

          <div class="info-box">
            <p><strong>Modifiche:</strong></p>
            <p>Piano precedente: ${oldPlan}</p>
            <p>Nuovo piano: ${newPlan}</p>
            <p>Nuovo importo: &euro;${newAmount.toFixed(2)}</p>
          </div>

          <p>Le modifiche saranno effettive dal prossimo ciclo di fatturazione.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button">Vai alla Dashboard</a>
          </div>

          <p style="margin-top: 30px;">Per assistenza:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Piano Abbonamento Aggiornato - TaxFlow',
    html,
  })
}

export const sendSubscriptionCanceledEmail = async (
  email: string,
  userName: string,
  planName: string,
  endDate: Date
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-warning">Abbonamento Cancellato</span>
          <h2>Il tuo abbonamento è stato cancellato</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${userName},</strong></p>
          <p>Abbiamo ricevuto la tua richiesta di cancellazione dell'abbonamento <strong>${planName}</strong>.</p>

          <div class="warning-box">
            <p><strong>Dettagli cancellazione:</strong></p>
            <p>Piano cancellato: ${planName}</p>
            <p>Ultimo giorno di accesso: ${endDate.toLocaleDateString('it-IT')}</p>
            <p>Potrai continuare ad utilizzare i servizi fino alla data di scadenza.</p>
          </div>

          <p><strong>Ci dispiace vederti andare!</strong></p>
          <p>Se hai un momento, ci piacerebbe sapere il motivo della cancellazione per migliorare i nostri servizi.</p>

          <div style="text-align: center;">
            <a href="mailto:support@taxflow.it?subject=Feedback cancellazione abbonamento" class="button">Invia Feedback</a>
          </div>

          <p style="margin-top: 30px;">Puoi riattivare il tuo abbonamento in qualsiasi momento dalla tua dashboard.</p>

          <p>Per assistenza:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
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
    subject: 'Abbonamento Cancellato - TaxFlow',
    html,
  })
}

// ============================================
// CONSULTATION EMAILS
// ============================================

export const sendConsultationRequestEmail = async (
  clientEmail: string,
  clientName: string,
  subject: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-info">Richiesta Inviata</span>
          <h2>Richiesta di consulenza ricevuta</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${clientName},</strong></p>
          <p>Abbiamo ricevuto la tua richiesta di consulenza!</p>

          <div class="info-box">
            <p><strong>Oggetto:</strong> ${subject}</p>
            <p><strong>Tempi di risposta:</strong> Entro 24-48 ore lavorative</p>
          </div>

          <p>Il nostro team di consulenti sta esaminando la tua richiesta e ti risponderà il prima possibile.</p>

          <p><strong>Cosa succede ora:</strong></p>
          <ul>
            <li>Un consulente esperto analizzerà la tua richiesta</li>
            <li>Riceverai una risposta dettagliata via email</li>
            <li>Potrai visualizzare la risposta anche dalla tua dashboard</li>
          </ul>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button">Vai alla Dashboard</a>
          </div>

          <p style="margin-top: 30px;">Per urgenze:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: clientEmail,
    subject: 'Richiesta Consulenza Ricevuta - TaxFlow',
    html,
  })
}

export const sendConsultationResponseEmail = async (
  clientEmail: string,
  clientName: string,
  subject: string,
  consultantName: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Risposta Disponibile</span>
          <h2>Il tuo consulente ha risposto</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${clientName},</strong></p>
          <p>Hai ricevuto una nuova risposta dal tuo consulente fiscale!</p>

          <div class="success-box">
            <p><strong>Oggetto:</strong> ${subject}</p>
            <p><strong>Consulente:</strong> ${consultantName}</p>
          </div>

          <p>Accedi alla tua dashboard per visualizzare la risposta completa e continuare la conversazione con il tuo consulente.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button button-success">Visualizza Risposta</a>
          </div>

          <p style="margin-top: 30px;">Se hai ulteriori domande, puoi rispondere direttamente dalla dashboard.</p>

          <p>Per assistenza:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: clientEmail,
    subject: 'Nuova Risposta dal tuo Consulente - TaxFlow',
    html,
  })
}

export const sendNewConsultationNotificationToAdmin = async (
  adminEmail: string,
  clientName: string,
  subject: string,
  conversationUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-warning">Nuova Richiesta</span>
          <h2>Nuova richiesta di consulenza</h2>
        </div>

        <div class="content">
          <p><strong>Nuova richiesta ricevuta</strong></p>

          <div class="info-box">
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Oggetto:</strong> ${subject}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
          </div>

          <p>Un cliente ha inviato una nuova richiesta di consulenza che richiede la tua attenzione.</p>

          <div style="text-align: center;">
            <a href="${conversationUrl}" class="button">Visualizza Richiesta</a>
          </div>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: adminEmail,
    subject: 'Nuova Richiesta Consulenza - TaxFlow Admin',
    html,
  })
}

// ============================================
// DOCUMENT EMAILS
// ============================================

export const sendDocumentUploadedEmail = async (
  clientEmail: string,
  clientName: string,
  fileName: string,
  category: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Documento Caricato</span>
          <h2>Documento caricato con successo</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${clientName},</strong></p>
          <p>Il tuo documento è stato caricato con successo!</p>

          <div class="success-box">
            <p><strong>Nome file:</strong> ${fileName}</p>
            <p><strong>Categoria:</strong> ${category}</p>
            <p><strong>Data caricamento:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
          </div>

          <p>Il nostro team sta verificando il documento. Riceverai una notifica se saranno necessarie ulteriori informazioni.</p>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button">Visualizza Documenti</a>
          </div>

          <p style="margin-top: 30px;">Per assistenza:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: clientEmail,
    subject: 'Documento Caricato - TaxFlow',
    html,
  })
}

export const sendDocumentUploadNotificationToAdmin = async (
  adminEmail: string,
  clientName: string,
  fileName: string,
  category: string,
  documentUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-info">Nuovo Documento</span>
          <h2>Nuovo documento caricato</h2>
        </div>

        <div class="content">
          <p><strong>Nuovo documento da verificare</strong></p>

          <div class="info-box">
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Nome file:</strong> ${fileName}</p>
            <p><strong>Categoria:</strong> ${category}</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
          </div>

          <div style="text-align: center;">
            <a href="${documentUrl}" class="button">Visualizza Documento</a>
          </div>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: adminEmail,
    subject: 'Nuovo Documento Caricato - TaxFlow Admin',
    html,
  })
}

// ============================================
// FEEDBACK EMAILS
// ============================================

export const sendFeedbackResponseEmail = async (
  clientEmail: string,
  clientName: string,
  originalFeedback: string,
  responseText: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-success">&#10003; Nuova Risposta</span>
          <h2>Risposta al tuo feedback</h2>
        </div>

        <div class="content">
          <p><strong>Ciao ${clientName},</strong></p>
          <p>Abbiamo risposto al tuo feedback!</p>

          <div class="info-box">
            <p><strong>Il tuo feedback:</strong></p>
            <p>${originalFeedback.substring(0, 200)}${originalFeedback.length > 200 ? '...' : ''}</p>
          </div>

          <div class="success-box">
            <p><strong>La nostra risposta:</strong></p>
            <p>${responseText}</p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}/dashboard" class="button button-success">Visualizza nella Dashboard</a>
          </div>

          <p style="margin-top: 30px;">Grazie per il tuo prezioso feedback! Ci aiuta a migliorare continuamente i nostri servizi.</p>

          <p>Per ulteriori domande:</p>
          <p>Email: <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a></p>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: clientEmail,
    subject: 'Risposta al tuo Feedback - TaxFlow',
    html,
  })
}

export const sendNewFeedbackNotificationToAdmin = async (
  adminEmail: string,
  clientName: string,
  feedbackText: string,
  rating: number,
  feedbackUrl: string
): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="logo-text">TaxFlow</div>
          <span class="badge badge-info">Nuovo Feedback</span>
          <h2>Nuovo feedback ricevuto</h2>
        </div>

        <div class="content">
          <p><strong>Un cliente ha lasciato un feedback</strong></p>

          <div class="info-box">
            <p><strong>Cliente:</strong> ${clientName}</p>
            <p><strong>Valutazione:</strong> ${rating}/5</p>
            <p><strong>Data:</strong> ${new Date().toLocaleDateString('it-IT')}</p>
          </div>

          <div class="warning-box">
            <p><strong>Messaggio:</strong></p>
            <p>${feedbackText}</p>
          </div>

          <div style="text-align: center;">
            <a href="${feedbackUrl}" class="button">Rispondi al Feedback</a>
          </div>
        </div>

        <div class="footer">
          <p>&copy; 2025 TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Questa email è stata inviata automaticamente. Si prega di non rispondere.
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: adminEmail,
    subject: `Nuovo Feedback (${rating}/5) - TaxFlow Admin`,
    html,
  })
}

// ============================================
// NEWSLETTER EMAILS
// ============================================

export const sendNewsletterLaunchEmail = async (email: string): Promise<void> => {
  const html = `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>${getBaseStyles()}</style>
    </head>
    <body>
      <div class="container">
        <div class="header" style="background: linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%);">
          <div class="logo-text" style="color: #ffffff;">TaxFlow</div>
          <h2 style="color: #ffffff;">🎉 TaxFlow è Live!</h2>
        </div>

        <div class="content">
          <p><strong>Ciao!</strong></p>
          <p>La piattaforma <strong>TaxFlow</strong> è finalmente disponibile! 🚀</p>

          <p>Gestisci la tua partita IVA in modo semplice e professionale con:</p>

          <div class="success-box">
            <p><strong>✓</strong> Consulente dedicato</p>
            <p><strong>✓</strong> Dashboard intelligente</p>
            <p><strong>✓</strong> AI integrata per business planning</p>
            <p><strong>✓</strong> Fatturazione elettronica semplificata</p>
          </div>

          <div style="text-align: center;">
            <a href="${process.env.FRONTEND_URL || 'https://taxflow.it'}" class="button button-success">Accedi a TaxFlow</a>
          </div>

          <p style="margin-top: 30px;">Grazie per il tuo interesse in TaxFlow!</p>
          <p><strong>Il Team TaxFlow</strong></p>

          <p style="margin-top: 20px; color: #6b7280 !important; font-size: 14px;">
            Per qualsiasi domanda, contattaci a <a href="mailto:support@taxflow.it" style="color: #2563eb !important;">support@taxflow.it</a>
          </p>
        </div>

        <div class="footer">
          <p>&copy; ${new Date().getFullYear()} TaxFlow. Tutti i diritti riservati.</p>
          <p style="font-size: 12px; margin-top: 10px;">
            Hai ricevuto questa email perché ti sei iscritto alle notifiche di lancio su taxflow.it
          </p>
        </div>
      </div>
    </body>
    </html>
  `

  await sendEmail({
    to: email,
    subject: '🎉 TaxFlow è Live! La tua piattaforma per la gestione della P.IVA',
    html,
  })
}
