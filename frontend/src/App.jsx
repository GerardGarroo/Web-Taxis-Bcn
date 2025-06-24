
import React, { useState } from 'react';
import { useAuth } from './context/AuthContext'; // Importa el hook useAuth de nuestro contexto
import LoginForm from './components/Auth/LoginForm'; // Importa el componente LoginForm
import RegisterForm from './components/Auth/RegisterForm'; // Importa el componente RegisterForm

// Componentes de Dashboard (Placeholders por ahora)
// Estos se crearán más adelante cuando avancemos en la funcionalidad
const ClientDashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Panel de Cliente</h2>
      <p className="text-gray-600">¡Bienvenido, cliente! Aquí podrás solicitar tu taxi.</p>
    </div>
  </div>
);

const DriverDashboard = () => (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
    <div className="bg-white p-8 rounded-lg shadow-md text-center">
      <h2 className="text-3xl font-bold text-gray-800 mb-4">Panel de Taxista</h2>
      <p className="text-gray-600">¡Bienvenido, taxista! Aquí podrás ver y aceptar servicios.</p>
    </div>
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
  // Obtenemos el usuario actual y el estado de carga desde nuestro contexto de autenticación
  const { currentUser, loading } = useAuth();
  // Estado para controlar qué formulario de autenticación se muestra
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // Si la autenticación aún está cargando, mostramos un mensaje o spinner
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p className="text-lg font-medium text-gray-700">Cargando autenticación...</p>
      </div>
    );
  }

  // Si el usuario está autenticado, mostramos el dashboard correspondiente a su rol
  if (currentUser) {
    // Si currentUser.role no está definido (por ejemplo, si el documento en Firestore no se encontró),
    // asumimos por defecto que es un cliente.
    if (currentUser.role === 'driver') {
      return <DriverDashboard />;
    }
    return <ClientDashboard />; // Por defecto, si no es taxista o el rol no está definido, es cliente
  }

  // Si no hay usuario autenticado, mostramos los formularios de login/registro
  return (
    <div className="app-container">
      {showRegisterForm ? (
        // Si showRegisterForm es true, mostramos el formulario de registro
        <RegisterForm
          onSuccess={() => setShowRegisterForm(false)} // Si el registro es exitoso, volvemos al login
          onSwitchToLogin={() => setShowRegisterForm(false)} // Permitir cambiar a login
        />
      ) : (
        // Si no, mostramos el formulario de inicio de sesión
        <LoginForm
          onSuccess={() => {}} // El éxito del login es manejado por el onAuthStateChanged en AuthContext
          onSwitchToRegister={() => setShowRegisterForm(true)} // Permitir cambiar a registro
        />
      )}
    </div>
  );
}

export default App;