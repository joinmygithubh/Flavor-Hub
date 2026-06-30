import React from 'react';
import ReactDOM from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import App from './App.jsx';
import { AuthProvider } from './context/AuthContext.jsx';
import { ThemeProvider } from './context/ThemeContext.jsx';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <App />
          {/* Global toast notifications. */}
          <Toaster
            position="top-center"
            toastOptions={{
              style: { borderRadius: '12px', background: '#2B2622', color: '#FFF8F1' },
              success: { iconTheme: { primary: '#1B9C5D', secondary: '#fff' } },
              error: { iconTheme: { primary: '#E2562B', secondary: '#fff' } },
            }}
          />
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  </React.StrictMode>
);
