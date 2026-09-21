import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { AuthProvider } from './contexts/AuthContext';
import { PlatformProvider } from './core/providers/PlatformProvider';
import { AtlasAuthProvider } from './core/providers/AuthProvider';

ReactDOM.createRoot(document.getElementById('root') as HTMLElement).render(
  <React.StrictMode>
    <AuthProvider>
      <AtlasAuthProvider>
        <PlatformProvider>
          <App />
        </PlatformProvider>
      </AtlasAuthProvider>
    </AuthProvider>
  </React.StrictMode>,
);