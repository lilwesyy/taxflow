# Guida Deploy Frontend su Vercel - TaxFlow

## 🚀 Deploy tramite Dashboard Vercel (Metodo Consigliato)

### Step 1: Accedi a Vercel

1. Vai su https://vercel.com
2. Click su **"Login"** in alto a destra
3. Scegli **"Continue with GitHub"**
4. Autorizza Vercel ad accedere ai tuoi repository

### Step 2: Crea Nuovo Progetto

1. Una volta loggato, click su **"Add New..."** (in alto a destra)
2. Seleziona **"Project"**
3. Ti porterà alla pagina "Import Git Repository"

### Step 3: Importa Repository

1. Nella lista dei repository, cerca **"taxflow"**
2. Click sul pulsante **"Import"** accanto al repository

### Step 4: Configura il Progetto

Verrai portato alla pagina di configurazione. Compila così:

#### General Settings
- **Project Name**: `taxflow` (o lascia quello suggerito)
- **Framework Preset**: **Vite** (dovrebbe essere auto-rilevato)

#### Root Directory
- Click su **"Edit"** accanto a "Root Directory"
- Inserisci: `frontend`
- Click su **"Continue"**

#### Build and Output Settings
Lascia i valori di default (Vercel li rileva automaticamente):
- **Build Command**: `npm run build`
- **Output Directory**: `dist`
- **Install Command**: `npm install`

#### Environment Variables
Questa è la parte importante! Click su **"Add"**:

**Variable 1:**
- **Key**: `VITE_API_URL`
- **Value**: `https://backend-production-3061.up.railway.app`
- **Environment**: Seleziona solo **"Production"**

### Step 5: Deploy!

1. Click sul grande pulsante blu **"Deploy"**
2. Vercel inizierà a:
   - Clonare il repository
   - Installare le dipendenze
   - Fare il build
   - Deployare il sito

3. Aspetta 2-3 minuti. Vedrai i log in tempo reale.

4. Quando vedi **"Congratulations! 🎉"** il deploy è completo!

### Step 6: Ottieni il tuo URL

1. Vercel ti mostrerà il tuo URL, qualcosa tipo:
   - `https://taxflow-xxx.vercel.app` oppure
   - `https://taxflow-username.vercel.app`

2. **Copia questo URL!** Ti servirà per il prossimo step.

3. Click su **"Visit"** per vedere il tuo sito live!

---

## 🔧 Configurazione Post-Deploy

### Aggiorna CORS nel Backend

Ora devi dire al backend di accettare richieste dal tuo dominio Vercel.

1. Apri il file `backend/src/index.ts`
2. Trova la sezione CORS (circa linea 15-23)
3. Aggiungi il tuo URL Vercel alla lista:

```typescript
app.use(cors({
  origin: [
    'http://localhost:5173',
    'https://backend-production-3061.up.railway.app',
    'https://taxflow-xxx.vercel.app'  // ← Aggiungi qui il TUO URL Vercel
  ],
  credentials: true
}))
```

4. Salva il file
5. Committa e pusha su GitHub:

```bash
git add backend/src/index.ts
git commit -m "Add Vercel domain to CORS"
git push origin master
```

6. Railway farà automaticamente il redeploy del backend (aspetta 1-2 minuti)

---

## ✅ Test del Deployment

### 1. Apri il tuo sito Vercel

Vai su `https://taxflow-xxx.vercel.app` (usa il tuo URL)

### 2. Testa la Registrazione

1. Click su **"Inizia Ora"** o **"Registrati"**
2. Compila il form di registrazione
3. Se vedi errori CORS nella console del browser:
   - Aspetta che Railway finisca il redeploy
   - Ricarica la pagina
   - Riprova

### 3. Testa il Login

1. Fai login con le credenziali appena create
2. Dovresti vedere la dashboard

### 4. Testa le Funzionalità

- [ ] Dashboard si carica
- [ ] Navigazione tra le pagine funziona
- [ ] 2FA (se lo abiliti) funziona
- [ ] Logout funziona

---

## 🎨 Personalizzazione Dominio (Opzionale)

Se vuoi usare un dominio personalizzato tipo `taxflow.com`:

1. Nel dashboard Vercel del tuo progetto
2. Vai su **Settings** → **Domains**
3. Click su **"Add"**
4. Inserisci il tuo dominio
5. Segui le istruzioni per configurare i DNS

---

## 🔄 Aggiornamenti Futuri

Ogni volta che pushhi su GitHub, Vercel farà automaticamente il redeploy!

Per vedere i deploy:
1. Dashboard Vercel → Tuo progetto
2. Tab **"Deployments"**
3. Vedrai tutti i deploy con timestamp e commit

---

## 🐛 Troubleshooting

### Deploy fallisce

**Errore: "Build failed"**
- Verifica che `frontend/package.json` esista
- Controlla i logs di build su Vercel
- Verifica che tutte le dipendenze siano installabili

**Soluzione**:
```bash
cd frontend
npm install
npm run build
```
Se il build funziona localmente, funzionerà su Vercel.

### Pagina bianca / 404

**Problema**: Le routes non funzionano
**Soluzione**: Verifica che `frontend/vercel.json` esista con:

```json
{
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

### Errori CORS

**Errore in console**: "CORS policy: No 'Access-Control-Allow-Origin'"

**Soluzione**:
1. Verifica di aver aggiunto il dominio Vercel in `backend/src/index.ts`
2. Committa e pusha le modifiche
3. Aspetta il redeploy su Railway (1-2 minuti)
4. Ricarica la pagina Vercel

### API non risponde

**Problema**: Le chiamate API falliscono
**Soluzione**:
1. Apri la console del browser (F12)
2. Vai sul tab "Network"
3. Ricarica la pagina
4. Cerca le chiamate verso `backend-production-3061.up.railway.app`
5. Click sulla chiamata → Tab "Headers"
6. Verifica che l'URL sia corretto

Se l'URL è sbagliato:
1. Dashboard Vercel → Settings → Environment Variables
2. Modifica `VITE_API_URL`
3. Click su **"Save"**
4. Vai su **Deployments** → Click sui 3 puntini dell'ultimo deploy → **"Redeploy"**

---

## 📊 Monitoraggio

Dashboard Vercel ti fornisce:
- **Analytics**: Visualizzazioni, performance
- **Logs**: Logs in tempo reale
- **Speed Insights**: Metriche di velocità
- **Deployments**: Storia di tutti i deploy

---

## 💰 Costi

Il piano **Hobby** di Vercel è **GRATIS** e include:
- Deploy illimitati
- 100GB bandwidth/mese
- HTTPS automatico
- Dominio .vercel.app gratuito

Perfetto per questo progetto! 🎉

---

## 📝 Checklist Finale

- [ ] Deploy completato con successo
- [ ] URL Vercel copiato
- [ ] CORS aggiornato nel backend
- [ ] Backend redeployato su Railway
- [ ] Test registrazione OK
- [ ] Test login OK
- [ ] Dashboard carica correttamente
- [ ] Nessun errore in console
- [ ] (Opzionale) Dominio personalizzato configurato

---

## 🆘 Supporto

Se hai problemi:
1. Controlla i **logs di build** su Vercel
2. Controlla la **console del browser** (F12)
3. Verifica le **variabili d'ambiente** su Vercel
4. Testa il **backend direttamente**: https://backend-production-3061.up.railway.app/health

Tutto dovrebbe funzionare! 🚀
