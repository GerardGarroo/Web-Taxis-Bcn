import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPass, setConfirmPass] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password || !confirmPass) {
      setError('Por favor, rellena todos los campos.');
      return;
    }
    if (password !== confirmPass) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 6) {
      setError('La contraseña debe tener al menos 6 caracteres.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        alert('Registro exitoso! Ahora puedes iniciar sesión.');
        navigate('/login');
      } else {
        setError(data.message || 'Error al registrar usuario.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="form-container">
      <h2>Registrarse</h2>
      <form className="form" onSubmit={handleSubmit}>
        <input
          type="email"
          className="input-field"
          placeholder="Correo electrónico"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
        />
        <input
          type="password"
          className="input-field"
          placeholder="Confirmar contraseña"
          value={confirmPass}
          onChange={(e) => setConfirmPass(e.target.value)}
          required
        />
        {error && <div className="error">{error}</div>}
        <button className="submit-btn" type="submit">Registrarse</button>
      </form>
      <p style={{textAlign: 'center', marginTop: '15px'}}>
        ¿Ya tienes cuenta? <Link to="/login">Iniciar sesión</Link>
      </p>
    </div>
  );
};

export default Register;
