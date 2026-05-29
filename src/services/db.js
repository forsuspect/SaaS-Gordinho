import { createClient } from '@supabase/supabase-js';

// Initialize Supabase Client (if environment variables are provided)
const supabaseUrl = import.meta.env?.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env?.VITE_SUPABASE_ANON_KEY || '';

// Only create the client if the key looks like a valid JWT (starts with "eyJ") or the new Supabase publishable key format
const isValidKey = supabaseAnonKey && (supabaseAnonKey.startsWith('eyJ') || supabaseAnonKey.startsWith('sb_publishable_'));

let supabaseClient = (supabaseUrl && isValidKey)
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

// One-time health check — if the first Supabase call fails (401/403), disable
// the client permanently so the browser never makes further failing requests.
let supabaseChecked = false;
async function getValidSupabase() {
  if (!supabaseClient) return null;
  if (supabaseChecked) return supabaseClient;

  try {
    // Light probe: try to read from a table (categories is small)
    const { error } = await supabaseClient.from('categories').select('id').limit(1);
    supabaseChecked = true;
    if (error) {
      // Auth or table-missing error → disable Supabase, use localStorage only
      supabaseClient = null;
      return null;
    }
    return supabaseClient;
  } catch (_) {
    supabaseClient = null;
    supabaseChecked = true;
    return null;
  }
}

// Export for external usage (auth, etc.)
export { supabaseClient as supabase };

// Initial Seed Data
const DEFAULT_CATEGORIES = [
  { id: 'cat-burgers', name: 'Hambúrguer', slug: 'hamburguer', icon: 'Flame' },
  { id: 'cat-drinks', name: 'Bebidas', slug: 'bebidas', icon: 'CupSoda' },
  { id: 'cat-portions', name: 'Batatas', slug: 'batatas', icon: 'Utensils' },
  { id: 'cat-others', name: 'Demais itens', slug: 'demais', icon: 'Sparkles' }
];

