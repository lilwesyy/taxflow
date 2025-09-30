import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AuthProvider } from './context/AuthContext'
import { ToastProvider } from './context/ToastContext'
import ToastContainer from './components/common/ToastContainer'

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AuthProvider>
      <ToastProvider>
        <App />
        <ToastContainer />
      </ToastProvider>
    </AuthProvider>
  </StrictMode>,
)
