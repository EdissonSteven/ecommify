import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api';

export default function ProductDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);
  const [msg, setMsg] = useState('');

  useEffect(() => {
    api.get(`/catalog/${id}`)
      .then(({ data }) => setProduct(data))
      .catch(() => setProduct(null));
  }, [id]);

  function addToCart() {
    const userId = localStorage.getItem('userId') || 'guest';
    const cart = JSON.parse(localStorage.getItem('cart') || '[]');
    const existing = cart.find(i => i.id === product.id);
    const newQty = (existing?.qty || 0) + qty;

    if (newQty > product.stock) {
      setMsg(`Stock máximo disponible: ${product.stock} unidades`);
      return;
    }

    const updated = existing
      ? cart.map(i => i.id === product.id ? { ...i, qty: newQty } : i)
      : [...cart, { id: product.id, name: product.name, price: product.price, qty, stock: product.stock }];

    localStorage.setItem('cart', JSON.stringify(updated));
    setMsg('¡Producto agregado al carrito!');
  }

  if (!product) return <p>Cargando producto...</p>;

  return (
    <div style={{ maxWidth: 600, margin: '0 auto' }}>
      <button onClick={() => navigate(-1)} style={backBtn}>&larr; Volver</button>
      <h2>{product.name}</h2>
      <p style={{ fontSize: '1.5rem', color: '#e94560' }}>${product.price?.toLocaleString()}</p>
      <p>⭐ {product.rating} | Categoría: {product.category}</p>
      <p style={{ color: product.available ? 'green' : 'red' }}>
        {product.available ? `En stock: ${product.stock} unidades` : 'Agotado'}
      </p>
      {product.description && <p>{product.description}</p>}

      {product.available && (
        <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center', marginTop: '1rem' }}>
          <input type="number" min={1} max={product.stock} value={qty}
            onChange={e => setQty(Number(e.target.value))} style={{ width: 60, padding: '0.4rem', borderRadius: 4, border: '1px solid #ccc' }} />
          <button onClick={addToCart} style={btnStyle}>Agregar al carrito</button>
        </div>
      )}
      {msg && <p style={{ marginTop: '0.5rem', color: msg.includes('máximo') ? 'red' : 'green' }}>{msg}</p>}
    </div>
  );
}

const backBtn = { background: 'none', border: 'none', cursor: 'pointer', color: '#1a1a2e', fontSize: '1rem', marginBottom: '1rem', padding: 0 };
const btnStyle = { padding: '0.5rem 1.2rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' };
