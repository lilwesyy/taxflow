# Deployment su Vercel

## Setup Ambiente

### 1. Variabili d'Ambiente su Vercel

Nel dashboard Vercel, vai su **Settings → Environment Variables** e aggiungi:

```
MONGODB_URI=mongodb+srv://Vercel-Admin-taxflow-db:6aWf0UVqFNzkVVEQ@taxflow-db.vvbfmn6.mongodb.net/?retryWrites=true&w=majority
JWT_SECRET=taxflow_jwt_secret_key_2024
```

### 2. Deploy

```bash
vercel --prod
```

## Struttura del Progetto

Il progetto è configurato per deployare:

- **Frontend**: Build statico di React da `frontend/dist`
- **Backend**: API Express serverless tramite `/api/index.ts`

### Come Funziona

1. **Locale**:
   - Backend Express gira su porta 3000
   - Frontend su porta 5173
   - Frontend chiama `http://localhost:3000/api`

2. **Produzione Vercel**:
   - Frontend servito come static files
   - Backend Express wrappato in `/api/index.ts` come serverless function
   - Tutte le richieste `/api/*` vengono reindirizzate alla function
   - Frontend usa `/api` direttamente (stesso dominio)

## Endpoints API

- `GET /api/health` - Health check
- `POST /api/auth/login` - Login
- `POST /api/auth/register` - Registrazione
- `GET /api/user/me` - Profilo utente (richiede auth)
- `PUT /api/user/update` - Aggiorna profilo (richiede auth)

## Note

- Le variabili d'ambiente devono essere configurate sia localmente (`backend/.env`) che su Vercel
- Il backend Express usa le stesse routes e middleware sia in locale che in produzione
- La connessione MongoDB è condivisa tra locale e produzione