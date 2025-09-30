# Guida allo Sviluppo - TaxFlow

Questa guida spiega come configurare e sviluppare TaxFlow sia in locale che su Vercel.

## Setup Iniziale

### 1. Installazione Dipendenze

```bash
# Installa dipendenze root
npm install

# Installa dipendenze frontend
cd frontend && npm install
```

### 2. Configurazione Variabili d'Ambiente

#### Root `.env` (Backend/API)
Crea un file `.env` nella root del progetto:

```bash
cp .env.example .env
```

Configura le seguenti variabili (**OBBLIGATORIE**):
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=your_jwt_secret_key_here
```

**⚠️ IMPORTANTE**: Queste variabili sono **obbligatorie**. Senza `MONGODB_URI`, l'applicazione non funzionerà e restituirà un errore.

#### Frontend `.env.local`
Crea un file `.env.local` nella cartella `frontend/`:

```bash
cd frontend
cp .env.example .env.local
```

Per sviluppo locale:
```env
VITE_API_URL=http://localhost:3000/api
```

Per produzione Vercel, il frontend usa automaticamente `/api`.

## Sviluppo Locale

**Comando Unico (Consigliato):**

```bash
npm start
```

Questo comando avvia:
- **Backend**: Vercel dev server sulla porta 3000 (`http://localhost:3000`)
- **Frontend**: Vite dev server sulla porta 5173 (`http://localhost:5173`)

Il frontend su porta 5173 comunica con le API su porta 3000.

**Comandi Separati (se necessario):**

```bash
# Terminal 1 - Backend
npm run backend

# Terminal 2 - Frontend
npm run frontend
```

**Importante**: Il file `frontend/.env.local` deve contenere:
```env
VITE_API_URL=http://localhost:3000/api
```

## Gestione Utenti

### Creare un Admin User

Per testare il login, devi creare un utente admin nel database:

```bash
npm run add-user <email> <password> [nome]
```

Esempio:
```bash
npm run add-user admin@taxflow.com Password123! "Admin User"
```

**Requisiti Password**:
- Minimo 8 caratteri
- Almeno una lettera maiuscola
- Almeno una lettera minuscola
- Almeno un numero

### Verificare un Utente

```bash
npm run check-user admin@taxflow.com
```

## Testare le Funzionalità

### 1. Test Login/Register

1. Apri `http://localhost:5173`
2. Clicca su "Accedi" o "Registrati"
3. Usa le credenziali dell'admin user creato

### 2. Test Impostazioni Admin

Dopo il login come admin:

1. Vai alla dashboard admin
2. Clicca su "Impostazioni" nella sidebar
3. Testa le seguenti sezioni:
   - **Profilo**: Modifica nome, email, telefono, ruolo, bio, indirizzo, codice fiscale
   - **Notifiche**: Attiva/disattiva preferenze notifiche
   - **Sicurezza**: Cambia password (richiede password corrente)

**API Endpoints utilizzati**:
- `GET /api/user/me` - Recupera profilo utente
- `PUT /api/user/update` - Aggiorna profilo, notifiche o password

## Build per Produzione

### Build Frontend

```bash
npm run build
```

Questo comando:
1. Compila TypeScript
2. Esegue build Vite ottimizzata
3. Output in `frontend/dist/`

### Deploy su Vercel

#### Setup Iniziale

1. Installa Vercel CLI (se non già installato):
```bash
npm install -g vercel
```

2. Login a Vercel:
```bash
vercel login
```

3. Collega il progetto:
```bash
vercel link
```

#### Configurare Variabili d'Ambiente su Vercel

Nel dashboard Vercel, vai su Settings → Environment Variables e aggiungi:

```
MONGODB_URI=mongodb+srv://...
JWT_SECRET=your_production_secret
```

**Non** aggiungere `VITE_API_URL` su Vercel - il frontend userà automaticamente `/api`.

#### Deploy

```bash
# Deploy preview
vercel

# Deploy production
vercel --prod
```

## Struttura API Endpoints

### Autenticazione

- `POST /api/auth/login` - Login utente
  - Body: `{ email, password }`
  - Response: `{ success, token, user }`

- `POST /api/auth/register` - Registrazione nuovo utente
  - Body: `{ email, password, name, role? }`
  - Response: `{ success, token, user }`

### Utente

- `GET /api/user/me` - Recupera profilo utente corrente
  - Headers: `Authorization: Bearer <token>`
  - Response: `{ success, user }`

- `PUT /api/user/update` - Aggiorna profilo utente
  - Headers: `Authorization: Bearer <token>`
  - Body: `{ name?, email?, phone?, professionalRole?, bio?, address?, fiscalCode?, registrationNumber?, notificationSettings?, currentPassword?, newPassword? }`
  - Response: `{ success, user }`

## Troubleshooting

### Frontend non si connette al Backend

Verifica che:
1. `frontend/.env.local` contiene `VITE_API_URL=http://localhost:3000/api`
2. Il backend è in esecuzione su porta 3000
3. Non ci sono errori CORS (già configurati negli endpoint API)

### Errore MongoDB Connection

Se ricevi l'errore `MONGODB_URI environment variable is not defined`:
1. Crea il file `.env` nella root del progetto
2. Aggiungi `MONGODB_URI=mongodb+srv://...` con le tue credenziali MongoDB
3. Riavvia il server

Altri problemi MongoDB:
1. Verifica che `MONGODB_URI` sia configurato correttamente nel file `.env`
2. Il tuo IP deve essere whitelisted su MongoDB Atlas (o usa 0.0.0.0/0 per sviluppo)
3. La stringa di connessione deve includere username e password corretti

### Errore JWT Invalid Token

Verifica che:
1. Il token è salvato correttamente in localStorage
2. `JWT_SECRET` è lo stesso tra creazione e verifica del token
3. Il token non è scaduto (durata: 24h)

### Build Errors

Se hai errori durante il build:

```bash
# Pulisci cache e node_modules
rm -rf node_modules frontend/node_modules
rm -rf frontend/dist
rm package-lock.json frontend/package-lock.json

# Reinstalla
npm install
cd frontend && npm install

# Riprova build
npm run build
```

## Note Importanti

1. **Non committare file .env**: Sono già in `.gitignore`
2. **Variabili Obbligatorie**: `MONGODB_URI` è **obbligatoria** - l'app non funziona senza
3. **JWT_SECRET**: Ha un fallback di default, ma cambialo in produzione per sicurezza
4. **Rate Limiting**: Il login ha rate limiting (5 tentativi per 15 minuti) - implementazione in-memory, resetta ad ogni riavvio serverless
5. **CORS**: Configurato per accettare richieste da qualsiasi origine (`*`) - restringuere in produzione se necessario
6. **Token Storage**: Il token JWT è salvato in localStorage - considera httpOnly cookies per maggiore sicurezza

## Links Utili

- **Vercel Dashboard**: https://vercel.com/dashboard
- **MongoDB Atlas**: https://cloud.mongodb.com/
- **Documentazione Vercel Functions**: https://vercel.com/docs/functions