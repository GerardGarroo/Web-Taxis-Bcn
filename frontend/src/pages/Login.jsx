import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import './Form.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Por favor, rellena todos los campos.');
      return;
    }

    try {
      const response = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (response.ok) {
        alert('Login correcto! Bienvenido.');
        navigate('/dashboard'); // Cambia ruta según tu app
      } else {
        setError(data.message || 'Error al iniciar sesión.');
      }
    } catch (err) {
      console.error(err);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div className="form-container">
      <h2>Iniciar Sesión</h2>
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
        {error && <div className="error">{error}</div>}
        <button className="submit-btn" type="submit">Entrar</button>
      </form>
      <p style={{textAlign: 'center', marginTop: '15px'}}>
        ¿No tienes cuenta? <Link to="/register">Regístrate</Link>
      </p>
    </div>
  );
};

export default Login;
