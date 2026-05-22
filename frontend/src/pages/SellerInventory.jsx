import { useState, useEffect } from 'react';
import api from '../api';

export default function SellerInventory() {
  const [products, setProducts] = useState([]);
  const [sellerId, setSellerId] = useState(localStorage.getItem('userId') || '');
  const [editing, setEditing] = useState({});
  const [msg, setMsg] = useState({});

  async function loadInventory() {
    if (!sellerId) return;
    try {
      const { data } = await api.get(`/inventory/seller/${sellerId}`);
      setProducts(data);
    } catch {
      setProducts([]);
    }
  }

  useEffect(() => { loadInventory(); }, [sellerId]);

  async function updateStock(productId) {
    const newStock = Number(editing[productId]);
    if (!Number.isInteger(newStock) || newStock < 0) {
      setMsg(m => ({ ...m, [productId]: 'El stock debe ser un entero >= 0' }));
      return;
    }
    try {
      await api.patch(`/inventory/${productId}`, { newStock, sellerId });
      setMsg(m => ({ ...m, [productId]: '✓ Stock actualizado' }));
      loadInventory();
    } catch (err) {
      setMsg(m => ({ ...m, [productId]: err.response?.data?.error || 'Error al actualizar' }));
    }
  }

  return (
    <div>
      <h2>Panel de Inventario (Vendedor)</h2>
      <div style={{ marginBottom: '1rem' }}>
        <label>Seller ID: </label>
        <input value={sellerId} onChange={e => setSellerId(e.target.value)} style={inputStyle} placeholder="ID del vendedor" />
        <button onClick={loadInventory} style={btnStyle}>Cargar</button>
      </div>

      {products.length === 0 ? (
        <p>Sin productos. Ingresa tu Seller ID y presiona Cargar.</p>
      ) : (
        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ borderBottom: '2px solid #ddd' }}>
              <th style={th}>Producto</th>
              <th style={th}>Stock actual</th>
              <th style={th}>Estado</th>
              <th style={th}>Nuevo stock</th>
              <th style={th}>Acción</th>
            </tr>
          </thead>
          <tbody>
            {products.map(p => (
              <tr key={p.id} style={{ borderBottom: '1px solid #eee' }}>
                <td style={td}>{p.name}</td>
                <td style={td}>{p.stock}</td>
                <td style={td}>
                  <span style={{ color: p.isOutOfStock ? 'red' : 'green' }}>
                    {p.isOutOfStock ? 'Agotado' : 'Disponible'}
                  </span>
                </td>
                <td style={td}>
                  <input type="number" min="0" style={{ ...inputStyle, width: 80 }}
                    value={editing[p.id] ?? p.stock}
                    onChange={e => setEditing(ed => ({ ...ed, [p.id]: e.target.value }))} />
                </td>
                <td style={td}>
                  <button onClick={() => updateStock(p.id)} style={btnStyle}>Actualizar</button>
                  {msg[p.id] && <span style={{ marginLeft: '0.5rem', fontSize: '0.85rem', color: msg[p.id].startsWith('✓') ? 'green' : 'red' }}>{msg[p.id]}</span>}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

const th = { padding: '0.5rem', textAlign: 'left', color: '#555' };
const td = { padding: '0.75rem 0.5rem' };
const inputStyle = { padding: '0.4rem 0.6rem', borderRadius: 4, border: '1px solid #ccc' };
const btnStyle = { padding: '0.4rem 0.8rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
