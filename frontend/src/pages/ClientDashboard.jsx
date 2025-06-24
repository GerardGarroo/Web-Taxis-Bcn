
import React from 'react';
import { useAuth } from '../context/AuthContext.jsx'; // Importa el hook useAuth para acceder al usuario y la función de logout
import { signOut } from 'firebase/auth'; // Importa signOut de Firebase Auth
import MapComponent from '../components/Maps/MapComponent.jsx'; // Importa el componente del mapa

/**
 * ClientDashboard Component
 *
 * Esta es la página principal para los usuarios con rol 'client'.
 * Muestra un mensaje de bienvenida, el ID del usuario, y el MapComponent.
 * Incluye un botón para cerrar la sesión.
 */
const ClientDashboard = () => {
  const { currentUser, auth, userId } = useAuth(); // Obtenemos el usuario actual, la instancia de auth y el userId

  // Función para manejar el cierre de sesión
  const handleLogout = async () => {
    try {
      await signOut(auth); // Llama a la función signOut de Firebase Auth
      console.log("Sesión cerrada exitosamente.");
    } catch (error) {
      console.error("Error al cerrar sesión:", error);
    }
  };

  return (
    <div className="client-dashboard-container">
      <div className="dashboard-header">
        <h1 className="dashboard-title">Panel de Cliente</h1>
        {currentUser && (
          <p className="dashboard-welcome-message">
            ¡Bienvenido, {currentUser.email}! <br/> Tu ID de Usuario: <span className="user-id">{userId}</span>
          </p>
        )}
        <button onClick={handleLogout} className="logout-button">
          Cerrar Sesión
        </button>
      </div>

      <div className="map-section">
        {/* Aquí se renderizará el componente del mapa */}
        <MapComponent />
      </div>

      {/* Aquí irían otros elementos de UI para la solicitud de viaje, etc. */}
      <div className="request-section">
        <h2 className="section-title">Solicitar Viaje</h2>
        {/* Formulario de solicitud de viaje (lugares de recogida/destino, etc.) */}
        <p>Aquí irá el formulario para solicitar tu taxi.</p>
        {/* Más elementos aquí... */}
      </div>
    </div>
  );
};

export default ClientDashboard;
