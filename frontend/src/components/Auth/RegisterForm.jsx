
import React, { useState } from 'react';
import { createUserWithEmailAndPassword } from 'firebase/auth';
import { doc, setDoc } from 'firebase/firestore';
import { useAuth } from '../../context/AuthContext.jsx';
import MessageBox from '../UI/MessageBox.jsx';

/**
 * RegisterForm Component
 *
 * Componente para el formulario de registro de usuarios. Permite a los usuarios
 * crear una nueva cuenta con correo electrónico y contraseña, y especificar
 * si se registran como 'cliente' o 'taxista'. Los datos del usuario y su rol
 * se guardan en Firebase Authentication y Cloud Firestore.
 * Muestra mensajes de estado (éxito/error) usando el componente MessageBox.
 *
 * Este componente integra el diseño del usuario utilizando clases CSS estándar.
 *
 * @param {object} props - Las propiedades del componente.
 * @param {function} props.onSuccess - Callback a ejecutar si el registro es exitoso.
 * @param {function} props.onSwitchToLogin - Callback para cambiar al formulario de inicio de sesión.
 */
const RegisterForm = ({ onSuccess, onSwitchToLogin }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [role, setRole] = useState('client');
  const [error, setError] = useState(null);
  const [message, setMessage] = useState(null);
  const [messageType, setMessageType] = useState('info');
  const [isLoading, setIsLoading] = useState(false);

  const { auth, db, appId } = useAuth();

  const validateEmail = (email) => {
    const re = /\S+@\S+\.\S+/;
    return re.test(email);
  };

  const validatePassword = (password) => {
    if (password.length < 8) {
      return 'La contraseña debe tener al menos 8 caracteres.';
    }
    if (!/[A-Z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra mayúscula.';
    }
    if (!/[a-z]/.test(password)) {
      return 'La contraseña debe contener al menos una letra minúscula.';
    }
    if (!/[0-9]/.test(password)) {
      return 'La contraseña debe contener al menos un número.';
    }
    if (!/[!@#$%^&*()]/.test(password)) {
      return 'La contraseña debe contener al menos un símbolo (!@#$%^&*()).';
    }
    return null;
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
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      const userDocRef = doc(db, `artifacts/${appId}/users/${user.uid}/users`, user.uid);

      await setDoc(userDocRef, {
        email: user.email,
        role: role,
        createdAt: new Date(),
        profileImageUrl: '',
        isVerified: role === 'driver' ? false : true,
        isOnboarded: false,
      });

      setMessage('¡Registro exitoso! Ya puedes iniciar sesión.');
      setMessageType('success');
      if (onSuccess) {
        setTimeout(() => onSuccess(), 1500);
      } else if (onSwitchToLogin) {
        setTimeout(() => onSwitchToLogin(), 1500);
      }

      setEmail('');
      setPassword('');
      setConfirmPassword('');
      setRole('client');

    } catch (err) {
      let errorMessage = 'Error al registrarse. Por favor, inténtalo de nuevo.';
      switch (err.code) {
        case 'auth/email-already-in-use':
          errorMessage = 'Este correo electrónico ya está en uso.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'El formato del correo electrónico es inválido.';
          break;
        case 'auth/weak-password':
          errorMessage = 'La contraseña es demasiado débil (mínimo 6 caracteres).';
          break;
          case 'auth/network-request-failed':
            errorMessage = 'Problema de conexión a la red. Inténtalo de nuevo.';
            break;
        default:
          errorMessage = `Error: ${err.message}`;
          console.error("Error de registro:", err);
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
    <div className="register-page-container">
      <div className="register-form-card">
        <h2 className="form-title">Registra tu cuenta</h2>
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
          <div className="form-group">
            <label htmlFor="confirmPassword" className="form-label">
              Confirmar Contraseña
            </label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              className="form-input"
              placeholder="*************"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label htmlFor="role" className="form-label">
              Tipo de Usuario
            </label>
            <select
              id="role"
              name="role"
              className="form-input"
              value={role}
              onChange={(e) => setRole(e.target.value)}
              required
            >
              <option value="client">Cliente</option>
              <option value="driver">Taxista</option>
            </select>
          </div>
          <div className="form-actions">
            <button
              type="submit"
              disabled={isLoading}
              className="form-button"
            >
              {isLoading ? 'Registrando...' : 'Registrarse'}
            </button>
          </div>
        </form>
        {/* Este div ha sido actualizado con la nueva clase para centrar el texto */}
        <div className="form-footer-text">
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              type="button"
              onClick={onSwitchToLogin}
              className="form-link-button"
            >
              Inicia sesión
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
