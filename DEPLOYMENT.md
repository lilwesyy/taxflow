# Deployment Guide - TaxFlow

Questa guida spiega come deployare TaxFlow con:
- **Frontend** su Vercel
- **Backend** su Railway
- **Database** MongoDB su Railway

## 1. Deploy Backend e Database su Railway

### Passo 1: Crea il Progetto su Railway

1. Vai su [Railway](https://railway.app)
2. Click su "New Project"
3. Seleziona "Deploy from GitHub repo"
4. Scegli il repository `taxflow`
5. Railway rileverà automaticamente il `railway.toml`

### Passo 2: Aggiungi MongoDB al Progetto

1. Nel tuo progetto Railway, click su "New"
2. Seleziona "Database" → "Add MongoDB"
3. Railway creerà automaticamente un container MongoDB
4. Nella sezione "Variables", vedrai `MONGO_URL` generato automaticamente

### Passo 3: Configura le Variabili d'Ambiente del Backend

Nel servizio backend, vai su "Variables" e aggiungi:

```
MONGODB_URI=${{MongoDB.MONGO_URL}}
JWT_SECRET=<genera-un-secret-sicuro-qui>
NODE_ENV=production
```

**Note**:
- `${{MongoDB.MONGO_URL}}` fa riferimento automaticamente al database MongoDB nel progetto
- Railway gestisce automaticamente la connessione tra i servizi
- Copia l'URL pubblico del tuo backend (es: `https://taxflow-production.up.railway.app`)

### Passo 4: Deploy

Railway farà automaticamente il deploy. Monitora i logs per verificare che:
- Il build sia completato con successo
- La connessione al database funzioni
- Il server sia online

## 2. Deploy Frontend su Vercel

### Deploy da GitHub

1. Vai su [Vercel](https://vercel.com)
2. Click su "New Project" → Importa repository `taxflow`
3. Configura:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Configurazione Variabili d'Ambiente su Vercel

Nel dashboard Vercel, Settings → Environment Variables:

```
VITE_API_URL=https://your-railway-app.railway.app
```

Sostituisci con l'URL reale del tuo backend Railway.

## 3. Configurazione CORS

Nel file `backend/src/index.ts`, aggiungi il dominio Vercel:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://your-vercel-app.vercel.app'
  ],
  credentials: true
}))
```

Committa e Railway farà il redeploy automaticamente.

## 4. Verifica Deployment

### Backend (Railway)
```bash
curl https://your-railway-app.railway.app/health
```

### MongoDB (Railway)
Nel dashboard Railway, vai su MongoDB e verifica:
- Status: Active
- Connessioni attive
- Storage utilizzato

### Frontend (Vercel)
Apri il tuo URL Vercel e prova:
- Registrazione nuovo utente
- Login
- Funzionalità dashboard

## 5. Creare Utente Admin

### Opzione A: Script Locale (Raccomandato)

1. Copia la `MONGO_URL` dal dashboard Railway
2. Crea un file `.env` locale nella root:
   ```
   MONGODB_URI=mongodb://...railway.app:port/...
   ```
3. Esegui:
   ```bash
   npm run add-user admin@example.com SecurePassword123 "Admin User"
   ```

### Opzione B: Railway CLI

```bash
# Installa Railway CLI
npm i -g @railway/cli

# Login e seleziona il progetto
railway login
railway link

# Esegui il comando nel container
railway run npm run add-user admin@example.com SecurePassword123 "Admin User"
```

## 6. Backup e Manutenzione

### Backup Database

```bash
# Esporta da Railway MongoDB
mongodump --uri="mongodb://railway-url" --out=backup-$(date +%Y%m%d)

# Importa
mongorestore --uri="mongodb://railway-url" backup-20240101/
```

### Monitoraggio

Railway fornisce:
- **Logs in tempo reale** per backend e database
- **Metrics**: CPU, RAM, Network, Disk usage
- **Alerts**: Configura notifiche per downtime o errori

## Costi Stimati

- **MongoDB su Railway**: ~$5/mese (1GB storage, scalabile)
- **Backend su Railway**: Incluso nel piano (512MB RAM, 1GB storage)
- **Vercel Frontend**: Free tier - Gratis

**Totale**: ~$5/mese con Railway Hobby plan ($5 di credito mensile incluso)

**Note sui costi**:
- Railway addebita in base all'uso effettivo
- Il piano Hobby include $5 di credito mensile
- MongoDB consuma ~$0.20/GB/mese per storage
- Traffico in uscita è gratuito fino a 100GB/mese

## Troubleshooting

### Backend non si connette al database
- Verifica che MongoDB sia "Active" su Railway
- Controlla che `MONGODB_URI` sia configurato come `${{MongoDB.MONGO_URL}}`
- Verifica logs del backend: `railway logs --service backend`
- Controlla logs MongoDB: `railway logs --service mongodb`

### Frontend non chiama il backend
- Verifica `VITE_API_URL` su Vercel punti all'URL Railway
- Controlla CORS nel backend includa il dominio Vercel
- Verifica che il backend sia online: `curl https://your-app.railway.app/health`
- Controlla la console del browser per errori CORS

### MongoDB fuori spazio
- Monitora l'uso storage nel dashboard Railway
- Considera pulire vecchie sessioni: Railway offre upgrade plans per più storage
- Implementa TTL indexes per auto-cleanup (già configurato per le sessioni)

### Build fallisce
- Verifica che `railway.toml` sia nella root
- Controlla i logs di build su Railway
- Verifica che tutte le dipendenze siano in `package.json`

## Sicurezza

1. ✅ Non committare mai file `.env` (già in `.gitignore`)
2. ✅ Usa secrets forti per `JWT_SECRET` (genera con: `openssl rand -base64 32`)
3. ✅ Abilita 2FA per tutti gli admin tramite dashboard
4. ✅ Railway MongoDB è privato per default (accessibile solo dai servizi interni)
5. ✅ SSL/TLS è automatico su Railway e Vercel
6. ✅ Le sessioni hanno TTL di 30 giorni (auto-cleanup)

## Scaling

Railway permette di scalare facilmente:

### Vertical Scaling (più potenza)
- Aumenta RAM/CPU del backend nel dashboard
- Aumenta storage MongoDB se necessario

### Horizontal Scaling
- Railway supporta multiple replicas del backend
- Configura load balancing automatico

### Database Replication
- Upgrade a MongoDB replica set per high availability
- Backup automatici disponibili nei piani superiori