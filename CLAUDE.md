# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

TaxFlow is a web application for managing and consulting on Italian "regime forfettario" (flat-rate tax regime) with AI integration. The application has two user roles:
- **Business (Cliente)**: End users managing their own tax and invoicing
- **Admin (Consulente)**: Tax consultants managing multiple clients

## Architecture

### Monorepo Structure
- **Root**: Workspace root with backend API (Vercel serverless functions)
- **frontend/**: React SPA with Vite
- **api/**: Vercel serverless functions (Node.js + TypeScript)
- **scripts/**: Utility scripts for user management
- **shared/**: (Currently empty, intended for shared types)

### Backend: Vercel Serverless Functions

The backend uses **Vercel Serverless Functions** (NOT Express). Each file in the `api/` directory is automatically deployed as a serverless endpoint.

**API Structure:**
- `api/auth/login.ts` → `/api/auth/login`
- `api/auth/register.ts` → `/api/auth/register`
- `api/user/me.ts` → `/api/user/me`
- `api/user/update.ts` → `/api/user/update`

**Important Patterns:**
1. Each API file exports `POST`, `GET`, `OPTIONS`, etc. functions matching HTTP methods
2. Uses native Web `Request`/`Response` objects (NOT Express req/res)
3. Database connection is established per-request using `mongoose.connect()`
4. Mongoose models are defined inline with this pattern:
   ```typescript
   const User = (mongoose.models.User || mongoose.model('User', UserSchema)) as mongoose.Model<IUser>
   ```
5. JWT authentication using `jsonwebtoken` library
6. CORS headers are manually added to each response

**Database:**
- MongoDB with Mongoose ODM
- Connection reuse across serverless invocations via `mongoose.connections[0].readyState`
- User schema includes: email, password (bcrypt hashed), name, role, timestamps

### Frontend: React + TypeScript + Vite

**Tech Stack:**
- React 19 with TypeScript
- Vite for build and dev server
- Tailwind CSS for styling
- React Context API for state management (AuthContext)
- Lucide React for icons
- NO React Router (custom page state management)

**Frontend Structure:**
```
frontend/src/
├── components/
│   ├── LandingPage.tsx          # Public landing page
│   ├── LoginRegister.tsx        # Auth pages
│   ├── Dashboard.tsx            # Main dashboard wrapper
│   ├── dashboard/
│   │   ├── DashboardLayout.tsx  # Shared layout with sidebar/header
│   │   ├── AdminDashboard.tsx   # Admin role dashboard
│   │   ├── BusinessDashboard.tsx # Business role dashboard
│   │   ├── pages/
│   │   │   ├── admin/           # Admin-specific pages (12 pages)
│   │   │   ├── business/        # Business-specific pages (10 pages)
│   │   │   └── shared/          # Shared components
│   │   └── shared/              # Shared dashboard components
│   └── common/                  # Common UI components
├── context/
│   └── AuthContext.tsx          # Global auth state
├── services/
│   └── api.ts                   # API client
├── types/
│   └── dashboard.ts             # TypeScript types
└── utils/
    └── invoiceUtils.ts          # Invoice utilities
```

**Navigation Pattern:**
- No React Router - uses internal state management
- Dashboard components switch between pages using `activeSection` state
- Two separate dashboard implementations (Admin/Business) with different sidebar menus
- `DashboardLayout` is a shared layout component used by both dashboards

**Key Components:**
- **AuthContext**: Manages user authentication, stores JWT token and user data in localStorage
- **DashboardLayout**: Provides sidebar navigation, header with notifications, and user profile
- **Admin pages**: GestioneClienti, RichiestePiva, Consulenze, DocumentiClienti, BusinessPlans, AnalisiAI, Fatturazione, ReportsAnalytics, Supporto, FeedbackClienti, Impostazioni
- **Business pages**: DashboardOverview, Fatturazione, AnalisiAI, AperturaPiva, Documenti, Consulenza, BusinessPlan, SimulazioneImposte, FeedbackConsulente, Impostazioni

## Development Commands

### Installation
```bash
npm install              # Install root dependencies
cd frontend && npm install  # Install frontend dependencies
```

### Development
```bash
npm run dev              # Run both backend and frontend concurrently
npm run backend          # Run Vercel dev server on port 3000
npm run frontend         # Run Vite dev server (default port 5173)
```

### Build
```bash
npm run build            # Build frontend only (cd frontend && npm run build)
```

### Linting
```bash
cd frontend && npm run lint  # Run ESLint on frontend
```

### User Management Scripts
```bash
npm run add-user <email> <password> [name]    # Add admin user to MongoDB
npm run check-user <email>                     # Check if user exists
```

**Example:**
```bash
npm run add-user admin@taxflow.com Password123 "Admin User"
```

## Environment Variables

**Root `.env` (Backend/Serverless):**
- `MONGODB_URI` - MongoDB connection string (defaults to hardcoded Atlas URI)
- `JWT_SECRET` - JWT secret key (defaults to `taxflow_jwt_secret_key_2024`)

**Frontend `.env.local`:**
- `VITE_API_URL` - API base URL (defaults to `/api` in production, `http://localhost:5000/api` in development)

## Important Implementation Notes

### API Development
1. When creating new API endpoints, create a new file in `api/` directory matching the URL structure
2. Export named functions for HTTP methods: `POST`, `GET`, `PUT`, `DELETE`, `OPTIONS`
3. Always include CORS headers in responses
4. Use `connectDB()` helper function to ensure MongoDB connection
5. Return responses using `new Response(JSON.stringify(data), { status, headers })`
6. Handle OPTIONS requests for CORS preflight

### Frontend Development
1. API calls should use `VITE_API_URL` environment variable for base URL
2. Authentication token is stored in `localStorage` with key `token` (AuthContext) or `taxflow_token` (ApiService)
3. User data is stored in `localStorage` with key `user` (AuthContext) or `taxflow_user` (ApiService)
4. Both storage mechanisms exist - AuthContext is the active one used by components
5. When adding new dashboard pages, create in appropriate role directory (`admin/` or `business/`)
6. Update corresponding dashboard component's sidebar items and section rendering

### Styling
- Uses Tailwind CSS with custom theme
- Primary color: Blue (`primary-*` classes map to `#3b82f6`)
- Accent color: Green (`#22c55e`)
- Responsive design with mobile-first approach

### Authentication Flow
1. User logs in via `AuthContext.login()` → calls `/api/auth/login`
2. JWT token and user object stored in localStorage
3. Token included in Authorization header for protected endpoints
4. User context consumed via `useAuth()` hook throughout app
5. Logout clears localStorage and resets AuthContext state

## Deployment

The application is configured for **Vercel deployment**:
- Frontend builds to `frontend/dist`
- API endpoints automatically deployed as serverless functions
- `vercel.json` at root configures build and routing
- Frontend has its own `vercel.json` for SPA routing (all routes → index.html)

## Testing

Currently no test suite is configured. Consider adding:
- Vitest for frontend unit tests
- React Testing Library for component tests
- API integration tests

## Known Patterns

### MongoDB Model Pattern (Serverless)
Always use this pattern to avoid model re-compilation errors:
```typescript
const Model = (mongoose.models.ModelName || mongoose.model('ModelName', schema)) as mongoose.Model<IModel>
```

### Rate Limiting
Login endpoint implements in-memory rate limiting (5 attempts per 15 minutes per email). Note: This is per-instance in serverless environment.

### Password Handling
- Minimum 6 characters, maximum 128 characters
- Bcrypt with 10 salt rounds
- Password comparison via Mongoose instance method `comparePassword()`