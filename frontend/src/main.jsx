
import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Asegúrate de que este sea el archivo CSS principal de tu proyecto Vite
import App from './App';
import { AuthProvider } from './context/AuthContext';

// Crea la raíz de la aplicación para React 18+
const root = ReactDOM.createRoot(document.getElementById('root'));

// Renderiza la aplicación
root.render(
  <React.StrictMode>
    {/* Envuelve toda la aplicación con AuthProvider para que el contexto de autenticación esté disponible */}
    <AuthProvider>
      <App />
    </AuthProvider>
  </React.StrictMode>
);