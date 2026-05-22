// ============================================================
// Ecommify – Datos semilla MongoDB (catálogo y reseñas)
// Ejecutado por docker-entrypoint-initdb.d con mongosh
// ============================================================

db = db.getSiblingDB('ecommify');

// ── Productos ────────────────────────────────────────────────
db.products.drop();
db.products.createIndex({ id: 1 }, { unique: true });
db.products.createIndex({ category: 1 });
db.products.createIndex({ price: 1 });
db.products.createIndex({ rating: -1 });

db.products.insertMany([
  {
    id: 'prod-001',
    name: 'Smartphone Samsung Galaxy A54',
    price: 1299.90,
    category: 'smartphones',
    rating: 4.5,
    stock: 25,
    sellerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Smartphone Samsung Galaxy A54 com 256GB, câmera tripla de 50MP, tela Super AMOLED de 6.4" e bateria de 5000mAh.',
    images: ['https://picsum.photos/seed/galaxy-a54/400/300'],
    specs: { storage: '256GB', ram: '8GB', camera: '50MP', battery: '5000mAh' }
  },
  {
    id: 'prod-002',
    name: 'Laptop Dell Inspiron 15',
    price: 3499.90,
    category: 'laptops',
    rating: 4.3,
    stock: 8,
    sellerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Laptop Dell Inspiron 15 con Intel Core i5 de 12ª generación, 16GB RAM, SSD 512GB y pantalla Full HD de 15.6".',
    images: ['https://picsum.photos/seed/dell-inspiron/400/300'],
    specs: { processor: 'Intel Core i5-1235U', ram: '16GB', storage: '512GB SSD', display: '15.6" FHD' }
  },
  {
    id: 'prod-003',
    name: 'Tablet Apple iPad 10',
    price: 2199.90,
    category: 'tablets',
    rating: 4.7,
    stock: 12,
    sellerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Apple iPad 10ª generación con chip A14 Bionic, pantalla Liquid Retina de 10.9", Wi-Fi 6 y USB-C.',
    images: ['https://picsum.photos/seed/ipad-10/400/300'],
    specs: { chip: 'A14 Bionic', storage: '64GB', display: '10.9" Liquid Retina', connectivity: 'Wi-Fi 6' }
  },
  {
    id: 'prod-004',
    name: 'Fone Bluetooth Sony WH-1000XM5',
    price: 899.90,
    category: 'audio',
    rating: 4.8,
    stock: 50,
    sellerId: 'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22',
    description: 'Audífonos inalámbricos Sony WH-1000XM5 con cancelación de ruido líder de la industria, 30h de batería y micrófono de alta calidad.',
    images: ['https://picsum.photos/seed/sony-xm5/400/300'],
    specs: { type: 'Over-ear', battery: '30h', anc: 'Yes', connectivity: 'Bluetooth 5.2' }
  },
  {
    id: 'prod-005',
    name: 'Smartwatch Apple Watch SE',
    price: 1599.90,
    category: 'wearables',
    rating: 4.6,
    stock: 15,
    sellerId: 'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22',
    description: 'Apple Watch SE con chip S8, pantalla Retina siempre activa, GPS, monitoreo de salud y resistencia al agua.',
    images: ['https://picsum.photos/seed/watch-se/400/300'],
    specs: { chip: 'S8', display: 'Retina LTPO', gps: 'Yes', waterResistance: '50m' }
  },
  {
    id: 'prod-006',
    name: 'Mouse Logitech MX Master 3',
    price: 349.90,
    category: 'peripherals',
    rating: 4.9,
    stock: 30,
    sellerId: 'b1ffcd00-ad1c-5f09-cc7e-7cc0ce491b22',
    description: 'Mouse inalámbrico Logitech MX Master 3 con scroll magnético, 7 botones programables, recarga USB-C y 70 días de batería.',
    images: ['https://picsum.photos/seed/mx-master/400/300'],
    specs: { dpi: '200-8000', battery: '70 days', connectivity: 'Bluetooth + USB', buttons: 7 }
  },
  {
    id: 'prod-007',
    name: 'Teclado Mecánico Keychron K2',
    price: 499.90,
    category: 'peripherals',
    rating: 4.4,
    stock: 0,
    sellerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Teclado mecánico compacto 75% Keychron K2 con switches Cherry MX, retroiluminación RGB y compatible con Mac/Windows.',
    images: ['https://picsum.photos/seed/keychron-k2/400/300'],
    specs: { layout: '75%', switches: 'Cherry MX Red', backlight: 'RGB', os: 'Mac/Windows' }
  },
  {
    id: 'prod-008',
    name: 'Monitor LG 27" 4K UltraFine',
    price: 1899.90,
    category: 'monitors',
    rating: 4.6,
    stock: 5,
    sellerId: 'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    description: 'Monitor LG UltraFine 27" 4K IPS con USB-C 90W, HDR400, 99% sRGB y altavoces integrados. Ideal para profesionales.',
    images: ['https://picsum.photos/seed/lg-4k/400/300'],
    specs: { resolution: '3840x2160', panel: 'IPS', hdr: 'HDR400', usbC: '90W' }
  }
]);

// ── Reseñas de muestra ───────────────────────────────────────
db.reviews.drop();
db.reviews.createIndex({ productId: 1 });
db.reviews.createIndex({ userId: 1, productId: 1 }, { unique: true });

db.reviews.insertMany([
  {
    userId: 'c2aafe11-be2d-6a1a-dd8f-8dd1cf502c33',
    productId: 'prod-001',
    score: 5,
    comment: 'Excelente smartphone, cámara increíble y batería dura todo el día.',
    createdAt: new Date('2025-01-10').toISOString()
  },
  {
    userId: 'd3bbff22-cf3e-7b2b-ee90-9ee2d0613d44',
    productId: 'prod-001',
    score: 4,
    comment: 'Muy buen equipo, solo le falta carga rápida más potente.',
    createdAt: new Date('2025-01-15').toISOString()
  },
  {
    userId: 'c2aafe11-be2d-6a1a-dd8f-8dd1cf502c33',
    productId: 'prod-004',
    score: 5,
    comment: 'La cancelación de ruido es espectacular. Vale cada centavo.',
    createdAt: new Date('2025-02-01').toISOString()
  },
  {
    userId: 'd3bbff22-cf3e-7b2b-ee90-9ee2d0613d44',
    productId: 'prod-006',
    score: 5,
    comment: 'El mejor mouse que he tenido. El scroll magnético es una maravilla.',
    createdAt: new Date('2025-02-20').toISOString()
  }
]);

print('✅ Ecommify seed data loaded: ' + db.products.countDocuments() + ' products, ' + db.reviews.countDocuments() + ' reviews');
