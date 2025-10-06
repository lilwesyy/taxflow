# TaxFlow - Analisi e Piano di Miglioramento

> Documento di analisi tecnica e roadmap per ottimizzazioni del progetto TaxFlow

---

## 📋 Indice

1. [Architettura Attuale](#architettura-attuale)
2. [Criticità Identificate](#criticità-identificate)
3. [Miglioramenti Prioritari](#miglioramenti-prioritari)
4. [Roadmap Implementazione](#roadmap-implementazione)
5. [Quick Wins](#quick-wins)

---

## 🏗️ Architettura Attuale

### Punti di Forza

✅ **Struttura Monorepo**
- Frontend React + Vite separato e ben organizzato
- Backend Express deployato su Railway
- Separazione chiara delle responsabilità

✅ **Stack Tecnologico Moderno**
- React 19 + TypeScript
- Tailwind CSS per styling
- MongoDB + Mongoose
- Vercel (frontend) + Railway (backend)

✅ **Features Implementate**
- Sistema di autenticazione completo (JWT)
- 2FA con Speakeasy
- Integrazione pagamenti Stripe
- Upload documenti con Multer
- Job schedulati (pulizia sessioni)
- Chat consulenza admin-cliente
- AI Assistant integration (OpenAI)

✅ **Sicurezza Base**
- Password hashing con bcrypt
- JWT authentication
- Rate limiting login (in-memory)
- CORS configurato

---

## ⚠️ Criticità Identificate

### 1. **Performance Frontend**

**Problema:** Bundle JavaScript troppo grande
- Bundle minificato: **1.012 MB** (204 KB gzipped)
- Nessun code-splitting implementato
- Warning Vite: "Some chunks are larger than 600 kB"

**Impatto:**
- Tempo di caricamento iniziale elevato
- User experience degradata su connessioni lente
- Scarso punteggio Lighthouse

---

### 5. **Infrastructure**

**a) File uploads locali**

Location: `backend/uploads/`

```typescript
app.use('/uploads', express.static(path.join(__dirname, '..', 'uploads')))
```

**Problemi:**
- Non scalabile (filesystem locale)
- File persi ad ogni redeploy Railway
- Nessun backup automatico

**Soluzione necessaria:** S3/Cloudflare R2/Vercel Blob

**b) Logging non strutturato**

```typescript
// Sparse console.log
console.log('✅ Server running on port ${PORT}')
console.error('Failed to connect to MongoDB:', error)
```

**Impatto:** Debug difficile in produzione, no monitoring

---

### 6. **Database**

**a) Connection management**

```typescript
// Mongoose connection check primitivo
mongoose.connections[0].readyState
```

**Migliorabile con:** Connection pooling configurato, retry logic

**b) Mancanza indici**
- Query potenzialmente lente su collezioni grandi
- Nessun indice esplicito documentato

---

### 7. **Testing**

**Problema:** **Zero test coverage**

```json
// package.json - nessun test script
"scripts": {
  "dev": "vite",
  "build": "tsc -b && vite build",
  "lint": "eslint ."
  // ❌ Mancano test
}
```

**Impatto:**
- Refactoring rischioso
- Bug scoperti solo in produzione
- Difficoltà onboarding nuovi developer

---

## 🎯 Miglioramenti Prioritari

### 1. Frontend Performance ⚡ (Alta Priorità)

#### Obiettivo: Ridurre bundle size del 40%

**Azioni:**

**a) Implementare Code-Splitting**

```tsx
// frontend/src/components/Dashboard.tsx
import { lazy, Suspense } from 'react'

const AdminDashboard = lazy(() => import('./dashboard/AdminDashboard'))
const BusinessDashboard = lazy(() => import('./dashboard/BusinessDashboard'))

function Dashboard() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      {user.role === 'admin' ? <AdminDashboard /> : <BusinessDashboard />}
    </Suspense>
  )
}
```

**b) Ottimizzare import Lucide Icons**

```tsx
// ❌ Prima (importa tutta la libreria)
import { FileText, Users, Download } from 'lucide-react'

// ✅ Dopo (tree-shaking ottimale)
import FileText from 'lucide-react/dist/esm/icons/file-text'
import Users from 'lucide-react/dist/esm/icons/users'
import Download from 'lucide-react/dist/esm/icons/download'
```

