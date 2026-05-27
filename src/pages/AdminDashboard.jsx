import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { 
  TrendingUp, ShoppingBag, Users, Tag, DollarSign, Settings as SettingsIcon, Plus, Trash2, Edit3, CheckCircle, Package 
} from 'lucide-react';
import './AdminDashboard.css';

export default function AdminDashboard() {
  const { 
    user, 
    products, 
    categories, 
    orders, 
    coupons, 
    settings, 
    updateProductStock, 
    addProduct, 
    deleteProduct, 
    updateSettings, 
    createCoupon, 
    deleteCoupon,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Admin access validation
  if (!user || user.role !== 'admin') {
    return (
      <div className="portal-unauthorized section-padding">
        <div className="unauth-card glass-glow">
          <p className="lock-emoji">🔒</p>
          <h2>Painel Administrativo</h2>
          <p>Esta seção é exclusiva para administradores do Gordinho Burguer.</p>
          <button onClick={() => navigate('/login')} className="neon-btn unauth-login-btn">
            Entrar como Admin
          </button>
        </div>
      </div>
    );
  }

  // Admin states
  const [activeTab, setActiveTab] = useState('stats'); // 'stats', 'products', 'settings', 'coupons'

  // --- NEW PRODUCT FORM STATES ---
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    category_id: categories[0]?.id || '',
    image: '',
    best_seller: false,
    in_stock: true
  });

  // --- NEW COUPON FORM STATES ---
  const [newCoup, setNewCoup] = useState({
    code: '',
    discount_type: 'percentage', // 'percentage' or 'fixed'
    value: '',
    min_order_value: ''
  });

  // --- SETTINGS FORM STATES ---
  const [adminSettings, setAdminSettings] = useState({
    store_name: settings.store_name || 'Gordinho Burguer',
    whatsapp_number: settings.whatsapp_number || '5511999999999',
    pix_key: settings.pix_key || 'gordinho@pix.com.br',
    delivery_fee_base: settings.delivery_fee_base || 5.00
  });

  // --- METRIC CALCULATORS ---
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? (totalRevenue / orders.filter(o => o.status === 'delivered').length || 0) : 0;

  // --- SUBMITS ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;
    
    addProduct({
      ...newProd,
      price: parseFloat(newProd.price),
      sizes: [
        { name: 'Padrão', priceModifier: 0 }
      ],
      addons: [
        { name: 'Bacon Extra', price: 4.00 },
        { name: 'Queijo Extra', price: 3.00 },
        { name: 'Carne Extra 150g', price: 8.00 }
      ]
    });

    setNewProd({
      name: '',
      description: '',
      price: '',
      category_id: categories[0]?.id || '',
      image: '',
      best_seller: false,
      in_stock: true
    });
    showToast('Produto adicionado com sucesso!', 'success');
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    updateSettings({
      ...adminSettings,
      delivery_fee_base: parseFloat(adminSettings.delivery_fee_base)
    });
    showToast('Configurações atualizadas com sucesso!', 'success');
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCoup.code || !newCoup.value) return;
    
    createCoupon({
      ...newCoup,
      value: parseFloat(newCoup.value),
      min_order_value: parseFloat(newCoup.min_order_value || 0)
    });

    setNewCoup({
      code: '',
      discount_type: 'percentage',
      value: '',
      min_order_value: ''
    });
    showToast('Cupom de desconto criado!', 'success');
  };

  return (
    <>
      <Navbar />

      <div className="admin-dashboard-page section-padding">
        <div className="admin-container">
          
          {/* Admin Header with navigation */}
          <div className="admin-header">
            <div>
              <h1 className="admin-title">Painel Administrativo</h1>
              <p className="admin-subtitle">Gerencie o faturamento, produtos, cupons e preferências do SaaS.</p>
            </div>

            <div className="admin-tab-buttons">
              <button onClick={() => setActiveTab('stats')} className={`tab-btn glass ${activeTab === 'stats' ? 'active' : ''}`}>
                <TrendingUp size={16} />
                <span>Métricas</span>
              </button>
              <button onClick={() => setActiveTab('products')} className={`tab-btn glass ${activeTab === 'products' ? 'active' : ''}`}>
                <Package size={16} />
                <span>Cardápio & Estoque</span>
              </button>
              <button onClick={() => setActiveTab('coupons')} className={`tab-btn glass ${activeTab === 'coupons' ? 'active' : ''}`}>
                <Tag size={16} />
                <span>Cupons</span>
              </button>
              <button onClick={() => setActiveTab('settings')} className={`tab-btn glass ${activeTab === 'settings' ? 'active' : ''}`}>
                <SettingsIcon size={16} />
                <span>Preferências</span>
              </button>
            </div>
          </div>

          {/* --- TAB 1: METRICS & STATS --- */}
          {activeTab === 'stats' && (
            <div className="stats-tab-content">
              {/* Cards Grid */}
              <div className="stats-cards-grid">
                <div className="stat-card glass-glow">
                  <DollarSign className="stat-icon rev" size={28} />
                  <div>
                    <p className="stat-label">Faturamento Total</p>
                    <h2 className="stat-value">R$ {totalRevenue.toFixed(2)}</h2>
                    <span className="stat-note">Apenas pedidos Entregues</span>
                  </div>
                </div>

                <div className="stat-card glass-glow">
                  <ShoppingBag className="stat-icon ord" size={28} />
                  <div>
                    <p className="stat-label">Total de Pedidos</p>
                    <h2 className="stat-value">{totalOrdersCount}</h2>
                    <span className="stat-note">Entregues, pendentes e ativos</span>
                  </div>
                </div>

                <div className="stat-card glass-glow">
                  <TrendingUp className="stat-icon tkt" size={28} />
                  <div>
                    <p className="stat-label">Ticket Médio</p>
                    <h2 className="stat-value">R$ {averageTicket.toFixed(2)}</h2>
                    <span className="stat-note">Média por pedido finalizado</span>
                  </div>
                </div>
              </div>

              {/* Orders Listing inside Stats for audit */}
              <div className="admin-orders-audit glass">
                <h3>Histórico Completo de Pedidos</h3>
                <div className="audit-table-wrapper">
                  <table className="audit-table">
                    <thead>
                      <tr>
                        <th>Pedido</th>
                        <th>Cliente</th>
                        <th>Tipo</th>
                        <th>Valor</th>
                        <th>Método</th>
                        <th>Status</th>
                      </tr>
                    </thead>
                    <tbody>
                      {orders.map(o => (
                        <tr key={o.id}>
                          <td><strong>#{o.order_number}</strong></td>
                          <td>{o.client_name}</td>
                          <td>{o.delivery_type === 'delivery' ? 'Entrega 🛵' : 'Retirada 🏪'}</td>
                          <td>R$ {o.total.toFixed(2)}</td>
                          <td>{o.payment_method.toUpperCase()}</td>
                          <td>
                            <span className={`status-pill ${o.status}`}>{o.status}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 2: PRODUCTS CRUD & STOCK --- */}
          {activeTab === 'products' && (
            <div className="products-tab-content">
              <div className="products-split-layout">
                {/* Product Form (LEFT) */}
                <form onSubmit={handleAddProduct} className="product-form-box glass">
                  <h3>➕ Adicionar Novo Produto</h3>
                  
                  <div className="form-grid">
                    <div className="form-group span-6">
                      <label>Nome do Produto *</label>
                      <input 
                        type="text" 
                        value={newProd.name} 
                        onChange={(e) => setNewProd(p => ({ ...p, name: e.target.value }))}
                        placeholder="Ex: Double Smash Cheddar" 
                        required 
                      />
                    </div>

                    <div className="form-group span-6">
                      <label>Descrição detalhada</label>
                      <input 
                        type="text" 
                        value={newProd.description} 
                        onChange={(e) => setNewProd(p => ({ ...p, description: e.target.value }))}
                        placeholder="Ex: Dois blends de 100g, muito cheddar derretido..." 
                      />
                    </div>

                    <div className="form-group span-3">
                      <label>Preço Base (R$) *</label>
                      <input 
                        type="number" 
                        step="0.01"
                        value={newProd.price} 
                        onChange={(e) => setNewProd(p => ({ ...p, price: e.target.value }))}
                        placeholder="29.90" 
                        required 
                      />
                    </div>

                    <div className="form-group span-3">
                      <label>Categoria</label>
                      <select 
                        value={newProd.category_id} 
                        onChange={(e) => setNewProd(p => ({ ...p, category_id: e.target.value }))}
                        className="form-select glass"
                      >
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group span-6">
                      <label>URL da Imagem</label>
                      <input 
                        type="text" 
                        value={newProd.image} 
                        onChange={(e) => setNewProd(p => ({ ...p, image: e.target.value }))}
                        placeholder="https://images.unsplash.com/..." 
                      />
                    </div>
                  </div>

                  <button type="submit" className="neon-btn add-prod-submit">
                    <Plus size={16} />
                    <span>Salvar no Cardápio</span>
                  </button>
                </form>

                {/* Catalog Listing & Stock Toggler (RIGHT) */}
                <div className="products-list-box glass">
                  <h3>Lista de Itens do Cardápio</h3>
                  
                  <div className="catalog-grid">
                    {products.map(prod => (
                      <div key={prod.id} className="catalog-row glass">
                        <img src={prod.image} alt={prod.name} className="catalog-row-img" />
                        
                        <div className="catalog-row-info">
                          <h4>{prod.name}</h4>
                          <p className="catalog-row-price">R$ {prod.price.toFixed(2)}</p>
                          
                          <div className="stock-toggle-wrapper">
                            <label className="switch">
                              <input 
                                type="checkbox" 
                                checked={prod.in_stock} 
                                onChange={(e) => updateProductStock(prod.id, e.target.checked)} 
                              />
                              <span className="slider round"></span>
                            </label>
                            <span className={`stock-status ${prod.in_stock ? 'in' : 'out'}`}>
                              {prod.in_stock ? 'Em Estoque' : 'Indisponível'}
                            </span>
                          </div>
                        </div>

                        <button 
                          onClick={() => {
                            if (confirm(`Deseja mesmo excluir ${prod.name}?`)) {
                              deleteProduct(prod.id);
                            }
                          }} 
                          className="catalog-delete-btn"
                          title="Excluir produto"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 3: COUPONS CONFIG --- */}
          {activeTab === 'coupons' && (
            <div className="coupons-tab-content">
              <div className="products-split-layout">
                {/* New Coupon Form */}
                <form onSubmit={handleCreateCoupon} className="product-form-box glass">
                  <h3>🎫 Criar Novo Cupom</h3>
                  
                  <div className="form-grid">
                    <div className="form-group span-6">
                      <label>Código do Cupom *</label>
                      <input 
                        type="text" 
                        value={newCoup.code} 
                        onChange={(e) => setNewCoup(c => ({ ...c, code: e.target.value.toUpperCase() }))}
                        placeholder="Ex: QUERODEZ" 
                        required 
                      />
                    </div>

                    <div className="form-group span-3">
                      <label>Tipo de Desconto</label>
                      <select 
                        value={newCoup.discount_type} 
                        onChange={(e) => setNewCoup(c => ({ ...c, discount_type: e.target.value }))}
                        className="form-select glass"
                      >
                        <option value="percentage">Porcentagem (%)</option>
                        <option value="fixed">Fixo (R$)</option>
                      </select>
                    </div>

                    <div className="form-group span-3">
                      <label>Valor *</label>
                      <input 
                        type="number" 
                        value={newCoup.value} 
                        onChange={(e) => setNewCoup(c => ({ ...c, value: e.target.value }))}
                        placeholder="10.00" 
                        required 
                      />
                    </div>

                    <div className="form-group span-6">
                      <label>Mínimo do Pedido (R$)</label>
                      <input 
                        type="number" 
                        value={newCoup.min_order_value} 
                        onChange={(e) => setNewCoup(c => ({ ...c, min_order_value: e.target.value }))}
                        placeholder="Ex: 50.00" 
                      />
                    </div>
                  </div>

                  <button type="submit" className="neon-btn add-prod-submit">
                    <Plus size={16} />
                    <span>Ativar Cupom</span>
                  </button>
                </form>

                {/* Coupons Listing */}
                <div className="products-list-box glass">
                  <h3>Cupons Ativos</h3>
                  
                  <div className="catalog-grid">
                    {coupons.map(coup => (
                      <div key={coup.id} className="catalog-row glass">
                        <div className="catalog-row-info">
                          <h4>🏷️ {coup.code}</h4>
                          <p className="catalog-row-price">
                            Desconto: {coup.discount_type === 'percentage' ? `${coup.value}%` : `R$ ${coup.value.toFixed(2)}`}
                          </p>
                          <p className="catalog-row-desc">
                            Mínimo: R$ {coup.min_order_value.toFixed(2)}
                          </p>
                        </div>

                        <button 
                          onClick={() => deleteCoupon(coup.id)} 
                          className="catalog-delete-btn"
                          title="Excluir cupom"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* --- TAB 4: SETTINGS --- */}
          {activeTab === 'settings' && (
            <div className="settings-tab-content">
              <form onSubmit={handleUpdateSettings} className="settings-form-box glass-glow">
                <h3>⚙️ Configurações Gerais do SaaS</h3>
                
                <div className="form-grid">
                  <div className="form-group span-6">
                    <label>Nome do Estabelecimento</label>
                    <input 
                      type="text" 
                      value={adminSettings.store_name} 
                      onChange={(e) => setAdminSettings(s => ({ ...s, store_name: e.target.value }))}
                    />
                  </div>

                  <div className="form-group span-6">
                    <label>WhatsApp de Recebimento de Pedidos (Formato 55...)</label>
                    <input 
                      type="text" 
                      value={adminSettings.whatsapp_number} 
                      onChange={(e) => setAdminSettings(s => ({ ...s, whatsapp_number: e.target.value }))}
                    />
                  </div>

                  <div className="form-group span-6">
                    <label>Chave Pix do Estabelecimento</label>
                    <input 
                      type="text" 
                      value={adminSettings.pix_key} 
                      onChange={(e) => setAdminSettings(s => ({ ...s, pix_key: e.target.value }))}
                    />
                  </div>

                  <div className="form-group span-6">
                    <label>Taxa de Entrega Padrão (R$)</label>
                    <input 
                      type="number" 
                      step="0.01"
                      value={adminSettings.delivery_fee_base} 
                      onChange={(e) => setAdminSettings(s => ({ ...s, delivery_fee_base: e.target.value }))}
                    />
                  </div>
                </div>

                <button type="submit" className="neon-btn settings-save-btn">
                  Salvar Preferências
                </button>
              </form>
            </div>
          )}

        </div>
      </div>
    </>
  );
}
