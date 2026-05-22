import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export default function Cart() {
  const [cart, setCart] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    setCart(JSON.parse(localStorage.getItem('cart') || '[]'));
  }, []);

  function updateQty(id, newQty) {
    const item = cart.find(i => i.id === id);
    if (newQty < 1) return;
    if (newQty > item.stock) {
      alert(`Stock máximo disponible: ${item.stock} unidades`);
      return;
    }
    const updated = cart.map(i => i.id === id ? { ...i, qty: newQty } : i);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  function removeItem(id) {
    const updated = cart.filter(i => i.id !== id);
    setCart(updated);
    localStorage.setItem('cart', JSON.stringify(updated));
  }

  const subtotal = cart.reduce((sum, i) => sum + i.price * i.qty, 0);
  const tax = subtotal * 0.19;
  const total = subtotal + tax;

  return (
    <div style={{ maxWidth: 700, margin: '0 auto' }}>
      <h2>Carrito de compras</h2>
      {cart.length === 0 ? (
        <p>Tu carrito está vacío. <span style={{ color: '#e94560', cursor: 'pointer' }} onClick={() => navigate('/catalog')}>Ir al catálogo →</span></p>
      ) : (
        <>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid #ddd' }}>
                <th style={th}>Producto</th><th style={th}>Precio</th><th style={th}>Cantidad</th><th style={th}>Subtotal</th><th style={th}></th>
              </tr>
            </thead>
            <tbody>
              {cart.map(item => (
                <tr key={item.id} style={{ borderBottom: '1px solid #eee' }}>
                  <td style={td}>{item.name}</td>
                  <td style={td}>${item.price.toLocaleString()}</td>
                  <td style={td}>
                    <button onClick={() => updateQty(item.id, item.qty - 1)} style={qtyBtn}>-</button>
                    <span style={{ margin: '0 0.5rem' }}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} style={qtyBtn}>+</button>
                  </td>
                  <td style={td}>${(item.price * item.qty).toLocaleString()}</td>
                  <td style={td}><button onClick={() => removeItem(item.id)} style={removeBtn}>✕</button></td>
                </tr>
              ))}
            </tbody>
          </table>

          <div style={{ textAlign: 'right', marginTop: '1rem' }}>
            <p>Subtotal: ${subtotal.toLocaleString()}</p>
            <p>IVA (19%): ${tax.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <p style={{ fontWeight: 'bold', fontSize: '1.2rem' }}>Total: ${total.toLocaleString(undefined, { maximumFractionDigits: 0 })}</p>
            <button onClick={() => navigate('/checkout')} style={checkoutBtn}>Proceder al checkout →</button>
          </div>
        </>
      )}
    </div>
  );
}

const th = { padding: '0.5rem', textAlign: 'left', color: '#555' };
const td = { padding: '0.75rem 0.5rem' };
const qtyBtn = { background: '#eee', border: 'none', padding: '0.2rem 0.5rem', cursor: 'pointer', borderRadius: 3 };
const removeBtn = { background: 'none', border: 'none', color: '#e94560', cursor: 'pointer', fontSize: '1rem' };
const checkoutBtn = { padding: '0.6rem 1.5rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem', marginTop: '0.5rem' };
