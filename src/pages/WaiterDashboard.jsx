import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { ShoppingCart, Plus, Minus, Trash2, Send, RefreshCw, Layers, CheckCircle2, User } from 'lucide-react';
import './WaiterDashboard.css';

export default function WaiterDashboard() {
  const { user, products, categories, saveOrder, showToast, refreshOrders } = useApp();
  const navigate = useNavigate();

  // Route security: only admins or employees (vendedores/garçons) can access
  const isStaff = user?.role === 'employee' || user?.role === 'admin';

  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tableNumber, setTableNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [waiterCart, setWaiterCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // pix, credit, debit, cash
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!user || !isStaff) {
    return (
      <div className="portal-unauthorized section-padding">
        <div className="unauth-card glass-glow">
          <p className="lock-emoji">🔒</p>
          <h2>Acesso de Vendedor / Garçom</h2>
          <p>Você precisa estar logado com credenciais de funcionário ou administrador para acessar o Painel de Vendas.</p>
          <button onClick={() => navigate('/login')} className="neon-btn unauth-login-btn">
            Acessar com Credenciais
          </button>
        </div>
      </div>
    );
  }

  // Filter products by category
  const filteredProducts = selectedCategory === 'all'
    ? products
    : products.filter(p => p.category_id === selectedCategory);

  // Add item to Waiter Cart
  const handleAddToWaiterCart = (product) => {
    setWaiterCart(prev => {
      const idx = prev.findIndex(item => item.id === product.id);
      if (idx >= 0) {
        const updated = [...prev];
        updated[idx].qty += 1;
        return updated;
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        image: product.image,
        qty: 1,
        selectedSize: 'Padrão',
        selectedAddons: []
      }];
    });
    showToast(`${product.name} adicionado à comanda!`, 'success');
  };

  const handleUpdateQty = (productId, delta) => {
    setWaiterCart(prev => prev.map(item => {
      if (item.id === productId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const handleRemove = (productId) => {
    setWaiterCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removido da comanda.', 'info');
  };

  const getSubtotal = () => waiterCart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handlePlaceWaiterOrder = async () => {
    if (waiterCart.length === 0) {
      showToast('Por favor, adicione pelo menos um item à comanda.', 'error');
      return;
    }
    if (!tableNumber.trim() && !clientName.trim()) {
      showToast('Por favor, informe o Número da Mesa ou o Nome do Cliente.', 'error');
      return;
    }

    setIsSubmitting(true);
    try {
      const targetLabel = tableNumber.trim() ? `Mesa ${tableNumber}` : `Cliente ${clientName}`;
      
      const orderData = {
        user_id: 'usr-waiter-' + user.id,
        client_name: clientName.trim() ? clientName : `Mesa ${tableNumber}`,
        client_phone: 'Atendimento Local',
        items: waiterCart.map(item => ({
          ...item,
          cartItemId: `${item.id}-Padrão--`,
          unitPrice: item.price
        })),
        delivery_type: 'takeout', // or table / local
        delivery_address: tableNumber.trim() ? `MESA: ${tableNumber}` : 'Balcão/Salão',
        delivery_fee: 0,
        discount: 0,
        total: getSubtotal(),
        payment_method: paymentMethod,
        status: 'pending', // goes to kitchen immediately
        waiter_name: user.name
      };

      // We use context or service to save order
      const { dbService } = await import('../services/db');
      await dbService.saveOrder(orderData);
      
      // Notify kitchen indirectly via refreshing state if available
      if (refreshOrders) {
        await refreshOrders();
      }

      showToast(`Pedido para ${targetLabel} enviado para a cozinha!`, 'success');
      
      // Clear local states
      setWaiterCart([]);
      setTableNumber('');
      setClientName('');
    } catch (err) {
      console.error(err);
      showToast('Erro ao enviar pedido.', 'info');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />

      <div className="waiter-dashboard-page section-padding">
        <div className="waiter-header-section">
          <div>
            <h1 className="waiter-title">🚀 Atendimento de Salão</h1>
            <p className="waiter-subtitle">Lance pedidos diretamente para a cozinha a partir das mesas.</p>
          </div>
          <div className="waiter-badge glass">
            <span>Atendente: <strong>{user.name}</strong></span>
          </div>
        </div>

        <div className="waiter-layout-grid">
          {/* LEFT: PRODUCTS SELECTION */}
          <div className="waiter-products-pane glass">
            <div className="waiter-categories-nav">
              <button 
                onClick={() => setSelectedCategory('all')} 
                className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                Todos
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {cat.name}
                </button>
              ))}
            </div>

            <div className="waiter-products-grid">
              {filteredProducts.map(prod => (
                <div key={prod.id} className="waiter-product-card glass" onClick={() => handleAddToWaiterCart(prod)}>
                  <img src={prod.image} alt={prod.name} className="w-prod-img" />
                  <div className="w-prod-info">
                    <h4>{prod.name}</h4>
                    <p className="w-prod-desc">{prod.description}</p>
                    <span className="w-prod-price">R$ {prod.price.toFixed(2)}</span>
                  </div>
                  <button className="w-add-btn">
                    <Plus size={16} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* RIGHT: CURRENT BILL (COMANDA) */}
          <div className="waiter-bill-pane glass-glow">
            <div className="bill-header">
              <h3>📋 Comanda de Lançamento</h3>
              <span className="items-count">{waiterCart.reduce((sum, i) => sum + i.qty, 0)} itens</span>
            </div>

            {/* Table and Client Inputs */}
            <div className="bill-meta-inputs">
              <div className="meta-input-group">
                <label>Número da Mesa</label>
                <input 
                  type="text" 
                  value={tableNumber} 
                  onChange={(e) => setTableNumber(e.target.value)} 
                  placeholder="Ex: 05" 
                />
              </div>
              <div className="meta-input-group">
                <label>Nome do Cliente (Opcional)</label>
                <input 
                  type="text" 
                  value={clientName} 
                  onChange={(e) => setClientName(e.target.value)} 
                  placeholder="Ex: Carlos" 
                />
              </div>
            </div>

            {/* Bill items */}
            <div className="bill-items-list">
              {waiterCart.length > 0 ? (
                waiterCart.map(item => (
                  <div key={item.id} className="bill-item glass">
                    <div className="bill-item-info">
                      <h4>{item.name}</h4>
                      <span>R$ {(item.price * item.qty).toFixed(2)}</span>
                    </div>

                    <div className="bill-item-actions">
                      <div className="qty-controls">
                        <button onClick={() => handleUpdateQty(item.id, -1)} className="qty-btn">
                          <Minus size={10} />
                        </button>
                        <span>{item.qty}</span>
                        <button onClick={() => handleUpdateQty(item.id, 1)} className="qty-btn">
                          <Plus size={10} />
                        </button>
                      </div>

                      <button onClick={() => handleRemove(item.id)} className="bill-item-remove" title="Remover">
                        <Trash2 size={14} />
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="bill-empty-state">
                  <ShoppingCart size={40} className="empty-cart-icon" />
                  <p>Comanda vazia. Selecione os produtos ao lado para lançar.</p>
                </div>
              )}
            </div>

            {/* Payment Method & Total */}
            {waiterCart.length > 0 && (
              <div className="bill-footer">
                <div className="payment-select-section">
                  <label className="section-label">Forma de Pagamento</label>
                  <div className="payment-pills">
                    <button 
                      onClick={() => setPaymentMethod('pix')} 
                      className={`pay-pill ${paymentMethod === 'pix' ? 'active' : ''}`}
                    >
                      PIX
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('credit')} 
                      className={`pay-pill ${paymentMethod === 'credit' ? 'active' : ''}`}
                    >
                      Crédito
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('debit')} 
                      className={`pay-pill ${paymentMethod === 'debit' ? 'active' : ''}`}
                    >
                      Débito
                    </button>
                    <button 
                      onClick={() => setPaymentMethod('cash')} 
                      className={`pay-pill ${paymentMethod === 'cash' ? 'active' : ''}`}
                    >
                      Dinheiro
                    </button>
                  </div>
                </div>

                <div className="bill-total-row">
                  <span>Total do Pedido:</span>
                  <strong className="bill-total-val">R$ {getSubtotal().toFixed(2)}</strong>
                </div>

                <button 
                  onClick={handlePlaceWaiterOrder} 
                  disabled={isSubmitting} 
                  className="neon-btn w-submit-bill-btn"
                >
                  <Send size={16} />
                  <span>{isSubmitting ? 'Enviando...' : 'Lançar para Cozinha'}</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
}
