import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api';

const STEPS = ['Dirección', 'Pago', 'Confirmación'];

const emptyAddress = { street: '', city: '', state: '', zipCode: '', country: '' };

export default function Checkout() {
  const [step, setStep] = useState(0);
  const [address, setAddress] = useState(emptyAddress);
  const [payment, setPayment] = useState('credit_card');
  const [order, setOrder] = useState(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const cart = JSON.parse(localStorage.getItem('cart') || '[]');
  const total = cart.reduce((s, i) => s + i.price * i.qty, 0);

  function handleAddressChange(e) {
    setAddress(a => ({ ...a, [e.target.name]: e.target.value }));
  }

  async function handleConfirm() {
    setError('');
    try {
      const userId = localStorage.getItem('userId');
      const inventory = {};
      cart.forEach(i => { inventory[i.id] = i.stock; });
      const { data } = await api.post('/checkout/orders', { cart, address, payment, userId, inventory });
      setOrder(data);
      localStorage.removeItem('cart');
      setStep(2);
    } catch (err) {
      setError(err.response?.data?.error || 'Error al procesar el pedido');
    }
  }

  return (
    <div style={{ maxWidth: 550, margin: '0 auto' }}>
      <h2>Checkout</h2>

      {/* Stepper */}
      <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1.5rem' }}>
        {STEPS.map((s, i) => (
          <div key={s} style={{ flex: 1, textAlign: 'center', padding: '0.4rem', borderRadius: 4,
            background: i === step ? '#e94560' : i < step ? '#c0c0c0' : '#eee',
            color: i === step ? '#fff' : '#333', fontSize: '0.85rem' }}>
            {s}
          </div>
        ))}
      </div>

      {step === 0 && (
        <div style={sectionStyle}>
          <h3>Dirección de envío</h3>
          {['street', 'city', 'state', 'zipCode', 'country'].map(field => (
            <input key={field} name={field} placeholder={field} value={address[field]}
              onChange={handleAddressChange} required style={inputStyle} />
          ))}
          <button onClick={() => setStep(1)} style={btnStyle}
            disabled={Object.values(address).some(v => !v.trim())}>
            Continuar →
          </button>
        </div>
      )}

      {step === 1 && (
        <div style={sectionStyle}>
          <h3>Método de pago</h3>
          {[['credit_card', 'Tarjeta de crédito'], ['debit_card', 'Tarjeta débito'], ['boleto', 'Boleto']].map(([val, label]) => (
            <label key={val} style={{ display: 'block', margin: '0.5rem 0', cursor: 'pointer' }}>
              <input type="radio" name="payment" value={val} checked={payment === val}
                onChange={() => setPayment(val)} /> {label}
            </label>
          ))}
          <div style={{ marginTop: '1rem' }}>
            <strong>Resumen del pedido</strong>
            {cart.map(i => <p key={i.id} style={{ margin: '0.2rem 0' }}>{i.name} x{i.qty} — ${(i.price * i.qty).toLocaleString()}</p>)}
            <p style={{ fontWeight: 'bold' }}>Total: ${total.toLocaleString()}</p>
          </div>
          {error && <p style={{ color: 'red' }}>{error}</p>}
          <div style={{ display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
            <button onClick={() => setStep(0)} style={{ ...btnStyle, background: '#888' }}>← Volver</button>
            <button onClick={handleConfirm} style={btnStyle}>Confirmar pedido</button>
          </div>
        </div>
      )}

      {step === 2 && order && (
        <div style={{ ...sectionStyle, textAlign: 'center' }}>
          <h3 style={{ color: 'green' }}>✓ Pedido confirmado</h3>
          <p>Número de orden: <strong>{order.orderId}</strong></p>
          <p>Total pagado: <strong>${order.total?.toLocaleString()}</strong></p>
          <button onClick={() => navigate('/catalog')} style={btnStyle}>Seguir comprando</button>
        </div>
      )}
    </div>
  );
}

const sectionStyle = { display: 'flex', flexDirection: 'column', gap: '0.75rem' };
const inputStyle = { padding: '0.5rem', borderRadius: 4, border: '1px solid #ccc', fontSize: '1rem' };
const btnStyle = { padding: '0.6rem 1.2rem', background: '#e94560', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontSize: '1rem' };
