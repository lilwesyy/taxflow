import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  assetsInclude: ['**/*.json'],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          // Vendor chunks for libraries
          if (id.includes('node_modules')) {
            if (id.includes('react') || id.includes('react-dom')) {
              return 'react-vendor'
            }
            if (id.includes('lucide-react')) {
              return 'icons-vendor'
            }
            if (id.includes('@stripe')) {
              return 'stripe-vendor'
            }
            if (id.includes('xlsx')) {
              return 'xlsx-vendor'
            }
            // Other node_modules go to vendor chunk
            return 'vendor'
          }

          // Split admin dashboard pages
          if (id.includes('/pages/admin/')) {
            return 'admin-pages'
          }

          // Split business dashboard pages
          if (id.includes('/pages/business/')) {
            return 'business-pages'
          }

          // Split shared dashboard components
          if (id.includes('/dashboard/shared/')) {
            return 'dashboard-shared'
          }
        }
      }
    },
    chunkSizeWarningLimit: 600
  }
})
