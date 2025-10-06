# Stripe Payment Integration - Setup Guide

## ✅ Implementazione Completata

L'integrazione Stripe per i pagamenti delle consulenze è stata completata con successo!

### Cosa è stato implementato:

1. **Backend (Express + Stripe SDK)**
   - ✅ Route `/api/stripe/create-payment-intent` - Crea PaymentIntent
   - ✅ Route `/api/stripe/payment-status/:conversationId` - Verifica stato pagamento
   - ✅ Route `/api/stripe/webhook` - Webhook per eventi Stripe
   - ✅ Aggiornamento modello Conversation con campi Stripe

2. **Frontend (React + Stripe Elements)**
   - ✅ Componente `StripePaymentForm` con Stripe Elements
   - ✅ Servizio `stripeService` per chiamate API
   - ✅ Integrazione nel modal di pagamento business dashboard
   - ✅ Gestione stati loading/success/error

3. **Database**
   - ✅ Nuovi campi in `Conversation`:
     - `stripePaymentIntentId` (ID del payment intent)
     - `stripePaymentStatus` (pending/succeeded/failed/canceled)
     - `paidAt` (Data pagamento)

---

## 🔧 Configurazione Chiavi Stripe

### 1. Ottieni le chiavi Stripe

Vai su [Stripe Dashboard](https://dashboard.stripe.com):

1. **Modalità Test** (per sviluppo):
   - Dashboard > Developers > API keys
   - Copia `Publishable key` (inizia con `pk_test_`)
   - Copia `Secret key` (inizia con `sk_test_`) - **NON condividere mai!**

2. **Modalità Live** (per produzione):
   - Attiva il tuo account Stripe
   - Vai in modalità Live
   - Copia le chiavi live (`pk_live_` e `sk_live_`)

### 2. Configura Backend

Modifica `/backend/.env`:

```env
# Stripe Configuration
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE
STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_WEBHOOK_SECRET=whsec_YOUR_WEBHOOK_SECRET_HERE
```

### 3. Configura Frontend

Modifica `/frontend/.env.local`:

```env
# Stripe Publishable Key (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
```

⚠️ **IMPORTANTE**: La chiave publishable è sicura da esporre nel frontend. La secret key deve rimanere SOLO nel backend!

---

## 🪝 Setup Webhook Stripe

I webhook permettono a Stripe di notificare la tua app quando un pagamento è completato.

### Opzione 1: Webhook Locale (Sviluppo)

1. **Installa Stripe CLI**:
   ```bash
   # macOS
   brew install stripe/stripe-cli/stripe

   # Linux
   wget https://github.com/stripe/stripe-cli/releases/download/v1.19.4/stripe_1.19.4_linux_x86_64.tar.gz
   tar -xvf stripe_1.19.4_linux_x86_64.tar.gz
   sudo mv stripe /usr/local/bin/
   ```

2. **Login e Forward Webhook**:
   ```bash
   stripe login
   stripe listen --forward-to http://localhost:3000/api/stripe/webhook
   ```

3. **Copia il Webhook Secret**:
   - Il comando sopra stampa `whsec_xxxxx`
   - Copialo in `backend/.env` come `STRIPE_WEBHOOK_SECRET`

### Opzione 2: Webhook Produzione

1. Vai su [Stripe Dashboard > Webhooks](https://dashboard.stripe.com/webhooks)
2. Clicca **"Add endpoint"**
3. Inserisci URL: `https://your-backend-domain.com/api/stripe/webhook`
4. Seleziona eventi:
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
   - `payment_intent.canceled`
5. Copia il **Signing secret** (`whsec_xxxxx`)
6. Aggiungi in Railway/Vercel come variabile d'ambiente `STRIPE_WEBHOOK_SECRET`

---

## 🚀 Deploy su Railway

Se stai usando Railway per il backend:

1. Vai su Railway Dashboard > Tuo progetto > Variables
2. Aggiungi le variabili:
   ```
   STRIPE_SECRET_KEY=sk_test_YOUR_KEY
   STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY
   STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET
   ```
3. Redeploy il servizio

**Webhook URL Produzione**:
```
https://backend-production-3061.up.railway.app/api/stripe/webhook
```

---

## 💳 Test Carte di Credito

Stripe fornisce carte di test per simulare pagamenti:

### Carte di Successo:
- **Visa**: `4242 4242 4242 4242`
- **Mastercard**: `5555 5555 5555 4444`
- **American Express**: `3782 822463 10005`

### Carte di Fallimento:
- **Declined**: `4000 0000 0000 0002`
- **Insufficient Funds**: `4000 0000 0000 9995`
- **3D Secure Required**: `4000 0025 0000 3155`

**Altri dati**:
- Scadenza: qualsiasi data futura (es. `12/25`)
- CVV: qualsiasi 3 cifre (es. `123`)
- Nome: qualsiasi nome
- ZIP: qualsiasi codice (es. `12345`)

---

## 🔄 Flusso Pagamento Completo

1. **Business User** clicca "Paga € X" nella chat consulenza
2. **Frontend** chiama `POST /api/stripe/create-payment-intent`
3. **Backend** crea PaymentIntent Stripe e salva `paymentIntentId` in DB
4. **Frontend** mostra Stripe Elements (form carta)
5. **User** inserisce carta e conferma
6. **Stripe** processa il pagamento
7. **Webhook** (`/api/stripe/webhook`) riceve `payment_intent.succeeded`
8. **Backend** aggiorna `conversation.fatturata = true` e `paidAt`
9. **Frontend** mostra successo e ricarica conversazione

---

## 🧪 Test End-to-End

### 1. Avvia il backend
```bash
cd backend
npm run dev
```

### 2. Avvia il frontend
```bash
cd frontend
npm run dev
```

### 3. Avvia Stripe webhook listener (terminale separato)
```bash
stripe listen --forward-to http://localhost:3000/api/stripe/webhook
```

### 4. Test nel browser
1. Login come business user
2. Vai in "Consulenza"
3. Seleziona una conversazione con importo > 0
4. Clicca "Paga € X"
5. Inserisci carta test: `4242 4242 4242 4242`
6. Completa il pagamento
7. Verifica che lo stato cambi in "Pagata"

### 5. Verifica nel DB
```bash
# Connetti a MongoDB
mongo mongodb://your-connection-string

# Controlla la conversazione
db.conversations.findOne({ _id: ObjectId("your-conversation-id") })

# Dovresti vedere:
# - fatturata: true
# - stripePaymentStatus: "succeeded"
# - stripePaymentIntentId: "pi_xxxxx"
# - paidAt: ISODate("...")
```

---

## 📊 Monitoraggio Pagamenti

### Stripe Dashboard
- [Payments](https://dashboard.stripe.com/payments) - Lista tutti i pagamenti
- [Logs](https://dashboard.stripe.com/logs) - Log webhook e API
- [Events](https://dashboard.stripe.com/events) - Eventi Stripe

### Backend Logs
Il backend logga:
- ✅ `Payment succeeded for conversation: {id}`
- ❌ `Payment failed for conversation: {id}`
- 🚫 `Payment canceled for conversation: {id}`

---

## 🛡️ Sicurezza

✅ **Implementato**:
- Autenticazione JWT per tutti gli endpoint
- Verifica firma webhook Stripe
- Secret key mai esposta al frontend
- Validazione conversazione ownership
- Protezione contro doppi pagamenti

⚠️ **Raccomandazioni**:
- Usa HTTPS in produzione (già configurato su Railway)
- Ruota le chiavi API regolarmente
- Monitora Stripe Radar per frodi
- Abilita 3D Secure (SCA) in produzione

---

## 🐛 Troubleshooting

### Errore: "Missing stripe keys"
- Verifica che `STRIPE_SECRET_KEY` sia in `backend/.env`
- Riavvia il backend dopo aver modificato `.env`

### Errore: "Webhook signature verification failed"
- Controlla che `STRIPE_WEBHOOK_SECRET` sia corretto
- Assicurati di usare `stripe listen` localmente
- In produzione, verifica l'URL del webhook su Stripe Dashboard

### Pagamento non aggiorna lo stato
- Verifica che il webhook sia attivo (`stripe listen` o endpoint produzione)
- Controlla i log backend per errori
- Verifica su Stripe Dashboard > Webhooks > Signing secret

### Frontend: "Cannot read property 'clientSecret'"
- Verifica che `VITE_STRIPE_PUBLISHABLE_KEY` sia in `frontend/.env.local`
- Riavvia il frontend (`npm run dev`)

---

## 📝 File Modificati

### Backend
- ✅ `backend/src/models/Conversation.ts` - Aggiunti campi Stripe
- ✅ `backend/src/routes/stripe.ts` - Nuove route Stripe
- ✅ `backend/src/index.ts` - Registrata route `/api/stripe`
- ✅ `backend/.env` - Aggiunte variabili Stripe

### Frontend
- ✅ `frontend/src/components/payment/StripePaymentForm.tsx` - Nuovo componente
- ✅ `frontend/src/services/stripe.ts` - Nuovo servizio API
- ✅ `frontend/src/components/dashboard/pages/business/Consulenza.tsx` - Integrazione pagamento
- ✅ `frontend/.env.local` - Aggiunta chiave Stripe

### Dipendenze
- ✅ Backend: `stripe@^17.4.0`
- ✅ Frontend: `@stripe/stripe-js@^4.14.0`, `@stripe/react-stripe-js@^3.1.0`

---

## 🎉 Pronto per la Produzione

Prima di andare live:

1. **Sostituisci chiavi test con chiavi live**:
   - Stripe Dashboard > modalità Live
   - Copia `pk_live_` e `sk_live_`
   - Aggiorna env backend e frontend

2. **Configura webhook produzione**:
   - Crea endpoint su Stripe Dashboard
   - URL: `https://your-backend.com/api/stripe/webhook`
   - Copia signing secret in env produzione

3. **Test completo in produzione**:
   - Usa carta vera o Stripe test mode
   - Verifica email conferma Stripe
   - Controlla dashboard Stripe

4. **Compliance**:
   - Aggiungi Privacy Policy con menzione Stripe
   - Aggiungi Terms of Service
   - Configura invoice automatici (opzionale)

---

## 📞 Supporto

- [Stripe Docs](https://stripe.com/docs)
- [Stripe Support](https://support.stripe.com/)
- [Stripe Status](https://status.stripe.com/)

**Buon coding! 🚀**
