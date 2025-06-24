
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth'; // Importa la función para crear usuario de Firebase Auth
import { doc, setDoc } from 'firebase/firestore'; // Importa funciones de Firestore para añadir documentos
import { useAuth } from '../../context/AuthContext'; // Importa nuestro hook personalizado de autenticación
import MessageBox from '../UI/MessageBox'; // Importa el componente de mensajes

/**
 * RegisterForm Component
 *
 * Componente para el formulario de registro de usuarios. Permite a los usuarios
 * crear una nueva cuenta con correo electrónico y contraseña, y especificar
 * si se registran como 'cliente' o 'taxista'. Los datos del usuario y su rol
 * se guardan en Firebase Authentication y Cloud Firestore.
 * Muestra mensajes de estado (éxito/error) usando el componente MessageBox.
 *
 * Se ha mejorado la validación del lado del cliente para email y contraseña.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onSuccess - Callback a ejecutar si el registro es exitoso.
 * @param {function} props.onSwitchToLogin - Callback para cambiar al formulario de inicio de sesión.
 */
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState(''); // Estado para el campo de correo electrónico
  const [password, setPassword] = useState(''); // Estado para el campo de contraseña
  const [confirmPassword, setConfirmPassword] = useState(''); // Estado para el campo de confirmar contraseña
  const [role, setRole] = useState('client'); // Estado para el rol del usuario (client o driver)
  const [error, setError] = useState(null); // Estado para almacenar mensajes de error
  const [message, setMessage] = useState(null); // Estado para almacenar mensajes generales
  const [messageType, setMessageType] = useState('info'); // Estado para el tipo de mensaje (success, error, info)
  const [isLoading, setIsLoading] = useState(false); // Estado para controlar si la operación está cargando

  // Obtenemos la instancia de 'auth', 'db' y 'appId' desde nuestro contexto de autenticación
  const { auth, db, appId } = useAuth(); // Asegúrate de que 'appId' se exporte desde useAuth o Firebase context

  // Función para validar el formato del correo electrónico
  const validateEmail = (email) => {
    // Regex simple para email (se puede hacer más complejo si es necesario)
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  // Función para validar la complejidad de la contraseña
  const validatePassword = (password) => {
    if (password.length < 8) { // Mínimo 8 caracteres
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!/[A-Z]/.test(password)) { // Al menos una mayúscula
      return 'La contraseña debe contener al menos una letra mayúscula.';
    }
    if (!/[a-z]/.test(password)) { // Al menos una minúscula
      return 'La contraseña debe contener al menos una letra minúscula.';
    }
    if (!/[0-9]/.test(password)) { // Al menos un número
      return 'La contraseña debe contener al menos un número.';
    }
    if (!/[!@#$%^&*()]/.test(password)) { // Al menos un símbolo
      return 'La contraseña debe contener al menos un símbolo (!@#$%^&*()).';
    }
    return null; // La contraseña es válida
  };


  // Función para manejar el envío del formulario de registro
  const handleSubmit = async (e) => {
    e.preventDefault(); // Previene el comportamiento por defecto del formulario
    setError(null); // Limpia cualquier error anterior
    setMessage(null); // Limpia cualquier mensaje anterior
    setIsLoading(true); // Activa el estado de carga

    // Validaciones del lado del cliente
    if (!validateEmail(email)) {
      setError('Por favor, introduce un correo electrónico válido.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      setError(passwordError);
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    if (password !== confirmPassword) {
      setError('Las contraseñas no coinciden.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      // 1. Crea el usuario en Firebase Authentication
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 2. Guarda información adicional del usuario (como el rol) en Cloud Firestore
      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/users`, user.uid);

      await setDoc(userDocRef, {
        email: user.email,
        role: role, // Guarda el rol seleccionado (client o driver)
        createdAt: new Date(),
        profileImageUrl: '',
        isVerified: role === 'driver' ? false : true, // Los taxistas necesitan verificación inicial
        isOnboarded: false, // Proceso de onboarding inicial
      });

      // Si el registro es exitoso, muestra un mensaje de éxito
      setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
      setMessageType('success');
      // Ejecuta el callback onSuccess o cambia al login después de un breve retraso
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      } else if (onSwitchToLogin) {
        setTimeout(() => onSwitchToLogin(), 1500);
      }

      // Limpiar campos del formulario
      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('client');

    } catch (err) {
      // Si ocurre un error, captura el código del error de Firebase y muestra un mensaje amigable
      let errorMessage = 'Error al registrarse. Por favor, inténtalo de nuevo.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está en uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico es inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres).'; // Firebase aún puede dar este si nuestra validación falla
          break;
        default:
          errorMessage = `Error: ${err.message}`;
          console.error("Error de registro:", err);
      }
      setError(errorMessage);
      setMessageType('error');
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
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-purple-500 to-pink-600 p-4 sm:p-6">
      <div className="bg-white p-8 rounded-xl shadow-2xl w-full max-w-md border-t-4 border-purple-700 transform hover:scale-105 transition-transform duration-300 ease-in-out">
        <h2 className="text-3xl font-extrabold text-center text-gray-900 mb-8">
          Registrarse
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
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
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
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
              value={password}
              onChange={(e) => setPassword(e.target.value)} // CORREGIDO: Usar setPassword aquí
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 mb-1">
              Confirmar Contraseña
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              autoComplete="new-password"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm placeholder-gray-400 focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="••••••••"
            />
          </div>
          <div>
            <label htmlFor="role" className="block text-sm font-medium text-gray-700 mb-1">
              ¿Cómo quieres registrarte?
            </label>
            <select
              id="role"
              name="role"
              required
              className="appearance-none block w-full px-4 py-2 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-purple-500 focus:border-purple-500 sm:text-sm transition duration-150 ease-in-out"
              value={role}
              onChange={(e) => setRole(e.target.value)}
            >
              <option value="client">Como Cliente</option>
              <option value="driver">Como Taxista</option>
            </select>
          </div>
          <div>
            <button
              type="submit"
              disabled={isLoading}
              className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-lg font-semibold text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500 transition duration-300 ease-in-out disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        <div className="mt-6 text-center">
          <p className="text-sm text-gray-600">
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="font-medium text-purple-600 hover:text-purple-500 focus:outline-none focus:underline"
            >
              Inicia sesión aquí
            </button>
          </p>
        </div>
      </div>

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

export default RegisterForm;
