import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// In-memory data store seeded with the exact mock data for instant API functionality
let categories = [
  { id: 'cat-combos', name: 'Combos Especiais', slug: 'combos', icon: 'Sparkles' },
  { id: 'cat-burgers', name: 'Hambúrgueres Premium', slug: 'burgers', icon: 'Flame' },
  { id: 'cat-portions', name: 'Acompanhamentos', slug: 'portions', icon: 'Utensils' },
  { id: 'cat-drinks', name: 'Bebidas Geladas', slug: 'drinks', icon: 'CupSoda' },
  { id: 'cat-desserts', name: 'Sobremesas', slug: 'desserts', icon: 'IceCream' }
];

let products = [
  {
    id: 'prod-combo-1',
    name: 'Combo Gordinho Burguer',
    description: 'O clássico supremo: Double Cheeseburger 150g, Batata Frita Média e Refrigerante Lata gelado.',
    price: 44.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-combos',
    stock: 50,
    sizes: [
      { name: 'Médio', priceModifier: 0 },
      { name: 'Grande (+ batata grande)', priceModifier: 5.00 }
    ],
    addons: [
      { name: 'Carne Extra (150g)', price: 8.00 },
      { name: 'Cheddar Extra', price: 3.50 },
      { name: 'Bacon Extra', price: 4.00 }
    ],
    is_best_seller: true
  },
  {
    id: 'prod-combo-2',
    name: 'Combo Cheddar Bacon',
    description: 'Para os apaixonados por bacon: Cheddar Bacon Burger 150g, Batata Rústica e Milkshake Creme 400ml.',
    price: 49.90,
    image: 'https://images.unsplash.com/photo-1594212699903-ec8a3eca50f5?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-combos',
    stock: 45,
    sizes: [{ name: 'Padrão', priceModifier: 0 }],
    addons: [
      { name: 'Bacon Extra', price: 4.00 },
      { name: 'Cheddar Melt Extra', price: 4.50 }
    ],
    is_best_seller: true
  },
  {
    id: 'prod-burger-1',
    name: 'Classic Burger',
    description: 'Hambúrguer de 150g grelhado no fogo, muito queijo cheddar derretido, alface fresca, tomate, cebola roxa e molho especial da casa.',
    price: 24.90,
    image: 'https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-burgers',
    stock: 80,
    sizes: [
      { name: 'Single (150g)', priceModifier: 0 },
      { name: 'Double (300g)', priceModifier: 9.00 }
    ],
    addons: [
      { name: 'Bacon fatiado', price: 3.50 },
      { name: 'Cebola caramelizada', price: 2.50 },
      { name: 'Picles artesanal', price: 2.00 }
    ],
    is_best_seller: true
  },
  {
    id: 'prod-burger-2',
    name: 'Monster Cheddar',
    description: 'Dois smash burgers de 120g, cheddar cremoso injetado, cebola caramelizada artesanal e maionese defumada no pão brioche.',
    price: 32.90,
    image: 'https://images.unsplash.com/photo-1586190848861-99aa4a171e90?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-burgers',
    stock: 60,
    sizes: [
      { name: 'Double (240g)', priceModifier: 0 },
      { name: 'Triple (360g)', priceModifier: 8.00 }
    ],
    addons: [
      { name: 'Queijo Cheddar Dobrado', price: 4.00 },
      { name: 'Bacon fatiado', price: 3.50 }
    ],
    is_best_seller: true
  }
];

let coupons = [
  { code: 'BEMVINDO', discount_type: 'percentage', value: 10, active: true, min_order_value: 30.00 },
  { code: 'BURGERNEW', discount_type: 'fixed', value: 15.00, active: true, min_order_value: 60.00 }
];

let settings = {
  delivery_fee_base: 5.00,
  delivery_fee_per_km: 1.50,
  whatsapp_number: '5511999999999',
  pix_key: 'gordinho@pix.com.br',
  is_open: true
};