**c) Configurare Vite manual chunks**

```typescript
// vite.config.ts
export default defineConfig({
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons': ['lucide-react'],
          'stripe': ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    }
  }
})
```

**Risultato atteso:**
- Bundle principale: ~600 KB (da 1 MB)
- First Contentful Paint: -1.5s
- Lighthouse score: +15 punti

---

### 2. Sicurezza 🔒 (Alta Priorità)

#### a) Rate Limiting Distribuito

**Implementazione con Upstash Redis:**

```typescript
// backend/src/middleware/rateLimiter.ts
import { Redis } from '@upstash/redis'
import { Ratelimit } from '@upstash/ratelimit'

const redis = Redis.fromEnv()

export const loginRateLimiter = new Ratelimit({
  redis,
  limiter: Ratelimit.slidingWindow(5, '15 m'),
  analytics: true,
  prefix: 'taxflow:ratelimit:login'
})

// Uso in routes
app.post('/api/auth/login', async (req, res) => {
  const { success } = await loginRateLimiter.limit(req.body.email)

  if (!success) {
    return res.status(429).json({
      error: 'Troppi tentativi. Riprova tra 15 minuti.'
    })
  }

  // ... login logic
})
```

**Setup:**
1. Creare account Upstash (free tier: 10k requests/day)
2. Aggiungere env vars:
   ```env
   UPSTASH_REDIS_REST_URL=https://...
   UPSTASH_REDIS_REST_TOKEN=...
   ```
3. Installare: `npm install @upstash/redis @upstash/ratelimit`

---

#### b) Validazione Input con Zod

```typescript
// backend/src/validators/user.ts
import { z } from 'zod'

export const loginSchema = z.object({
  email: z.string().email('Email non valida'),
  password: z.string().min(6, 'Password minimo 6 caratteri')
})

export const pivaRequestSchema = z.object({
  nome: z.string().min(1),
  cognome: z.string().min(1),
  codiceFiscale: z.string().regex(/^[A-Z]{6}\d{2}[A-Z]\d{2}[A-Z]\d{3}[A-Z]$/),
  partitaIva: z.string().regex(/^\d{11}$/).optional(),
  // ... altri campi
})

// Uso in route
app.post('/api/auth/login', async (req, res) => {
  try {
    const validated = loginSchema.parse(req.body)
    // ... procedi con validated data
  } catch (error) {
    if (error instanceof z.ZodError) {
      return res.status(400).json({
        error: 'Dati non validi',
        details: error.errors
      })
    }
  }
})
```

---

#### c) Generare JWT Secret Robusto

```bash
# Genera secret sicuro
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"

# Output esempio:
# a1b2c3d4e5f6...  (128 caratteri)
```

**Aggiornare `.env`:**
```env
JWT_SECRET=<secret_generato_sopra>
```

**Aggiungere a Railway:**
Settings → Variables → Add `JWT_SECRET`

---

### 3. Code Quality 🧹 (Media Priorità)

#### a) Refactor Componente Documenti Condiviso

**Struttura proposta:**

```
frontend/src/components/dashboard/pages/shared/
├── DocumentManager/
│   ├── DocumentManager.tsx          # Componente principale
│   ├── DocumentGrid.tsx             # Griglia documenti
│   ├── DocumentFilters.tsx          # Filtri e ricerca
│   ├── DocumentUploadModal.tsx      # Modal upload
│   ├── DocumentDetailModal.tsx      # Modal dettagli
│   └── types.ts                     # Types condivisi
```

**Esempio implementazione:**

```tsx
// DocumentManager.tsx
interface DocumentManagerProps {
  userRole: 'admin' | 'business'
  clientId?: string  // Solo per admin
}

export function DocumentManager({ userRole, clientId }: DocumentManagerProps) {
  // Logica condivisa
  const [documents, setDocuments] = useState([])
  const [filters, setFilters] = useState({})

  // Hook personalizzati in base al ruolo
  const { loadDocuments } = useDocuments(userRole, clientId)

  return (
    <div>
      <DocumentFilters filters={filters} onChange={setFilters} />
      <DocumentGrid
        documents={filteredDocuments}
        onView={handleView}
        onDelete={handleDelete}
        userRole={userRole}
      />
    </div>
  )
}
```

