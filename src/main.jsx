import React, { StrictMode, Component } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.jsx'

// Auto-reload on Vite chunk update error
window.addEventListener('vite:preloadError', () => {
  window.location.reload();
});

// Error Boundary to prevent blank screen
class ErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('App Crash caught by ErrorBoundary:', error, errorInfo);
  }

  handleClearCacheAndReload = async () => {
    try {
      if ('caches' in window) {
        const keys = await caches.keys();
        await Promise.all(keys.map(k => caches.delete(k)));
      }
      if ('serviceWorker' in navigator) {
        const regs = await navigator.serviceWorker.getRegistrations();
        await Promise.all(regs.map(r => r.unregister()));
      }
    } catch (e) {
      console.error('Error clearing caches:', e);
    }
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          backgroundColor: '#FAF7F2',
          color: '#2B1E16',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '24px',
          fontFamily: 'Inter, sans-serif',
          textAlign: 'center'
        }}>
          <div style={{
            maxWidth: '400px',
            backgroundColor: '#FFFFFF',
            padding: '32px 24px',
            borderRadius: '24px',
            border: '1px solid #EAE2D5',
            boxShadow: '0 4px 20px rgba(43,30,22,0.08)'
          }}>
            <h2 style={{ fontFamily: 'Playfair Display, serif', fontSize: '22px', fontWeight: 'bold', margin: '0 0 8px 0', color: '#2B1E16' }}>
              BISCHEESE
            </h2>
            <p style={{ fontSize: '13px', color: '#7D6B5D', margin: '0 0 20px 0' }}>
              Terdapat pembaruan sistem. Silakan muat ulang halaman untuk memperbarui ke versi terbaru.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
              <button
                onClick={() => window.location.reload()}
                style={{
                  padding: '12px 20px',
                  borderRadius: '12px',
                  backgroundColor: '#B47640',
                  color: '#FFFFFF',
                  fontWeight: 'bold',
                  fontSize: '14px',
                  border: 'none',
                  cursor: 'pointer'
                }}
              >
                Muat Ulang Halaman
              </button>
              <button
                onClick={this.handleClearCacheAndReload}
                style={{
                  padding: '10px 16px',
                  borderRadius: '12px',
                  backgroundColor: '#F5EFE6',
                  color: '#2B1E16',
                  fontWeight: '600',
                  fontSize: '12px',
                  border: '1px solid #EAE2D5',
                  cursor: 'pointer'
                }}
              >
                Bersihkan Cache & Refresh
              </button>
            </div>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

// Register Service Worker for PWA (Android / Mobile install)
if ('serviceWorker' in navigator && import.meta.env.PROD) {
  window.addEventListener('load', () => {
    navigator.serviceWorker.register('/sw.js').then((reg) => {
      console.log('Bischeese PWA Service Worker registered:', reg.scope);
      // Immediately check for updates
      reg.update();
    }).catch((err) => {
      console.log('PWA Service Worker registration failed:', err);
    });
  });
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

