# Fattura Elettronica API - Guida Setup

## 🔧 Configurazione API Fattura Elettronica per TaxFlow

### Prerequisiti
1. Account su Fattura Elettronica API
2. API key (ottieni su https://www.fattura-elettronica-api.it)

---

## 📝 Passo 1: Registrazione Account

1. Vai su **https://www.fattura-elettronica-api.it**
2. Registra il tuo account
3. Attiva il servizio e ottieni la tua API key

---

## 🔑 Passo 2: Ottenere l'API Key

Dopo la registrazione, troverai la tua API key nella dashboard:

- **API Key**: Usata per autenticare tutte le chiamate API
- Supporta autenticazione Basic e Bearer token (con caching automatico)

---

## ⚙️ Passo 3: Configurare TaxFlow

### Aggiorna il file `.env` nel backend:

```bash
# Fattura Elettronica API Configuration
FATTURA_ELETTRONICA_API_KEY=your_api_key_here
FATTURA_ELETTRONICA_API_MODE=test  # test o prod
```

### Per ambiente di test (consigliato per sviluppo):
```bash
FATTURA_ELETTRONICA_API_KEY=your_api_key
FATTURA_ELETTRONICA_API_MODE=test
```

URL endpoint test: `https://fattura-elettronica-api.it/ws2.0/test`

### Per ambiente di produzione:
```bash
FATTURA_ELETTRONICA_API_KEY=your_api_key
FATTURA_ELETTRONICA_API_MODE=prod
```

URL endpoint produzione: `https://fattura-elettronica-api.it/ws2.0/prod`

---

## ✅ Passo 4: Testare la Connessione

### 1. Avvia il backend:
```bash
npm run backend
```

Il sistema dovrebbe mostrare:
```
✅ Fattura Elettronica API configured (test mode)
✅ Server running on port 3000
```

### 2. Testa la connessione (solo per admin):

Effettua il login come admin e verifica che il sistema si connetta all'API.

Oppure testa via API:
```bash
curl -X GET http://localhost:3000/api/fatturaelettronica/status \
  -H "Authorization: Bearer YOUR_JWT_TOKEN"
```

Risposta attesa:
```json
{
  "success": true,
  "message": "Successfully connected to Fattura Elettronica API",
  "apiUrl": "https://fattura-elettronica-api.it/ws2.0/test",
  "mode": "test",
  "tokenCached": false
}
```

---

## 🎯 Funzionalità Implementate

### Gestione Aziende

#### Crea azienda
```bash
POST /api/fatturaelettronica/aziende
{
  "ragione_sociale": "Azienda di Test SRL",
  "piva": "12345678901",
  "cfis": "12345678901",
  "indirizzo": "Via Roma 1",
  "cap": "00100",
  "citta": "Roma",
  "provincia": "RM",
  "forma_giuridica": "srl",
  "tipo_regime_fiscale": "RF01"
}
```

#### Ottieni azienda
```bash
GET /api/fatturaelettronica/aziende
```

#### Aggiorna azienda
```bash
PUT /api/fatturaelettronica/aziende
{
  "indirizzo": "Nuovo Indirizzo",
  "email": "nuova@email.com"
}
```

#### Elimina azienda
```bash
DELETE /api/fatturaelettronica/aziende
```

### Gestione Fatture

#### Invia fattura (JSON)
```bash
POST /api/fatturaelettronica/fatture
{
  "format": "json",
  "data": {
    "piva_mittente": "12345678901",
    "destinatario": {
      "CodiceSDI": "0000000",
      "PartitaIVA": "98765432109",
      "Denominazione": "Cliente SPA",
      "Indirizzo": "Via Test 1",
      "CAP": "00100",
      "Comune": "Roma",
      "Provincia": "RM"
    },
    "documento": {
      "tipo": "FATT",
      "Data": "2025-01-15",
      "Numero": "1",
      "DatiPagamento": {
        "CondizioniPagamento": "TP02",
        "DettaglioPagamento": {
          "ModalitaPagamento": "MP05",
          "DataScadenzaPagamento": "2025-02-15"
        }
      }
    },
    "righe": [
      {
        "Descrizione": "Servizio 1",
        "PrezzoUnitario": "100.00",
        "AliquotaIVA": 22,
        "Quantita": 1
      }
    ]
  }
}
```

#### Invia fattura (XML)
```bash
POST /api/fatturaelettronica/fatture
{
  "format": "xml",
  "data": "<fattura>...</fattura>"
}
```

#### Ottieni fatture
```bash
GET /api/fatturaelettronica/fatture?page=1&per_page=100
```

Parametri query opzionali:
- `page`: Numero pagina (default: 1)
- `per_page`: Risultati per pagina (max: 1000, default: 100)
- `unread`: Solo fatture non lette (true/false)
- `date_from`: Data inizio (YYYY-MM-DD)
- `date_to`: Data fine (YYYY-MM-DD)
- `partita_iva`: Filtra per P.IVA
- `numero_documento`: Filtra per numero documento
- `tipo_documento`: Filtra per tipo documento

#### Download PDF fattura
```bash
GET /api/fatturaelettronica/fatture/:id/pdf
```

---

## 🔒 Autenticazione

### Sistema di Token Caching Automatico

L'integrazione implementa un sistema intelligente di caching dei token:

1. **Prima chiamata**: Usa Basic Authentication con API key
2. **Header della risposta**: Include `X-auth-token` e `X-auth-expires`
3. **Token automaticamente salvato**: Il sistema salva il Bearer token
4. **Chiamate successive**: Usano Bearer token (più veloce)
5. **Scadenza token**: Il token viene rinnovato automaticamente

Vedi implementazione in `backend/src/routes/fatturaelettronica.ts`:
- `getFatturaElettronicaHeaders()`: Gestisce autenticazione
- `updateTokenCache()`: Aggiorna cache token da headers

---

## 🐛 Troubleshooting

### Errore 400/401 - Authentication Failed
**Cause possibili:**
- API key non valida
- API key scaduta
- Errore di copia/incolla (spazi extra)

**Soluzioni:**
1. Verifica API key nel file `.env`
2. Rigenera API key dalla dashboard
3. Rimuovi spazi o caratteri nascosti
4. Controlla che non ci siano virgolette extra

### Errore 422 - Validation Error
**Cause:**
- Dati fattura non validi
- P.IVA o Codice Fiscale errato
- Formato dati non conforme

**Soluzioni:**
1. Verifica i dati fiscali (P.IVA, CF)
2. Controlla il formato della fattura
3. Verifica campi obbligatori

### Errore 404 - Company Not Found
**Cause:**
- Azienda non ancora creata
- ID azienda errato

**Soluzioni:**
1. Crea l'azienda via POST /aziende
2. Verifica che l'utente abbia configurato i dati fiscali

---

## 📚 Risorse Utili

- **Documentazione API**: https://www.fattura-elettronica-api.it/documentazione2.0/
- **Endpoint Test**: https://fattura-elettronica-api.it/ws2.0/test
- **Endpoint Produzione**: https://fattura-elettronica-api.it/ws2.0/prod

---

## 🚀 Differenze vs Invoicetronic

| Feature | Invoicetronic | Fattura Elettronica API |
|---------|---------------|-------------------------|
| Creazione azienda | Auto-create on first invoice | POST /aziende immediato |
| Gestione anagrafica | Limitata | CRUD completo |
| Aggiornamento dati | Complicato | PUT /aziende |
| Autenticazione | Basic Auth | Basic + Bearer caching |
| Multi-azienda | Non chiaro | Nativo |
| Webhook | No | Sì |
| Formato fatture | JSON | JSON + XML |
| Paginazione | Default 50 | Default 100, max 1000 |

---

## 📊 Stati Fattura

Gli stati possibili delle fatture sono:

- `INVI`: Inviata
- `PREN`: In coda (prenotata)
- `ERRO`: Errore
- `CONS`: Consegnata
- `NONC`: Non consegnata
- `ACCE`: Accettata (PA)
- `RIFI`: Rifiutata (PA)
- `DECO`: Decorsi termini (PA)

---

## 📞 Supporto

Per problemi con Fattura Elettronica API:
- Verifica la documentazione: https://www.fattura-elettronica-api.it/documentazione2.0/

Per problemi con TaxFlow:
- Verifica i log del backend
- Controlla la configurazione nel `.env`
- Verifica che il JWT token sia valido