**Utilizzo:**

```tsx
// Admin
<DocumentManager userRole="admin" clientId={selectedClient.id} />

// Business
<DocumentManager userRole="business" />
```

**Benefici:**
- Manutenzione centralizzata
- Bug fix propagati automaticamente
- -800 righe di codice duplicato

---

#### b) Error Boundaries

```tsx
// frontend/src/components/common/ErrorBoundary.tsx
import { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error?: Error
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Error caught by boundary:', error, errorInfo)
    // TODO: Inviare a Sentry
  }

  render() {
    if (this.state.hasError) {
      return this.props.fallback || (
        <div className="flex flex-col items-center justify-center min-h-screen p-4">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Qualcosa è andato storto
          </h1>
          <p className="text-gray-600 mb-4">
            Si è verificato un errore imprevisto.
          </p>
          <button
            onClick={() => window.location.reload()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg"
          >
            Ricarica la pagina
          </button>
        </div>
      )
    }

    return this.props.children
  }
}

// Uso
// App.tsx
<ErrorBoundary>
  <Dashboard />
</ErrorBoundary>
```

---

#### c) Standardizzare Error Handling Backend

```typescript
// backend/src/middleware/errorHandler.ts
import { Request, Response, NextFunction } from 'express'

export class AppError extends Error {
  constructor(
    public statusCode: number,
    public message: string,
    public isOperational = true
  ) {
    super(message)
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorHandler = (
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) => {
  if (err instanceof AppError) {
    return res.status(err.statusCode).json({
      status: 'error',
      message: err.message
    })
  }

  // Errore non gestito
  console.error('Unhandled error:', err)

  return res.status(500).json({
    status: 'error',
    message: 'Errore interno del server'
  })
}

// Uso in routes
app.post('/api/auth/login', async (req, res, next) => {
  try {
    const user = await User.findOne({ email: req.body.email })
    if (!user) {
      throw new AppError(401, 'Credenziali non valide')
    }
    // ... resto logica
  } catch (error) {
    next(error)  // Passa a errorHandler
  }
})

// Registra middleware
app.use(errorHandler)
```

---

### 4. Infrastructure 🚀 (Media Priorità)

#### a) Migrare Upload a Vercel Blob

**Vantaggi:**
- Scalabile automaticamente
- CDN integrato (delivery veloce)
- Backup automatico
- Free tier: 1 GB

**Implementazione:**

```bash
npm install @vercel/blob
```

```typescript
// backend/src/routes/documents.ts
import { put } from '@vercel/blob'

router.post('/upload', auth, upload.single('file'), async (req, res) => {
  try {
    const file = req.file
    if (!file) throw new AppError(400, 'Nessun file caricato')

    // Upload a Vercel Blob
    const blob = await put(
      `documents/${req.user.id}/${file.originalname}`,
      file.buffer,
      {
        access: 'public',
        token: process.env.BLOB_READ_WRITE_TOKEN
      }
    )

    // Salva documento nel DB
    const document = new Document({
      userId: req.user.id,
      nome: file.originalname,
      url: blob.url,  // URL pubblico CDN
      dimensione: file.size,
      formato: file.mimetype
    })

    await document.save()

    res.json({ success: true, document })
  } catch (error) {
    next(error)
  }
})
```

**Setup:**
1. Vercel Dashboard → Storage → Create Blob Store
2. Copia `BLOB_READ_WRITE_TOKEN`
3. Aggiungi a Railway env vars

---

#### b) Logging Strutturato con Pino

```bash
npm install pino pino-pretty
```

