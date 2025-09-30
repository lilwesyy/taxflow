# Quick Deploy Guide - TaxFlow

## Backend Railway
**URL Attuale**: https://backend-production-3061.up.railway.app

## Architettura
- **Backend** su Railway (già deployato)
- **Frontend** su Vercel
- **Database** MongoDB su Railway

## Configurazione Attuale

### Backend (Railway) ✅
- **URL**: https://backend-production-3061.up.railway.app
- **Status**: Deployato

### Database (Railway) ✅
- **Connection**: `mongodb://mongo:buznzsXyvqWmTROlTZpnQMKQZnhyuOJX@turntable.proxy.rlwy.net:43605`
- **Status**: Attivo

### Variabili d'Ambiente Backend Railway

Assicurati di avere queste variabili configurate su Railway:

```bash
MONGODB_URI=mongodb://mongo:buznzsXyvqWmTROlTZpnQMKQZnhyuOJX@turntable.proxy.rlwy.net:43605
JWT_SECRET=<your-secure-secret>
NODE_ENV=production
```

## Deploy Frontend su Vercel

### Step 1: Crea Progetto su Vercel

1. Vai su https://vercel.com
2. Click "New Project"
3. Importa il repository GitHub `taxflow`
4. Configura:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

### Step 2: Configura Variabile d'Ambiente

Nel dashboard Vercel, Settings → Environment Variables:

```bash
VITE_API_URL=https://backend-production-3061.up.railway.app
```

### Step 3: Deploy

Vercel farà automaticamente il deploy. Una volta completato, avrai un URL tipo:
`https://taxflow.vercel.app`

### Step 4: Aggiorna CORS nel Backend

Modifica `backend/src/index.ts` e aggiungi il dominio Vercel:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://taxflow.vercel.app',  // Sostituisci con il tuo URL Vercel
    'https://backend-production-3061.up.railway.app'
  ],
  credentials: true
}))
```

Committa e pusha su GitHub - Railway farà il redeploy automaticamente.

## Test Deployment

### 1. Test Backend Railway

```bash
# Health check
curl https://backend-production-3061.up.railway.app/health

# Dovrebbe restituire: {"status":"ok","message":"Server is running"}
```

### 2. Test Database Connection

Il backend dovrebbe connettersi automaticamente al database. Verifica nei logs Railway:

```bash
railway logs
# Cerca: "MongoDB connected successfully"
```

### 3. Test Frontend Vercel

1. Apri il tuo URL Vercel nel browser
2. Prova a registrare un nuovo utente
3. Fai login
4. Verifica che il dashboard si carichi correttamente

### 4. Test Completo

- [ ] Registrazione nuovo utente
- [ ] Login con email/password
- [ ] Attivazione 2FA
- [ ] Login con 2FA
- [ ] Visualizzazione sessioni attive
- [ ] Terminazione sessione
- [ ] Cambio password
- [ ] Logout

## Creare Primo Utente Admin

### Opzione 1: Script Locale

1. Crea un file `.env` nella root del progetto:
   ```bash
   MONGODB_URI=mongodb://mongo:buznzsXyvqWmTROlTZpnQMKQZnhyuOJX@turntable.proxy.rlwy.net:43605
   ```

2. Esegui lo script:
   ```bash
   npm run add-user admin@taxflow.com SecurePassword123 "Admin TaxFlow"
   ```

### Opzione 2: Registrazione Web

1. Vai su Vercel URL
2. Clicca su "Registrati"
3. Compila il form
4. Il primo utente sarà automaticamente role "business"
5. Cambia manualmente il role in "admin" nel database se necessario

## Troubleshooting

### Backend non risponde
```bash
# Verifica logs Railway
railway logs

# Verifica che il servizio sia online
curl https://backend-production-3061.up.railway.app/health
```

### Database connection error
- Verifica che `MONGODB_URI` sia configurato correttamente su Railway
- Controlla che il servizio MongoDB sia attivo nel dashboard Railway

### Frontend non carica dati
- Verifica che `VITE_API_URL` sia configurato su Vercel
- Controlla la console del browser per errori CORS
- Verifica che il CORS nel backend includa il dominio Vercel

### CORS errors
Aggiorna `backend/src/index.ts` con il dominio Vercel corretto e committa:
```bash
git add backend/src/index.ts
git commit -m "Update CORS for Vercel domain"
git push
```

Railway farà automaticamente il redeploy.

## Checklist Finale

- [ ] Backend deployato su Railway ✅
- [ ] MongoDB attivo su Railway ✅
- [ ] Variabili d'ambiente configurate su Railway
- [ ] Frontend deployato su Vercel
- [ ] `VITE_API_URL` configurato su Vercel
- [ ] CORS aggiornato con dominio Vercel
- [ ] Test health check backend OK
- [ ] Test registrazione frontend OK
- [ ] Test login OK
- [ ] Test 2FA OK
- [ ] Utente admin creato

## Link Utili

- **Backend URL**: https://backend-production-3061.up.railway.app
- **Railway Dashboard**: https://railway.app/project/[your-project-id]
- **Vercel Dashboard**: https://vercel.com/[your-username]/taxflow
- **MongoDB Connection**: `mongodb://mongo:***@turntable.proxy.rlwy.net:43605`

## Costi

- **Railway**: ~$5/mese (include backend + MongoDB)
- **Vercel**: Gratis (piano hobby)
- **Totale**: ~$5/mese