# TaxFlow - Forfettari

Web application per la gestione e consulenza fiscale per regime forfettario, con integrazione AI.

## 🚀 Features

- **Analisi Aziendale** - Dati analizzati da AI
- **Pianificazione Ristrutturazione** - Ottimizzazione aziendale
- **Chat AI** - Assistente con pre-risposte consigliate
- **Apertura P.IVA Forfettaria** - Consulenza e inquadramento
- **Gestione Contabilità** - Inserimento fatture e calcoli
- **Business Plan Maker** - Creazione piani con AI

## 🎨 Design

- **Colore Principale**: Blu (#3b82f6)
- **Colore Accento**: Verde (#22c55e)

## 🛠️ Tech Stack

### Frontend
- React 18 + TypeScript
- Vite (build tool)
- Tailwind CSS
- React Router

### Backend
- Node.js + Express
- TypeScript
- MongoDB + Mongoose
- JWT Authentication

### AI Integration
- OpenAI API

## 📁 Struttura Progetto

```
taxflow/
├── frontend/          # React application
├── backend/           # Node.js API
├── shared/            # Shared types
└── README.md
```

## 🏃‍♂️ Quick Start

### Installazione
```bash
npm run install:all
```

### Avvio dalla root
```bash
# Backend (porta 3000)
npm run backend

# Frontend (porta 5173)
npm run frontend

# Entrambi insieme
npm start
```

### Setup Environment
```bash
cd backend
cp .env.example .env
# Configurare le variabili d'ambiente
```

### Comandi disponibili
- `npm run backend` - Avvia il server API (Vercel dev)
- `npm run frontend` - Avvia React dev server
- `npm start` - Avvia backend e frontend insieme
- `npm run build` - Build di produzione
- `npm run add-user` - Crea nuovo utente admin
- `npm run check-user` - Verifica esistenza utente

## 🔧 Environment Variables

Copiare `.env.example` in `.env` e configurare:

- `MONGODB_URI` - MongoDB connection string
- `JWT_SECRET` - JWT secret key
- `OPENAI_API_KEY` - OpenAI API key