```typescript
// backend/src/config/logger.ts
import pino from 'pino'

export const logger = pino({
  level: process.env.LOG_LEVEL || 'info',
  transport: process.env.NODE_ENV === 'development' ? {
    target: 'pino-pretty',
    options: {
      colorize: true,
      translateTime: 'HH:MM:ss',
      ignore: 'pid,hostname'
    }
  } : undefined
})

// Uso
import { logger } from './config/logger'

logger.info({ userId: user.id }, 'User logged in')
logger.error({ err, email }, 'Login failed')
logger.warn({ ip: req.ip }, 'Rate limit exceeded')
```

**Output esempio:**
```
[14:32:15] INFO (12345): User logged in
    userId: "abc123"
[14:32:20] ERROR (12345): Login failed
    err: { message: "Invalid password", ... }
    email: "user@example.com"
```

---

### 5. Testing 🧪 (Bassa Priorità)

#### Setup Test Suite

**a) Frontend - Vitest + React Testing Library**

```bash
cd frontend
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

```typescript
// frontend/vitest.config.ts
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: './src/test/setup.ts'
  }
})
```

```typescript
// frontend/src/test/setup.ts
import '@testing-library/jest-dom'
```

**Esempio test:**

```tsx
// frontend/src/components/LoginRegister.test.tsx
import { render, screen, fireEvent } from '@testing-library/react'
import { describe, it, expect } from 'vitest'
import { LoginRegister } from './LoginRegister'

describe('LoginRegister', () => {
  it('mostra errore con email non valida', async () => {
    render(<LoginRegister initialMode="login" onSuccess={() => {}} />)

    const emailInput = screen.getByPlaceholderText(/email/i)
    const submitBtn = screen.getByRole('button', { name: /accedi/i })

    fireEvent.change(emailInput, { target: { value: 'invalid-email' } })
    fireEvent.click(submitBtn)

    expect(await screen.findByText(/email non valida/i)).toBeInTheDocument()
  })
})
```

**b) Backend - Jest + Supertest**

```bash
cd backend
npm install -D jest @types/jest ts-jest supertest @types/supertest
```

```typescript
// backend/src/routes/auth.test.ts
import request from 'supertest'
import app from '../index'
import { connectDB } from '../config/database'

beforeAll(async () => {
  await connectDB()
})

describe('POST /api/auth/login', () => {
  it('autentica utente con credenziali valide', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'password123'
      })

    expect(response.status).toBe(200)
    expect(response.body).toHaveProperty('token')
    expect(response.body.user).toHaveProperty('email', 'test@example.com')
  })

  it('rifiuta credenziali non valide', async () => {
    const response = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'test@example.com',
        password: 'wrong-password'
      })

    expect(response.status).toBe(401)
    expect(response.body).toHaveProperty('error')
  })
})
```

**Target coverage:** 50% entro 1 mese

---

### 6. DevOps 🔧 (Bassa Priorità)

#### a) GitHub Actions CI/CD

```yaml
# .github/workflows/ci.yml
name: CI/CD

on:
  push:
    branches: [master, develop]
  pull_request:
    branches: [master]

jobs:
  frontend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./frontend

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: frontend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Lint
        run: npm run lint

      - name: Type check
        run: npm run build

      - name: Run tests
        run: npm run test

      - name: Build
        run: npm run build

  backend:
    runs-on: ubuntu-latest
    defaults:
      run:
        working-directory: ./backend

    steps:
      - uses: actions/checkout@v3

      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '20'
          cache: 'npm'
          cache-dependency-path: backend/package-lock.json

      - name: Install dependencies
        run: npm ci

      - name: Type check
        run: npm run build

      - name: Run tests
        run: npm run test
        env:
          MONGODB_URI: ${{ secrets.MONGODB_TEST_URI }}
```

---

#### b) Sentry Error Tracking

```bash
npm install @sentry/react @sentry/node
```

**Frontend:**

```tsx
// frontend/src/main.tsx
import * as Sentry from '@sentry/react'

Sentry.init({
  dsn: import.meta.env.VITE_SENTRY_DSN,
  environment: import.meta.env.MODE,
  tracesSampleRate: 0.1,
  integrations: [
    new Sentry.BrowserTracing(),
    new Sentry.Replay()
  ]
})

// Wrap App
<Sentry.ErrorBoundary fallback={<ErrorFallback />}>
  <App />