const DEFAULT_PRODUCTS = [
  // Combos
  {
    id: 'prod-combo-1',
    name: 'Combo Gordinho Burguer',
    description: 'O clássico supremo: Double Cheeseburger 150g, Batata Frita Média e Refrigerante Lata gelado.',
    price: 44.90,
    image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-burgers',
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
    category_id: 'cat-burgers',
    stock: 45,
    sizes: [
      { name: 'Padrão', priceModifier: 0 }
    ],
    addons: [
      { name: 'Bacon Extra', price: 4.00 },
      { name: 'Cheddar Melt Extra', price: 4.50 }
    ],
    is_best_seller: true
  },
  // Burgers
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
  },
  {
    id: 'prod-burger-3',
    name: 'Bacon BBQ Crunch',
    description: 'Hambúrguer 150g, queijo monterey jack, muito bacon crocante, anéis de cebola empanados e molho barbecue rústico.',
    price: 34.90,
    image: 'https://images.unsplash.com/photo-1521305916504-4a1121188589?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-burgers',
    stock: 40,
    sizes: [
      { name: 'Single (150g)', priceModifier: 0 },
      { name: 'Double (300g)', priceModifier: 9.00 }
    ],
    addons: [
      { name: 'Maionese de Alho', price: 2.50 },
      { name: 'Queijo Extra', price: 3.00 }
    ],
    is_best_seller: false
  },
  {
    id: 'prod-burger-4',
    name: 'Smash Salad Supreme',
    description: 'Para quem curte leveza: Smash burger 90g, queijo prato derretido, alface crespa, tomate, picles e maionese verde.',
    price: 19.90,
    image: 'https://images.unsplash.com/photo-1542572412-47d02258ee00?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-burgers',
    stock: 100,
    sizes: [
      { name: 'Single (90g)', priceModifier: 0 },
      { name: 'Double (180g)', priceModifier: 6.00 }
    ],
    addons: [
      { name: 'Ovo frito', price: 2.50 },
      { name: 'Catupiry original', price: 4.00 }
    ],
    is_best_seller: false
  },
  // Portions
  {
    id: 'prod-portion-1',
    name: 'Batata Rústica Alecrim',
    description: 'Batatas fritas cortadas no estilo rústico com casca, temperadas com sal marinho, alecrim fresco e alho confitado. Acompanha maionese defumada.',
    price: 15.90,
    image: 'https://images.unsplash.com/photo-1573080496219-bb080dd4f877?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-portions',
    stock: 120,
    sizes: [
      { name: 'Individual', priceModifier: 0 },
      { name: 'Para Compartilhar', priceModifier: 7.00 }
    ],
    addons: [
      { name: 'Molho de Queijo extra', price: 3.50 }
    ]
  },
  {
    id: 'prod-portion-2',
    name: 'Cheddar Bacon Fries',
    description: 'Porção generosa de batatas fritas crocantes com cascata de queijo cheddar cremoso derretido e farofa de bacon crocante.',
    price: 21.90,
    image: 'https://images.unsplash.com/photo-1585109649139-366815a0d713?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-portions',
    stock: 80,
    sizes: [
      { name: 'Individual', priceModifier: 0 },
      { name: 'Grande', priceModifier: 9.00 }
    ],
    addons: []
  },
  {
    id: 'prod-portion-3',
    name: 'Onion Rings Crispy',
    description: 'Anéis de cebola gigantes empanados em farinha panko ultra crocantes. Acompanha maionese verde artesanal.',
    price: 16.90,
    image: 'https://images.unsplash.com/photo-1639024471283-2bc7b3c6a267?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-portions',
    stock: 90,
    sizes: [
      { name: 'Porção', priceModifier: 0 }
    ],
    addons: []
  },
  // Drinks
  {
    id: 'prod-drink-1',
    name: 'Coca-Cola Zero Lata',
    description: 'Refrigerante lata 350ml trincando de gelada.',
    price: 6.00,
    image: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-drinks',
    stock: 200,
    sizes: [
      { name: 'Lata 350ml', priceModifier: 0 }
    ],
    addons: [
      { name: 'Copo com gelo e limão', price: 1.00 }
    ]
  },
  {
    id: 'prod-drink-2',
    name: 'Suco Natural Laranja 500ml',
    description: 'Suco de laranja espremido na hora, gelado e refrescante.',
    price: 8.50,
    image: 'https://images.unsplash.com/photo-1621506289937-a8e4df240d0b?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-drinks',
    stock: 100,
    sizes: [
      { name: '500ml', priceModifier: 0 }
    ],
    addons: []
  },
  {
    id: 'prod-drink-3',
    name: 'Cerveja Heineken LN',
    description: 'Cerveja Premium Lager long neck 330ml, estupidamente gelada.',
    price: 10.00,
    image: 'https://images.unsplash.com/photo-1608270176050-82ec0f5411b3?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-drinks',
    stock: 150,
    sizes: [
      { name: 'Long Neck 330ml', priceModifier: 0 }
    ],
    addons: []
  },
  // Desserts
  {
    id: 'prod-dessert-1',
    name: 'Brownie Belga com Sorvete',
    description: 'Brownie de chocolate belga meio amargo bem molhadinho, servido morno com uma generosa bola de sorvete de baunilha e calda de chocolate.',
    price: 18.90,
    image: 'https://images.unsplash.com/photo-1606313564200-e75d5e30476c?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-others',
    stock: 40,
    sizes: [
      { name: 'Padrão', priceModifier: 0 }
    ],
    addons: [
      { name: 'Calda Extra de Nutella', price: 3.50 }
    ]
  },
  {
    id: 'prod-dessert-2',
    name: 'Milkshake Ovomaltine 400ml',
    description: 'Milkshake ultra cremoso de baunilha batido com Ovomaltine crocante e cobertura de chocolate.',
    price: 17.90,
    image: 'https://images.unsplash.com/photo-1579954115545-a95591f28bfc?auto=format&fit=crop&w=600&q=80',
    category_id: 'cat-others',
    stock: 60,
    sizes: [
      { name: '400ml', priceModifier: 0 }
    ],
    addons: [
      { name: 'Dobro de Ovomaltine', price: 2.50 }
    ]
  }
];

const DEFAULT_COUPONS = [
  { code: 'BEMVINDO', discount_type: 'percentage', value: 10, active: true, min_order_value: 30.00 },
  { code: 'BURGERNEW', discount_type: 'fixed', value: 15.00, active: true, min_order_value: 60.00 },
  { code: 'FOME10', discount_type: 'percentage', value: 10, active: true, min_order_value: 0.00 }
];

const DEFAULT_SETTINGS = {
  delivery_fee_base: 5.00,
  delivery_fee_per_km: 1.50,
  whatsapp_number: '5511999999999',
  pix_key: 'gordinho@pix.com.br',
  is_open: true
};

