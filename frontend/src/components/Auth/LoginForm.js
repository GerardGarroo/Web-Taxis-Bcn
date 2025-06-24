
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth'; // Importa la función de inicio de sesión de Firebase Auth
import { useAuth } from '../../context/AuthContext'; // Importa nuestro hook personalizado de autenticación
import MessageBox from '../UI/MessageBox'; // Importa el componente de mensajes

/**
 * LoginForm Component
 *
 * Componente para el formulario de inicio de sesión. Permite a los usuarios
 * ingresar su correo electrónico y contraseña para acceder a la aplicación.
 * Utiliza Firebase Authentication para la lógica de inicio de sesión y muestra
 * mensajes de estado (éxito/error) usando el componente MessageBox.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onSuccess - Callback a ejecutar si el inicio de sesión es exitoso.
 * @param {function} props.onSwitchToRegister - Callback para cambiar al formulario de registro.
 */
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState(''); // Estado para el campo de correo electrónico
  const [password, setPassword] = useState(''); // Estado para el campo de contraseña
  const [error, setError] = useState(null); // Estado para almacenar mensajes de error
  const [message, setMessage] = useState(null); // Estado para almacenar mensajes generales
  const [messageType, setMessageType] = useState('info'); // Estado para el tipo de mensaje (success, error, info)
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar si la operación está cargando

  // Obtenemos la instancia de 'auth' desde nuestro contexto de autenticación
  // que nos permite interactuar con Firebase Authentication.
  const { auth } = useAuth();

  // Función para manejar el envío del formulario de inicio de sesión
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario de recargar la página
    setError(null); // Limpia cualquier error anterior
    setMessage(null); // Limpia cualquier mensaje anterior
    setIsLoading(true); // Activa el estado de carga

    try {
      // Intenta iniciar sesión con el correo electrónico y la contraseña proporcionados
      await signInWithEmailAndPassword(auth, email, password);
      // Si el inicio de sesión es exitoso, muestra un mensaje de éxito
      setMessage('¡Inicio de sesión exitoso!');
      setMessageType('success');
      // Ejecuta el callback onSuccess si se proporciona
      if (onSuccess) {
        // Un pequeño retraso para que el usuario vea el mensaje de éxito antes de redirigir
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
      // Si ocurre un error, captura el código del error de Firebase y muestra un mensaje amigable
      let errorMessage = 'Error al iniciar sesión. Por favor, inténtalo de nuevo.';
      switch (err.code) {
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico es inválido.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'Este usuario ha sido deshabilitado.';
          break;
        case 'auth/user-not-found':
        case 'auth/wrong-password':
          errorMessage = 'Correo electrónico o contraseña incorrectos.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error: ${err.message}`; // Mensaje genérico para otros errores
          console.error("Error de inicio de sesión:", err);
      }
      setError(errorMessage); // Establece el mensaje de error
      setMessageType('error'); // Establece el tipo de mensaje como error
    } finally {
      setIsLoading(false); // Desactiva el estado de carga
    }
  };

  // Función para cerrar los mensajes (éxito/error)
  const handleCloseMessage = () => {
    setError(null);
    setMessage(null);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-500 to-indigo-600 p-4 sm:p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-indigo-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Iniciar Sesión
        </h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Correo Electrónico
            </label>
            <input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@ejemplo.com"
            />
          </div>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Contraseña
            </label>
            <input
              id="password"
              name="password"
              type="password"
              autoComplete="current-password"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm transition duration-150 ease-in-out"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading} // Deshabilita el botón mientras está cargando
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Iniciando Sesión...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister} // Llama al callback para cambiar al registro
              className="font-medium text-indigo-600 hover:text-indigo-500 focus:outline-none focus:underline"
            >
              Regístrate aquí
            </button>
          </p>
        </div>
      </div>

      {/* Muestra el MessageBox si hay un mensaje o error */}
      {(message || error) && (
        <MessageBox
          message={message || error}
          type={messageType}
          onClose={handleCloseMessage}
        />
      )}
    </div>
  );
};

export default LoginForm;
