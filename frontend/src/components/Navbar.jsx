import { Link, useNavigate } from 'react-router-dom';

export default function Navbar() {
  const navigate = useNavigate();
  const token = localStorage.getItem('token');

  function handleLogout() {
    localStorage.removeItem('token');
    localStorage.removeItem('userId');
    localStorage.removeItem('cart');
    navigate('/login');
  }

  return (
    <nav style={{ background: '#1a1a2e', padding: '0.75rem 2rem', display: 'flex', gap: '1.5rem', alignItems: 'center' }}>
      <span style={{ color: '#e94560', fontWeight: 'bold', fontSize: '1.2rem' }}>Ecommify</span>
      <Link to="/catalog" style={linkStyle}>Catálogo</Link>
      <Link to="/cart" style={linkStyle}>Carrito</Link>
      <Link to="/seller/inventory" style={linkStyle}>Inventario</Link>
      {token ? (
        <button onClick={handleLogout} style={btnStyle}>Salir</button>
      ) : (
        <>
          <Link to="/login" style={linkStyle}>Login</Link>
          <Link to="/register" style={linkStyle}>Registro</Link>
        </>
      )}
    </nav>
  );
}

const linkStyle = { color: '#fff', textDecoration: 'none' };
const btnStyle = { background: '#e94560', color: '#fff', border: 'none', padding: '0.3rem 0.8rem', borderRadius: 4, cursor: 'pointer' };