const DEFAULT_USERS = [
  { id: 'usr-admin', email: 'admin@gordinhoburguer.com', password: 'admin', name: 'Rodrigo Silveira (Admin)', role: 'admin', phone: '(11) 98888-7777', address: 'Av. Paulista, 1000 - Bela Vista' },
  { id: 'usr-emp', email: 'cozinha@gordinhoburguer.com', password: '123', name: 'Mateus Silva (Cozinha)', role: 'employee', phone: '(11) 97777-6666', address: 'Rua Bela Cintra, 200 - Consolação' },
  { id: 'usr-client', email: 'cliente@gmail.com', password: '123', name: 'Ana Souza', role: 'client', phone: '(11) 96666-5555', address: 'Rua Augusta, 1500 - Ap 42' }
];

const DEFAULT_ORDERS = [
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
      },
      {
        product_id: 'prod-drink-1',
        name: 'Coca-Cola Zero Lata',
        price: 6.00,
        qty: 1,
        selectedSize: 'Lata 350ml',
        selectedAddons: [{ name: 'Copo com gelo e limão', price: 1.00 }],
        notes: ''
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
    discount: 5.59, // 10% from BEMVINDO coupon
    total: 50.31,
    payment_method: 'pix',
    status: 'delivered',
    created_at: new Date(Date.now() - 1000 * 60 * 60 * 2).toISOString(), // 2h ago
    updated_at: new Date(Date.now() - 1000 * 60 * 60 * 1.5).toISOString()
  },
  {
    id: 'ord-1002',
    order_number: 1002,
    user_id: 'usr-client',
    client_name: 'Ana Souza',
    client_phone: '(11) 96666-5555',
    items: [
      {
        product_id: 'prod-burger-2',
        name: 'Monster Cheddar',
        price: 32.90,
        qty: 2,
        selectedSize: 'Double (240g)',
        selectedAddons: [{ name: 'Queijo Cheddar Dobrado', price: 4.00 }],
        notes: 'Bem passado'
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
    discount: 0,
    total: 79.80,
    payment_method: 'credit',
    status: 'preparing',
    created_at: new Date(Date.now() - 1000 * 60 * 15).toISOString(), // 15 mins ago
    updated_at: new Date(Date.now() - 1000 * 60 * 10).toISOString()
  }
];

// Helper to initialize local storage
function initializeLocalStorage() {
  // Always write the latest DEFAULT_CATEGORIES so the fallback is never stale.
  // Supabase data will overwrite this on the first successful fetch.
  localStorage.setItem('bh_categories', JSON.stringify(DEFAULT_CATEGORIES));

  if (!localStorage.getItem('bh_products')) {
    localStorage.setItem('bh_products', JSON.stringify(DEFAULT_PRODUCTS));
  }
  if (!localStorage.getItem('bh_coupons')) {
    localStorage.setItem('bh_coupons', JSON.stringify(DEFAULT_COUPONS));
  }
  if (!localStorage.getItem('bh_settings')) {
    localStorage.setItem('bh_settings', JSON.stringify(DEFAULT_SETTINGS));
  }
  if (!localStorage.getItem('bh_users')) {
    localStorage.setItem('bh_users', JSON.stringify(DEFAULT_USERS));
  } else {
    // Migrate legacy demo accounts (older "burgerhouse" emails) to current brand emails
    try {
      const existing = JSON.parse(localStorage.getItem('bh_users') || '[]');
      const migrated = existing.map(u => {
        if (u.email?.toLowerCase() === 'admin@burgerhouse.com') {
          return { ...u, email: 'admin@gordinhoburguer.com', password: 'admin', role: 'admin' };
        }
        if (u.email?.toLowerCase() === 'cozinha@burgerhouse.com') {
          return { ...u, email: 'cozinha@gordinhoburguer.com', password: '123', role: 'employee' };
        }
        return u;
      });
      localStorage.setItem('bh_users', JSON.stringify(migrated));
    } catch {
      // If parsing fails, reset to defaults
      localStorage.setItem('bh_users', JSON.stringify(DEFAULT_USERS));
    }
  }
  if (!localStorage.getItem('bh_orders')) {
    localStorage.setItem('bh_orders', JSON.stringify(DEFAULT_ORDERS));
  }
}

// Execute initial storage setup
if (typeof window !== 'undefined') {
  initializeLocalStorage();
}

// Database Service interface
export const dbService = {
  // --- CATEGORIES ---
  async getCategories() {
    const sortCategories = (list) => {
      const order = ['cat-burgers', 'cat-portions', 'cat-drinks', 'cat-others'];
      return [...list].sort((a, b) => {
        const indexA = order.indexOf(a.id);
        const indexB = order.indexOf(b.id);
        if (indexA === -1 && indexB === -1) return 0;
        if (indexA === -1) return 1;
        if (indexB === -1) return -1;
        return indexA - indexB;
      });
    };

    const sb = await getValidSupabase();
    const localCats = JSON.parse(localStorage.getItem('bh_categories') || '[]');
    if (sb) {
      try {
        const { data, error } = await sb.from('categories').select('*');
        if (!error && data) {
          const merged = [...data];
          for (const localC of localCats) {
            if (!merged.some(c => c.id === localC.id)) {
              merged.push(localC);
            }
          }
          const sorted = sortCategories(merged);
          localStorage.setItem('bh_categories', JSON.stringify(sorted));
          return sorted;
        }
      } catch (_) { /* silent fallback */ }
    }
    return sortCategories(localCats);
  },

  async saveCategory(category) {
    const list = JSON.parse(localStorage.getItem('bh_categories') || '[]');
    const index = list.findIndex(c => c.id === category.id);
    
    if (index >= 0) {
      list[index] = category;
    } else {
      category.id = category.id || `cat-${Date.now()}`;
      list.push(category);
    }
    localStorage.setItem('bh_categories', JSON.stringify(list));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('categories').upsert(category); } catch (_) {}
    }
    return category;
  },

  async deleteCategory(id) {
    const list = JSON.parse(localStorage.getItem('bh_categories') || '[]');
    const filtered = list.filter(c => c.id !== id);
    localStorage.setItem('bh_categories', JSON.stringify(filtered));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('categories').delete().eq('id', id); } catch (_) {}
    }
    return true;
  },

  // --- PRODUCTS ---
  async getProducts() {
    const sb = await getValidSupabase();
    const localProducts = JSON.parse(localStorage.getItem('bh_products') || '[]');
    if (sb) {
      try {
        const { data, error } = await sb.from('products').select('*');
        if (!error && data) {
          let merged = [...data];
          if (merged.length === 0) {
            await sb.from('products').upsert(DEFAULT_PRODUCTS);
            const { data: fresh } = await sb.from('products').select('*');
            if (fresh && fresh.length > 0) {
              merged = fresh;
            }
          }
          for (const localP of localProducts) {
            if (!merged.some(p => p.id === localP.id)) {
              merged.push(localP);
            }
          }
          localStorage.setItem('bh_products', JSON.stringify(merged));
          return merged;
        }
      } catch (_) { /* silent fallback */ }
    }
    return localProducts;
  },

  async saveProduct(product) {
    const list = JSON.parse(localStorage.getItem('bh_products') || '[]');
    const index = list.findIndex(p => p.id === product.id);
    
    if (index >= 0) {
      list[index] = product;
    } else {
      product.id = product.id || `prod-${Date.now()}`;
      list.push(product);
    }
    localStorage.setItem('bh_products', JSON.stringify(list));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('products').upsert(product); } catch (_) {}
    }
    return product;
  },

  async deleteProduct(id) {
    const list = JSON.parse(localStorage.getItem('bh_products') || '[]');
    const filtered = list.filter(p => p.id !== id);
    localStorage.setItem('bh_products', JSON.stringify(filtered));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('products').delete().eq('id', id); } catch (_) {}
    }
    return true;
  },

  // --- USERS ---
  async getUsers() {
    const sb = await getValidSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('profiles').select('*');
        if (!error && data) return data;
      } catch (_) { /* silent fallback */ }
    }
    return JSON.parse(localStorage.getItem('bh_users') || '[]');
  },

  async saveUser(user) {
    const list = JSON.parse(localStorage.getItem('bh_users') || '[]');
    const index = list.findIndex(u => u.id === user.id || u.email === user.email);
    
    if (index >= 0) {
      list[index] = { ...list[index], ...user };
    } else {
      user.id = user.id || `usr-${Date.now()}`;
      list.push(user);
    }
    localStorage.setItem('bh_users', JSON.stringify(list));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('profiles').upsert(user); } catch (_) {}
    }
    return user;
  },

  async login(email, password) {
    // 1. Try Supabase Auth first if active
    const sb = await getValidSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.auth.signInWithPassword({ email, password });
        if (!error && data?.user) {
          const { data: profile } = await sb.from('profiles').select('*').eq('id', data.user.id).single();
          if (profile) return profile;
        }
      } catch (_) { /* fall through to local */ }
    }
    // 2. Local Fallback
    const users = JSON.parse(localStorage.getItem('bh_users') || '[]');
    const user = users.find(u => u.email.toLowerCase() === email.toLowerCase() && u.password === password);
    if (!user) {
      throw new Error('E-mail ou senha incorretos.');
    }
    return user;
  },

  // --- ORDERS ---
  async getOrders() {
    const sb = await getValidSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('orders').select('*').order('created_at', { ascending: false });
        if (!error && data) {
          // Normalize and restore waiter_name from delivery_address if needed
          return data.map(o => ({
            ...o,
            waiter_name: o.waiter_name || o.delivery_address?.waiter_name || ''
          }));
        }
      } catch (_) { /* silent fallback */ }
    }
    return JSON.parse(localStorage.getItem('bh_orders') || '[]');
  },

  async saveOrder(order) {
    // Copy waiter_name inside delivery_address object to preserve it on Supabase JSONB
    if (order.waiter_name) {
      if (typeof order.delivery_address === 'object' && order.delivery_address !== null) {
        order.delivery_address = {
          ...order.delivery_address,
          waiter_name: order.waiter_name
        };
      } else {
        order.delivery_address = {
          street: typeof order.delivery_address === 'string' ? order.delivery_address : 'Balcão/Salão',
          waiter_name: order.waiter_name
        };
      }
    }

    const list = JSON.parse(localStorage.getItem('bh_orders') || '[]');
    const index = list.findIndex(o => o.id === order.id);
    
    if (index >= 0) {
      list[index] = { ...list[index], ...order, updated_at: new Date().toISOString() };
    } else {
      order.id = order.id || `ord-${Date.now()}`;
      order.order_number = order.order_number || (list.length > 0 ? Math.max(...list.map(o => o.order_number || 1000)) + 1 : 1001);
      order.created_at = order.created_at || new Date().toISOString();
      order.updated_at = new Date().toISOString();
      list.unshift(order); // Add new orders to the front
    }
    localStorage.setItem('bh_orders', JSON.stringify(list));

    const sb = await getValidSupabase();
    if (sb) {
      try {
        // Strip waiter_name from the root object when saving to Supabase to prevent PGRST100 "column does not exist" 400 Bad Request
        const { waiter_name, ...dbOrder } = order;
        await sb.from('orders').upsert(dbOrder);
      } catch (_) {}
    }
    return order;
  },

  // --- SETTINGS ---
  async getSettings() {
    const sb = await getValidSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('settings').select('*').single();
        if (!error && data) return data;
      } catch (_) { /* silent fallback */ }
    }
    return JSON.parse(localStorage.getItem('bh_settings') || '{}');
  },

  async saveSettings(settings) {
    localStorage.setItem('bh_settings', JSON.stringify(settings));
    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('settings').upsert({ id: 1, ...settings }); } catch (_) {}
    }
    return settings;
  },

  // --- COUPONS ---
  async getCoupons() {
    const sb = await getValidSupabase();
    if (sb) {
      try {
        const { data, error } = await sb.from('coupons').select('*');
        if (!error && data) return data;
      } catch (_) { /* silent fallback */ }
    }
    return JSON.parse(localStorage.getItem('bh_coupons') || '[]');
  },

  async saveCoupon(coupon) {
    const list = JSON.parse(localStorage.getItem('bh_coupons') || '[]');
    const index = list.findIndex(c => c.code.toUpperCase() === coupon.code.toUpperCase());
    
    if (index >= 0) {
      list[index] = coupon;
    } else {
      list.push(coupon);
    }
    localStorage.setItem('bh_coupons', JSON.stringify(list));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('coupons').upsert(coupon); } catch (_) {}
    }
    return coupon;
  },

  async deleteCoupon(code) {
    const list = JSON.parse(localStorage.getItem('bh_coupons') || '[]');
    const filtered = list.filter(c => c.code.toUpperCase() !== code.toUpperCase());
    localStorage.setItem('bh_coupons', JSON.stringify(filtered));

    const sb = await getValidSupabase();
    if (sb) {
      try { await sb.from('coupons').delete().eq('code', code); } catch (_) {}
    }
    return true;
  }
};