</Sentry.ErrorBoundary>
```

**Backend:**

```typescript
// backend/src/index.ts
import * as Sentry from '@sentry/node'

Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.NODE_ENV,
  tracesSampleRate: 0.1
})

// Error handler
app.use(Sentry.Handlers.errorHandler())
```

---

## 📅 Roadmap Implementazione

### Fase 1: Performance & Quick Wins (1-2 settimane)

**Obiettivo:** Miglioramenti immediati senza breaking changes

- [ ] Rimuovere duplicazione localStorage (`token` vs `taxflow_token`)
- [ ] Eliminare delay artificiale 1000ms in AuthContext
- [ ] Implementare code-splitting (lazy load dashboards)
- [ ] Ottimizzare import Lucide icons
- [ ] Configurare Vite manual chunks
- [ ] Aggiungere Error Boundary React
- [ ] Creare `.env.example` documentato

**Deliverable:** Bundle size -40%, FCP -1.5s

---

### Fase 2: Sicurezza & Refactoring (2-3 settimane)

**Obiettivo:** Fondamenta solide per scalabilità

- [ ] Implementare rate limiting con Upstash Redis
- [ ] Validazione input con Zod
- [ ] Generare e deployare JWT secret robusto
- [ ] Refactor componente DocumentManager condiviso
- [ ] Standardizzare error handling backend (AppError)
- [ ] Migrare upload a Vercel Blob
- [ ] Implementare logging strutturato (Pino)

**Deliverable:** Sicurezza hardened, code duplication -60%

---

### Fase 3: Testing & Monitoring (3-4 settimane)

**Obiettivo:** Qualità garantita e observability

- [ ] Setup Vitest + React Testing Library
- [ ] Scrivere test critici (auth, payments) - target 50% coverage
- [ ] Setup Jest + Supertest backend
- [ ] GitHub Actions CI/CD pipeline
- [ ] Integrazione Sentry error tracking
- [ ] Setup performance monitoring
- [ ] Documentazione API con Swagger/OpenAPI

**Deliverable:** CI/CD funzionante, 50% test coverage, error tracking attivo

---

### Fase 4: Scalabilità & Advanced Features (4-6 settimane)

**Obiettivo:** Preparazione crescita utenza

- [ ] Database indexing strategy
- [ ] Implementare caching (Redis)
- [ ] CDN setup per static assets
- [ ] Ottimizzazione query MongoDB
- [ ] WebSocket per real-time chat (socket.io)
- [ ] API rate limiting granulare per endpoint
- [ ] Implementare retry logic robusto

**Deliverable:** Infrastruttura pronta per 10x utenti

---

## 💡 Quick Wins (Implementabili Subito)

### 1. Rimuovi Delay Artificiale

**File:** `frontend/src/context/AuthContext.tsx`

```diff
  const loadUserData = async () => {
    const savedToken = localStorage.getItem('token')
    const savedUser = localStorage.getItem('user')

    if (savedToken && savedUser) {
      setToken(savedToken)
      setUser(JSON.parse(savedUser))
    }

-   // Delay minimo per mostrare il loading
-   await new Promise(resolve => setTimeout(resolve, 1000))
    setIsLoading(false)
  }
```

**Impatto:** App più reattiva, -1s tempo loading

---

### 2. Consolida localStorage

**File:** `frontend/src/services/api.ts`

```diff
  async login(credentials: LoginRequest): Promise<LoginResponse> {
    // ... fetch logic

    if (data.token) {
      localStorage.setItem('token', data.token)
      localStorage.setItem('user', JSON.stringify(data.user))
-     localStorage.setItem('taxflow_token', data.token)
-     localStorage.setItem('taxflow_user', JSON.stringify(data.user))
    }

    return data
  }
```

```diff
  private getHeaders(includeAuth = false): HeadersInit {
    // ...
    if (includeAuth) {
-     const token = localStorage.getItem('token') || localStorage.getItem('taxflow_token')
+     const token = localStorage.getItem('token')
      if (token) {
        headers.Authorization = `Bearer ${token}`
      }
    }
    return headers
  }
