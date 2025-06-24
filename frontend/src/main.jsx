import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css'; // Asegúrate de que este sea el archivo CSS principal de tu proyecto Vite
import App from './App.jsx'; // <--- CAMBIO AQUÍ: Ahora importa App.jsx
import { AuthProvider } from './context/AuthContext.jsx'; // <--- CAMBIO AQUÍ: Ahora importa AuthContext.jsx

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