let users = [
  { id: 'usr-admin', email: 'admin@gordinhoburguer.com', password: 'admin', name: 'Rodrigo Silveira (Admin)', role: 'admin', phone: '(11) 98888-7777', address: 'Av. Paulista, 1000' },
  { id: 'usr-emp', email: 'cozinha@gordinhoburguer.com', password: '123', name: 'Mateus Silva (Cozinha)', role: 'employee', phone: '(11) 97777-6666', address: 'Rua Bela Cintra, 200' },
  { id: 'usr-client', email: 'cliente@gmail.com', password: '123', name: 'Ana Souza', role: 'client', phone: '(11) 96666-5555', address: 'Rua Augusta, 1500' }
];

let orders = [
  {
    id: 'ord-1001',
    order_number: 1001,
    user_id: 'usr-client',
    client_name: 'Ana Souza',
    client_phone: '(11) 96666-5555',
    items: [
      {
        product_id: 'prod-combo-1',
        name: 'Combo Gordinho Burguer',
        price: 44.90,
        qty: 1,
        selectedSize: 'Médio',
        selectedAddons: [{ name: 'Bacon Extra', price: 4.00 }],
        notes: 'Sem cebola no hambúrguer'
      }
    ],
    delivery_type: 'delivery',
    delivery_address: {
      street: 'Rua Augusta',
      number: '1500',
      neighborhood: 'Consolação',
      city: 'São Paulo',
      zip: '01305-100',
      reference: 'Próximo ao metrô Consolação'
    },
    delivery_fee: 6.00,
    discount: 5.09,
    total: 49.81,
    payment_method: 'pix',
    status: 'delivered',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(),
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString()
  }
];

// --- API ENDPOINTS ---

// Check Status
app.get('/api/status', (req, res) => {
  res.json({ status: 'Gordinho Burguer API is running!', timestamp: new Date() });
});

// Auth / Login
app.post('/api/login', (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    return res.status(400).json({ error: 'E-mail e senha são obrigatórios.' });
  }

  const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
  if (!user) {
    return res.status(401).json({ error: 'E-mail ou senha incorretos.' });
  }

  res.json({ user });
});

// Categories
app.get('/api/categories', (req, res) => res.json(categories));
app.post('/api/categories', (req, res) => {
  const category = req.body;
  category.id = category.id || `cat-${Date.now()}`;
  categories.push(category);
  res.status(201).json(category);
});

// Products
app.get('/api/products', (req, res) => res.json(products));
app.post('/api/products', (req, res) => {
  const product = req.body;
  product.id = product.id || `prod-${Date.now()}`;
  products.push(product);
  res.status(201).json(product);
});
app.delete('/api/products/:id', (req, res) => {
  const { id } = req.params;
  products = products.filter(p => p.id !== id);
  res.json({ success: true });
});

// Orders
app.get('/api/orders', (req, res) => res.json(orders));
app.post('/api/orders', (req, res) => {
  const order = req.body;
  order.id = `ord-${Date.now()}`;
  order.order_number = orders.length > 0 ? Math.max(...orders.map(o => o.order_number || 1000)) + 1 : 1001;
  order.created_at = new Date().toISOString();
  order.updated_at = new Date().toISOString();
  order.status = order.status || 'pending';
  
  orders.unshift(order);
  res.status(201).json(order);
});

app.put('/api/orders/:id/status', (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  
  const order = orders.find(o => o.id === id);
  if (!order) return res.status(404).json({ error: 'Pedido não encontrado' });
  
  order.status = status;
  order.updated_at = new Date().toISOString();
  res.json(order);
});

// Settings
app.get('/api/settings', (req, res) => res.json(settings));
app.post('/api/settings', (req, res) => {
  settings = { ...settings, ...req.body };
  res.json(settings);
});

// Coupons
app.get('/api/coupons', (req, res) => res.json(coupons));
app.post('/api/coupons', (req, res) => {
  const coupon = req.body;
  const existsIndex = coupons.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
  if (existsIndex >= 0) {
    coupons[existsIndex] = coupon;
  } else {
    coupons.push(coupon);
  }
  res.status(201).json(coupon);
});
app.delete('/api/coupons/:code', (req, res) => {
  const { code } = req.params;
  coupons = coupons.filter(c => c.code.toUpperCase() !== code.toUpperCase());
  res.json({ success: true });
});

// Express Server Activation for Local Dev
if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`\n🍔 Gordinho Burguer Express server listening on http://localhost:${PORT}`);
  });
}

export default app;
