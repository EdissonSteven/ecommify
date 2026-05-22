import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Login() {
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/login', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      navigate('/catalog');
    } catch (err) {
      setError(err.response?.data?.error || 'Error al iniciar sesión');
    }
  }

  return (
    <div style={containerStyle}>
      <h2>Iniciar sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Contraseña" value={form.password} onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={btnStyle}>Ingresar</button>
      </form>
      <p>¿No tienes cuenta? <Link to="/register">Regístrate</Link></p>
    </div>
  );
}

const containerStyle = { maxWidth: 400, margin: '2rem auto' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const inputStyle = { padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem' };
const btnStyle = { padding: '0.6rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' };
