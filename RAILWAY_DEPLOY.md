# Deploy su Railway - Guida Completa

## Architettura
Il progetto sarà deployato su Railway con 3 servizi:
- **Backend** (Express API)
- **Frontend** (React SPA)
- **Database** (MongoDB)

## Step 1: Login a Railway

```bash
railway login
```

Questo aprirà il browser per autenticarti.

## Step 2: Crea Progetto Railway

Dal dashboard Railway (https://railway.app):
1. Clicca "New Project"
2. Seleziona "Empty Project"
3. Rinomina il progetto in "TaxFlow"

## Step 3: Aggiungi MongoDB

1. Nel progetto, clicca "+ New"
2. Seleziona "Database" → "Add MongoDB"
3. Railway creerà automaticamente un database MongoDB
4. Copia la variabile `MONGO_URL` che verrà generata

## Step 4: Deploy Backend

```bash
cd backend
railway link
# Seleziona il progetto TaxFlow
railway up
```

Dopo il deploy:
1. Vai su Railway dashboard → Backend service
2. Vai su "Variables" tab
3. Aggiungi le variabili:
   - `MONGODB_URI` = (copia da MongoDB service → Connect → MONGO_URL)
   - `JWT_SECRET` = `taxflow_jwt_secret_key_2024`
   - `PORT` = `3000` (opzionale, Railway lo gestisce automaticamente)

4. Vai su "Settings" → "Networking"
5. Clicca "Generate Domain" per ottenere un URL pubblico
6. Copia l'URL (es: `https://taxflow-backend-production.up.railway.app`)

## Step 5: Deploy Frontend

```bash
cd ../frontend
railway link
# Seleziona lo STESSO progetto TaxFlow
railway up
```

Dopo il deploy:
1. Vai su Railway dashboard → Frontend service
2. Vai su "Variables" tab
3. Aggiungi:
   - `VITE_API_URL` = `https://taxflow-backend-production.up.railway.app/api`
   (usa l'URL del backend che hai copiato al Step 4)

4. Vai su "Settings" → "Networking"
5. Clicca "Generate Domain" per ottenere un URL pubblico
6. Questo sarà il tuo URL frontend: `https://taxflow-frontend-production.up.railway.app`

## Step 6: Redeploy Frontend

Dopo aver aggiunto `VITE_API_URL`, devi rifare il deploy:

```bash
cd frontend
railway up --detach
```

Oppure dal dashboard Railway, clicca sui 3 puntini del servizio Frontend → "Redeploy"

## Struttura Finale

```
Railway Project: TaxFlow
├── MongoDB Service
│   └── MONGO_URL: mongodb://...
├── Backend Service
│   ├── URL: https://taxflow-backend-production.up.railway.app
│   └── Variables:
│       ├── MONGODB_URI (from MongoDB service)
│       ├── JWT_SECRET
│       └── PORT
└── Frontend Service
    ├── URL: https://taxflow-frontend-production.up.railway.app
    └── Variables:
        └── VITE_API_URL (backend URL + /api)
```

## Test

Dopo il deploy, testa:

1. **Health Check Backend**:
   ```bash
   curl https://taxflow-backend-production.up.railway.app/api/health
   ```

2. **Frontend**:
   Apri `https://taxflow-frontend-production.up.railway.app` nel browser

3. **Login/Register**:
   Crea un utente admin e fai login

## Comandi Utili

```bash
# Vedere logs del backend
cd backend && railway logs

# Vedere logs del frontend
cd frontend && railway logs

# Aggiornare backend
cd backend && railway up

# Aggiornare frontend
cd frontend && railway up

# Aprire dashboard Railway
railway open
```

## Note

- Railway ha un piano gratuito con $5 di credito/mese
- Ogni servizio può avere il suo dominio personalizzato
- Le variabili d'ambiente sono isolate per servizio
- MongoDB su Railway è un container gestito da loro
- I servizi comunicano via URL pubblici (Railway gestisce SSL automaticamente)