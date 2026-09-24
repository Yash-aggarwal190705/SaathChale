import React from 'react'
import ReactDOM from 'react-dom/client'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App'
import { AuthProvider } from './context/AuthContext'
import './index.css'

// PWA service worker is now handled by vite-plugin-pwa (virtual:pwa-register).
// Manual /sw.js registration removed in Phase 0.

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Main app shell — renders the existing prototype */}
          <Route path="/" element={<App />} />

          {/* Phase 1+: /onboarding/* routes will render onboarding sub-flows */}
          <Route path="/onboarding/*" element={<App />} />

          {/* Phase 6+: /share/:token — public trip-share view (no auth required) */}
          <Route path="/share/:token" element={<App />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  </React.StrictMode>,
)