```

**Impatto:** Codice più pulito, meno confusione

---

### 3. Aggiungi `.env.example`

**File:** `backend/.env.example`

```env
# Database
MONGODB_URI=mongodb://localhost:27017/taxflow

# Authentication
JWT_SECRET=<generate_with: node -e "console.log(require('crypto').randomBytes(64).toString('hex'))">

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
STRIPE_PUBLISHABLE_KEY=pk_test_...

# OpenAI
OPENAI_API_KEY=sk-...

# Email (optional)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# Environment
NODE_ENV=development
PORT=3000

# Upstash Redis (optional - for rate limiting)
UPSTASH_REDIS_REST_URL=https://...
UPSTASH_REDIS_REST_TOKEN=...

# Vercel Blob (optional - for file storage)
BLOB_READ_WRITE_TOKEN=...

# Sentry (optional - for error tracking)
SENTRY_DSN=https://...
```

**File:** `frontend/.env.example`

```env
# API Configuration
VITE_API_URL=http://localhost:3000/api

# Stripe (Frontend)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_...

# Sentry (optional)
VITE_SENTRY_DSN=https://...
```

**Impatto:** Onboarding dev più facile

---

### 4. Vite Config Ottimizzato

**File:** `frontend/vite.config.ts`

```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          'react-vendor': ['react', 'react-dom'],
          'icons-vendor': ['lucide-react'],
          'stripe-vendor': ['@stripe/stripe-js', '@stripe/react-stripe-js']
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
```

**Impatto:** Bundle meglio organizzato, warning eliminato

---

## 📊 Metriche Target

### Performance

| Metrica | Attuale | Target | Fase |
|---------|---------|--------|------|
| Bundle size | 1012 KB | 600 KB | Fase 1 |
| First Contentful Paint | ~3.5s | <2s | Fase 1 |
| Lighthouse Performance | ~65 | >90 | Fase 2 |
| Time to Interactive | ~5s | <3s | Fase 1 |

### Qualità Codice

| Metrica | Attuale | Target | Fase |
|---------|---------|--------|------|
| Test coverage | 0% | 50% | Fase 3 |
| TypeScript strict | Parziale | 100% | Fase 2 |
| ESLint errors | ~10 | 0 | Fase 2 |
| Code duplication | ~20% | <5% | Fase 2 |

### Sicurezza

| Aspetto | Stato Attuale | Target | Fase |
|---------|--------------|--------|------|
| Rate limiting | In-memory | Distribuito (Redis) | Fase 2 |
| Input validation | Debole | Schema-based (Zod) | Fase 2 |
| Error tracking | Console.log | Sentry | Fase 3 |
| JWT secret | Hardcoded | Randomico 64 bytes | Fase 2 |

---

## 🔗 Risorse Utili

### Documentazione

- [Vite - Code Splitting](https://vitejs.dev/guide/build.html#chunking-strategy)
- [Upstash Redis](https://upstash.com/docs/redis)
- [Vercel Blob Storage](https://vercel.com/docs/storage/vercel-blob)
- [Zod Validation](https://zod.dev/)
- [Sentry React](https://docs.sentry.io/platforms/javascript/guides/react/)
- [Pino Logger](https://getpino.io/)

### Tool & Libraries

- **Performance:** Lighthouse, Webpack Bundle Analyzer
- **Security:** OWASP ZAP, Snyk
- **Testing:** Vitest, Jest, React Testing Library, Supertest
- **Monitoring:** Sentry, LogRocket, Vercel Analytics

---

## 🤝 Contribuire

Per implementare questi miglioramenti:

1. Creare branch feature dal naming: `feat/performance-code-splitting`
2. Implementare seguendo le linee guida
3. Scrivere test (se Fase 3+)
4. Aprire PR con descrizione dettagliata
5. Review + merge

---

## 📝 Note Finali

Questo documento è un **living document**. Aggiornare regolarmente con:
- ✅ Task completati
- 🔄 Modifiche al piano
- 📊 Metriche aggiornate
- 🐛 Nuove criticità scoperte

**Prossimo review:** Fine mese

---

**Versione documento:** 1.0
**Data creazione:** 6 Ottobre 2025
**Ultimo aggiornamento:** 6 Ottobre 2025
