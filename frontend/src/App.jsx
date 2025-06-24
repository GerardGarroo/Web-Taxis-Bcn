
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import LoginForm from './components/Auth/LoginForm.jsx';
import RegisterForm from './components/Auth/RegisterForm.jsx';
// Importa el nuevo componente ClientDashboard
import ClientDashboard from './pages/ClientDashboard.jsx';

// Componente DriverDashboard (Placeholder por ahora, se desarrollará más adelante)
const DriverDashboard = () => (
  <div className="driver-dashboard-container">
    <div className="dashboard-header">
      <h1 className="dashboard-title">Panel de Taxista</h1>
      <p className="dashboard-welcome-message">¡Bienvenido, taxista! Aquí podrás ver y aceptar servicios.</p>
      {/* Botón de cerrar sesión para taxistas */}
      <button onClick={() => { /* Lógica de logout */ }} className="logout-button">
        Cerrar Sesión (Taxista)
      </button>
    </div>
    {/* Contenido específico del dashboard del taxista */}
  </div>
);

/**
 * App Component
 *
 * El componente principal de la aplicación. Gestiona la lógica de autenticación
 * y renderiza condicionalmente el formulario de inicio de sesión/registro
 * o el panel de control del usuario (cliente/taxista) una vez autenticado.
 * Utiliza el AuthContext para acceder al estado global de autenticación.
 */
function App() {
  const { currentUser, loading } = useAuth();
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  if (loading) {
    return (
      <div className="loading-screen">
        <p>Cargando autenticación...</p>
      </div>
    );
  }

  if (currentUser) {
    // Renderiza ClientDashboard si es cliente
    if (currentUser.role === 'client') {
      return <ClientDashboard />;
    }
    // Renderiza DriverDashboard si es taxista
    if (currentUser.role === 'driver') {
      return <DriverDashboard />;
    }
    // Fallback por si el rol no está definido o es inesperado
    return <ClientDashboard />; // Por defecto, si el rol no se detecta, se asume cliente
  }

  return (
    <div className="app-container">
      {showRegisterForm ? (
        <RegisterForm
          onSuccess={() => setShowRegisterForm(false)}
          onSwitchToLogin={() => setShowRegisterForm(false)}
        />
      ) : (
        <LoginForm
          onSuccess={() => {}}
          onSwitchToRegister={() => setShowRegisterForm(true)}
        />
      )}
    </div>
  );
}

export default App;
