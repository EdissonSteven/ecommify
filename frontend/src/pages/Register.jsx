import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../api';

export default function Register() {
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const navigate = useNavigate();

  function handleChange(e) {
    setForm(f => ({ ...f, [e.target.name]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError('');
    try {
      const { data } = await api.post('/auth/register', form);
      localStorage.setItem('token', data.token);
      localStorage.setItem('userId', data.user.id);
      setSuccess('Registro exitoso. Redirigiendo...');
      setTimeout(() => navigate('/catalog'), 1200);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al registrarse');
    }
  }

  return (
    <div style={containerStyle}>
      <h2>Crear cuenta</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      {success && <p style={{ color: 'green' }}>{success}</p>}
      <form onSubmit={handleSubmit} style={formStyle}>
        <input name="name" placeholder="Nombre completo" value={form.name} onChange={handleChange} required style={inputStyle} />
        <input name="email" type="email" placeholder="Correo electrónico" value={form.email} onChange={handleChange} required style={inputStyle} />
        <input name="password" type="password" placeholder="Contraseña (mín. 8 chars, mayúscula y número)" value={form.password} onChange={handleChange} required style={inputStyle} />
        <button type="submit" style={btnStyle}>Registrarse</button>
      </form>
      <p>¿Ya tienes cuenta? <Link to="/login">Inicia sesión</Link></p>
    </div>
  );
}

const containerStyle = { maxWidth: 400, margin: '2rem auto' };
const formStyle = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const inputStyle = { padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem' };
const btnStyle = { padding: '0.6rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' };
