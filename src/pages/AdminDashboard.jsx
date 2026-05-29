import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { 
  TrendingUp, ShoppingBag, Users, Tag, DollarSign, Settings as SettingsIcon, Plus, Trash2, Edit3, CheckCircle, Package, AlertTriangle 
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
    saveProduct, 
    deleteProduct, 
    saveSettings, 
    saveCoupon, 
    deleteCoupon,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // ✅ ALL HOOKS MUST BE DECLARED BEFORE ANY CONDITIONAL RETURN
  // Violating this causes a black screen on reload (React Rules of Hooks)

  // Custom Deletion Confirmation State
  const [deleteConfirm, setDeleteConfirm] = useState({
    isOpen: false,
    itemId: null,
    itemName: '',
    itemType: 'product'
  });

  // Admin states
  const [activeTab, setActiveTab] = useState('stats');

  // --- NEW PRODUCT FORM STATES ---
  const [newProd, setNewProd] = useState({
    name: '',
    description: '',
    price: '',
    category_id: '',
    image: '',
    best_seller: false,
    in_stock: true
  });

  // --- PRODUCT INLINE-EDIT STATES ---
  const [editingProduct, setEditingProduct] = useState(null); // { id, name, price, description }

  // --- NEW COUPON FORM STATES ---
  const [newCoup, setNewCoup] = useState({
    code: '',
    discount_type: 'percentage',
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

  // Sync category_id whenever categories list changes (handles async Supabase load)
  useEffect(() => {
    if (categories.length > 0) {
      setNewProd(p => {
        const isValid = categories.some(c => c.id === p.category_id);
        if (!isValid) return { ...p, category_id: categories[0].id };
        return p;
      });
    }
  }, [categories]);

  // Sync settings form when settings load from Supabase
  useEffect(() => {
    if (settings && Object.keys(settings).length > 0) {
      setAdminSettings(prev => ({
        ...prev,
        store_name: settings.store_name || prev.store_name,
        whatsapp_number: settings.whatsapp_number || prev.whatsapp_number,
        pix_key: settings.pix_key || prev.pix_key,
        delivery_fee_base: settings.delivery_fee_base || prev.delivery_fee_base,
      }));
    }
  }, [settings]);

  // ✅ AUTH GUARD — comes AFTER all hooks
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

  // --- METRIC CALCULATORS ---
  const totalRevenue = orders.filter(o => o.status === 'delivered').reduce((sum, o) => sum + o.total, 0);
  const totalOrdersCount = orders.length;
  const averageTicket = totalOrdersCount > 0 ? (totalRevenue / orders.filter(o => o.status === 'delivered').length || 0) : 0;

  // Premium client-side image compression and Base64 loader
  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    if (file.size > 5 * 1024 * 1024) {
      showToast('A imagem deve ter no máximo 5MB!', 'error');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (event) => {
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const MAX_WIDTH = 600;
        let width = img.width;
        let height = img.height;
        
        if (width > MAX_WIDTH) {
          height = Math.round((height * MAX_WIDTH) / width);
          width = MAX_WIDTH;
        }
        
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        ctx.drawImage(img, 0, 0, width, height);
        
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.7);
        setNewProd(p => ({ ...p, image: compressedBase64 }));
      };
      img.src = event.target.result;
    };
    reader.onerror = () => {
      showToast('Erro ao carregar o arquivo de imagem.', 'error');
    };
    reader.readAsDataURL(file);
  };

  // --- SUBMITS ---
  const handleAddProduct = (e) => {
    e.preventDefault();
    if (!newProd.name || !newProd.price) return;
    if (!newProd.image) {
      showToast('Por favor, faça o upload de uma imagem!', 'error');
      return;
    }
    
    saveProduct({
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
  };

  const handleUpdateSettings = (e) => {
    e.preventDefault();
    saveSettings({
      ...adminSettings,
      delivery_fee_base: parseFloat(adminSettings.delivery_fee_base)
    });
  };

  const handleCreateCoupon = (e) => {
    e.preventDefault();
    if (!newCoup.code || !newCoup.value) return;
    
    saveCoupon({
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
                        {categories.length === 0 && (
                          <option value="" disabled>Carregando categorias...</option>
                        )}
                        {categories.map(c => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group span-6">
                      <label>Imagem do Produto *</label>
                      {newProd.image ? (
                        <div className="image-upload-preview-container glass">
                          <img src={newProd.image} alt="Preview do produto" className="image-upload-preview" />
                          <button 
                            type="button" 
                            onClick={() => setNewProd(p => ({ ...p, image: '' }))}
                            className="image-upload-remove-btn"
                          >
                            <Trash2 size={14} />
                            <span>Remover</span>
                          </button>
                        </div>
                      ) : (
                        <label className="image-upload-dropzone glass">
                          <input 
                            type="file" 
                            accept="image/*" 
                            onChange={handleImageUpload} 
                            style={{ display: 'none' }} 
                          />
                          <div className="image-upload-placeholder">
                            <Plus size={20} className="image-upload-icon" />
                            <strong>Enviar Foto</strong>
                            <span>JPG, PNG ou JPEG (máx 5MB)</span>
                          </div>
                        </label>
                      )}
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
                    {products.map(prod => {
                      const isEditing = editingProduct?.id === prod.id;
                      return (
                        <div key={prod.id} className={`catalog-row glass ${isEditing ? 'catalog-row-editing' : ''}`}>
                          <img src={prod.image} alt={prod.name} className="catalog-row-img" />
                          
                          <div className="catalog-row-info">
                            {isEditing ? (
                              <div className="catalog-inline-edit-fields">
                                <input
                                  className="catalog-edit-input"
                                  value={editingProduct.name}
                                  onChange={e => setEditingProduct(p => ({ ...p, name: e.target.value }))}
                                  placeholder="Nome do produto"
                                />
                                <input
                                  className="catalog-edit-input price-input"
                                  type="number"
                                  step="0.01"
                                  value={editingProduct.price}
                                  onChange={e => setEditingProduct(p => ({ ...p, price: e.target.value }))}
                                  placeholder="Preço (R$)"
                                />
                                <textarea
                                  className="catalog-edit-textarea"
                                  value={editingProduct.description}
                                  onChange={e => setEditingProduct(p => ({ ...p, description: e.target.value }))}
                                  placeholder="Descrição"
                                  rows={2}
                                />
                              </div>
                            ) : (
                              <>
                                <h4>{prod.name}</h4>
                                <p className="catalog-row-price">R$ {prod.price.toFixed(2)}</p>
                                <p className="catalog-row-desc-preview">{prod.description}</p>
                              </>
                            )}
                            
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

                          <div className="catalog-row-actions">
                            {isEditing ? (
                              <>
                                <button
                                  onClick={() => {
                                    saveProduct({
                                      ...prod,
                                      name: editingProduct.name,
                                      price: parseFloat(editingProduct.price),
                                      description: editingProduct.description
                                    });
                                    setEditingProduct(null);
                                  }}
                                  className="catalog-action-btn save"
                                  title="Salvar alterações"
                                >
                                  <CheckCircle size={15} />
                                </button>
                                <button
                                  onClick={() => setEditingProduct(null)}
                                  className="catalog-action-btn cancel-edit"
                                  title="Cancelar edição"
                                >
                                  ✕
                                </button>
                              </>
                            ) : (
                              <button
                                onClick={() => setEditingProduct({
                                  id: prod.id,
                                  name: prod.name,
                                  price: prod.price,
                                  description: prod.description || ''
                                })}
                                className="catalog-action-btn edit"
                                title="Editar produto"
                              >
                                <Edit3 size={15} />
                              </button>
                            )}
                            <button 
                              onClick={() => {
                                setDeleteConfirm({
                                  isOpen: true,
                                  itemId: prod.id,
                                  itemName: prod.name,
                                  itemType: 'product'
                                });
                              }} 
                              className="catalog-delete-btn"
                              title="Excluir produto"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </div>
                      );
                    })}
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
                          onClick={() => {
                            setDeleteConfirm({
                              isOpen: true,
                              itemId: coup.id,
                              itemName: `Cupom ${coup.code}`,
                              itemType: 'coupon'
                            });
                          }} 
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

      {/* Premium Deletion Confirmation Modal */}
      {deleteConfirm.isOpen && (
        <div className="custom-confirm-overlay">
          <div className="custom-confirm-card">
            <div className="custom-confirm-icon-box">
              <AlertTriangle size={32} />
            </div>
            
            <h3 className="custom-confirm-title">Confirmar Exclusão</h3>
            
            <p className="custom-confirm-message">
              Você tem certeza que deseja excluir este item? Esta ação removerá o registro permanentemente do sistema:
              <span className="custom-confirm-item-name">{deleteConfirm.itemName}</span>
            </p>
            
            <div className="custom-confirm-actions">
              <button 
                type="button"
                onClick={() => setDeleteConfirm({ isOpen: false, itemId: null, itemName: '', itemType: 'product' })}
                className="custom-confirm-btn cancel"
              >
                Cancelar
              </button>
              
              <button 
                type="button"
                onClick={() => {
                  if (deleteConfirm.itemType === 'product') {
                    deleteProduct(deleteConfirm.itemId);
                  } else if (deleteConfirm.itemType === 'coupon') {
                    deleteCoupon(deleteConfirm.itemId);
                  }
                  setDeleteConfirm({ isOpen: false, itemId: null, itemName: '', itemType: 'product' });
                }}
                className="custom-confirm-btn delete"
              >
                Confirmar Exclusão
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
