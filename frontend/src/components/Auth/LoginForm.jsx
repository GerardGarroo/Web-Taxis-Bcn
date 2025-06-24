
import React, { useState } from 'react';
import { signInWithEmailAndPassword } from 'firebase/auth';
import { useAuth } from '../../context/AuthContext.jsx';
import MessageBox from '../UI/MessageBox.jsx';

/**
 * LoginForm Component
 *
 * Componente para el formulario de inicio de sesión. Permite a los usuarios
 * ingresar su correo electrónico y contraseña para acceder a la aplicación.
 * Utiliza Firebase Authentication para la lógica de inicio de sesión y muestra
 * mensajes de estado (éxito/error) usando el componente MessageBox.
 *
 * Este componente integra el diseño del usuario utilizando clases CSS estándar.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onSuccess - Callback a ejecutar si el inicio de sesión es exitoso.
 * @param {function} props.onSwitchToRegister - Callback para cambiar al formulario de registro.
 */
const LoginForm = ({ onSuccess, onSwitchToRegister }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  const { auth } = useAuth();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setMessage(null);
    setIsLoading(true);

    if (!validateEmail(email)) {
      setError('Por favor, introduce un correo electrónico válido.');
      setMessageType('error');
      setIsLoading(false);
      return;
    }

    try {
      await signInWithEmailAndPassword(auth, email, password);
      setMessage('¡Inicio de sesión exitoso!');
      setMessageType('success');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      }
    } catch (err) {
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
          case 'auth/network-request-failed':
            errorMessage = 'Problema de conexión a la red. Inténtalo de nuevo.';
            break;
        case 'auth/too-many-requests':
          errorMessage = 'Demasiados intentos fallidos. Por favor, inténtalo más tarde.';
          break;
        default:
          errorMessage = `Error: ${err.message}`;
          console.error("Error de inicio de sesión:", err);
      }
      setError(errorMessage);
      setMessageType('error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCloseMessage = () => {
    setError(null);
    setMessage(null);
  };

  return (
    <div className="login-page-container">
      <div className="login-form-card">
        <h2 className="form-title">Inicia sesión</h2>
        <form onSubmit={handleSubmit} className="form-elements">
          <div className="form-group">
            <label htmlFor="email" className="form-label">
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              className="form-input"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="password" className="form-label">
              Contraseña
            </label>
            <input
              type="password"
              id="password"
              name="password"
              className="form-input"
              placeholder="*************"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="form-button"
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </button>
          </div>
        </form>
        {/* Este div ha sido actualizado con la nueva clase para centrar el texto */}
        <div className="form-footer-text">
          <p>
            ¿No tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToRegister}
              className="form-link-button"
            >
              Regístrate aquí
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

export default LoginForm;
