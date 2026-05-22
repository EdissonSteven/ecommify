import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../api';

export default function Catalog() {
  const [products, setProducts] = useState([]);
  const [filters, setFilters] = useState({ category: '', minPrice: '', maxPrice: '', minRating: '' });
  const [loading, setLoading] = useState(false);

  async function fetchProducts() {
    setLoading(true);
    try {
      const params = {};
      if (filters.category) params.category = filters.category;
      if (filters.minPrice) params.minPrice = filters.minPrice;
      if (filters.maxPrice) params.maxPrice = filters.maxPrice;
      if (filters.minRating) params.minRating = filters.minRating;
      const { data } = await api.get('/catalog', { params });
      setProducts(data);
    } catch {
      setProducts([]);
    }
    setLoading(false);
  }

  useEffect(() => { fetchProducts(); }, []);

  function handleFilter(e) {
    e.preventDefault();
    fetchProducts();
  }

  return (
    <div>
      <h2>Catálogo de productos</h2>
      <form onSubmit={handleFilter} style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', marginBottom: '1rem' }}>
        <input placeholder="Categoría" value={filters.category} onChange={e => setFilters(f => ({ ...f, category: e.target.value }))} style={inputStyle} />
        <input placeholder="Precio mín." type="number" value={filters.minPrice} onChange={e => setFilters(f => ({ ...f, minPrice: e.target.value }))} style={inputStyle} />
        <input placeholder="Precio máx." type="number" value={filters.maxPrice} onChange={e => setFilters(f => ({ ...f, maxPrice: e.target.value }))} style={inputStyle} />
        <input placeholder="Rating mín." type="number" step="0.1" value={filters.minRating} onChange={e => setFilters(f => ({ ...f, minRating: e.target.value }))} style={inputStyle} />
        <button type="submit" style={btnStyle}>Filtrar</button>
      </form>

      {loading && <p>Cargando...</p>}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '1rem' }}>
        {products.map(p => (
          <div key={p.id} style={cardStyle}>
            <h3 style={{ margin: '0 0 0.5rem' }}>{p.name}</h3>
            <p style={{ margin: '0 0 0.25rem', color: '#555' }}>${p.price?.toLocaleString()}</p>
            <p style={{ margin: '0 0 0.25rem', fontSize: '0.85rem' }}>⭐ {p.rating} | Stock: {p.stock}</p>
            <Link to={`/product/${p.id}`} style={linkStyle}>Ver detalle →</Link>
          </div>
        ))}
        {!loading && products.length === 0 && <p>No se encontraron productos.</p>}
      </div>
    </div>
  );
}

const inputStyle = { padding: '0.4rem 0.6rem', borderRadius: 4, border: '1px solid #ccc' };
const btnStyle = { padding: '0.4rem 1rem', background: '#1a1a2e', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer' };
const cardStyle = { border: '1px solid #ddd', borderRadius: 8, padding: '1rem', boxShadow: '0 2px 4px rgba(0,0,0,0.05)' };
const linkStyle = { color: '#e94560', textDecoration: 'none', fontWeight: 'bold' };
