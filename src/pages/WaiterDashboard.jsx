import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { 
  ShoppingCart, Plus, Minus, Trash2, Send, RefreshCw, Layers, CheckCircle2, User, 
  Flame, CupSoda, Utensils, Sparkles, Filter 
} from 'lucide-react';
import './WaiterDashboard.css';

export default function WaiterDashboard() {
  const { user, products, categories, orders, updateOrderStatus, showToast, refreshOrders } = useApp();
  const navigate = useNavigate();

  // Helper to map icon names to Lucide icons
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={14} />;
      case 'Flame': return <Flame size={14} />;
      case 'Utensils': return <Utensils size={14} />;
      case 'CupSoda': return <CupSoda size={14} />;
      default: return <Filter size={14} />;
    }
  };

  // Route security: only admins or employees (vendedores/garçons) can access
  const isStaff = user?.role === 'employee' || user?.role === 'admin';

  // State
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [tableNumber, setTableNumber] = useState('');
  const [clientName, setClientName] = useState('');
  const [waiterName, setWaiterName] = useState(user?.name || '');
  const [waiterCart, setWaiterCart] = useState([]);
  const [paymentMethod, setPaymentMethod] = useState('pix'); // pix, credit, debit, cash
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [waiterTab, setWaiterTab] = useState('menu'); // 'menu' or 'tables'
  const [editingOrderId, setEditingOrderId] = useState(null);
  const [finalizeModal, setFinalizeModal] = useState({
    isOpen: false,
    order: null,
    paymentMethod: 'pix'
  });

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

  // Helper to detect table order
  const isTableOrder = (order) => {
    if (!order.delivery_address) return false;
    let addr = order.delivery_address;
    if (typeof addr === 'string' && addr.trim().startsWith('{')) {
      try { addr = JSON.parse(addr); } catch (_) {}
    }
    if (typeof addr === 'string') {
      return addr.toUpperCase().startsWith('MESA:');
    }
    if (typeof addr === 'object' && addr !== null) {
      if (addr.table) return true;
      if (addr.street && typeof addr.street === 'string') {
        return addr.street.toUpperCase().startsWith('MESA:');
      }
    }
    return false;
  };

  // Helper to extract table number safely
  const getTableNumberStr = (order) => {
    if (!order.delivery_address) return '—';
    let addr = order.delivery_address;
    if (typeof addr === 'string' && addr.trim().startsWith('{')) {
      try { addr = JSON.parse(addr); } catch (_) {}
    }
    if (typeof addr === 'string') {
      return addr.toUpperCase().replace('MESA:', '').trim();
    }
    if (typeof addr === 'object' && addr !== null) {
      if (addr.table) return String(addr.table);
      if (addr.street && typeof addr.street === 'string') {
        return addr.street.toUpperCase().replace('MESA:', '').trim();
      }
    }
    return '—';
  };

  // Active table orders filter
  const activeTableOrders = orders.filter(o => 
    isTableOrder(o) && 
    o.status !== 'delivered' && 
    o.status !== 'cancelled'
  );

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
        selectedAddons: [],
        notes: ''
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

  const handleUpdateNotes = (productId, notes) => {
    setWaiterCart(prev => prev.map(item => {
      if (item.id === productId) {
        return { ...item, notes };
      }
      return item;
    }));
  };

  const handleRemove = (productId) => {
    setWaiterCart(prev => prev.filter(item => item.id !== productId));
    showToast('Item removido da comanda.', 'info');
  };

  const getSubtotal = () => waiterCart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  // Table management helpers
  const handleEditTable = (order) => {
    setEditingOrderId(order.id);
    const tableNum = getTableNumberStr(order);
    setTableNumber(tableNum !== '—' ? tableNum : '');
    setClientName(order.client_name || '');
    setWaiterName(order.waiter_name || user?.name || '');
    
    setWaiterCart(order.items.map(item => ({
      id: item.id,
      name: item.name,
      price: item.price || item.unitPrice || 0,
      image: item.image,
      qty: item.qty,
      selectedSize: item.selectedSize || 'Padrão',
      selectedAddons: item.selectedAddons || [],
      notes: item.notes || ''
    })));
    
    setWaiterTab('menu');
    showToast(`Editando o pedido da Mesa ${tableNum !== '—' ? tableNum : ''}!`, 'info');
  };

  const handleOpenFinalize = (order) => {
    setFinalizeModal({
      isOpen: true,
      order: order,
      paymentMethod: order.payment_method || 'pix'
    });
  };

  const handleConcludeTable = async () => {
    const { order, paymentMethod: finalPaymentMethod } = finalizeModal;
    if (!order) return;

    try {
      const { dbService } = await import('../services/db');
      const updatedOrder = {
        ...order,
        status: 'delivered', // complete
        payment_method: finalPaymentMethod,
        updated_at: new Date().toISOString()
      };
      
      await dbService.saveOrder(updatedOrder);
      
      if (refreshOrders) {
        await refreshOrders();
      }
      
      showToast(`Mesa finalizada com sucesso! Conta fechada no ${finalPaymentMethod.toUpperCase()}.`, 'success');
      setFinalizeModal({ isOpen: false, order: null, paymentMethod: 'pix' });
    } catch (err) {
      console.error(err);
      showToast('Erro ao finalizar mesa.', 'error');
    }
  };

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
      const { dbService } = await import('../services/db');
      
      if (editingOrderId) {
        const existingOrder = orders.find(o => o.id === editingOrderId);
        if (existingOrder) {
          const updatedOrder = {
            ...existingOrder,
            client_name: clientName.trim() ? clientName : `Mesa ${tableNumber}`,
            items: waiterCart.map(item => ({
              ...item,
              cartItemId: item.cartItemId || `${item.id}-Padrão--`,
              unitPrice: item.price
            })),
            delivery_address: tableNumber.trim() 
              ? { table: tableNumber.trim(), street: `MESA: ${tableNumber.trim()}` } 
              : { street: 'Balcão/Salão' },
            total: getSubtotal(),
            payment_method: paymentMethod,
            waiter_name: waiterName.trim() || user?.name || '',
            updated_at: new Date().toISOString()
          };
          
          await dbService.saveOrder(updatedOrder);
          showToast(`Pedido da ${targetLabel} atualizado com sucesso!`, 'success');
        }
        setEditingOrderId(null);
      } else {
        const orderData = {
          user_id: 'usr-waiter-' + user.id,
          client_name: clientName.trim() ? clientName : `Mesa ${tableNumber}`,
          client_phone: 'Atendimento Local',
          items: waiterCart.map(item => ({
            ...item,
            cartItemId: `${item.id}-Padrão--`,
            unitPrice: item.price
          })),
          delivery_type: 'takeout',
          delivery_address: tableNumber.trim() 
            ? { table: tableNumber.trim(), street: `MESA: ${tableNumber.trim()}` } 
            : { street: 'Balcão/Salão' },
          delivery_fee: 0,
          discount: 0,
          total: getSubtotal(),
          payment_method: paymentMethod,
          status: 'pending',
          waiter_name: waiterName.trim() || user?.name || ''
        };

        await dbService.saveOrder(orderData);
        showToast(`Pedido para ${targetLabel} enviado para a cozinha!`, 'success');
      }
      
      if (refreshOrders) {
        await refreshOrders();
      }
      
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
        </div>

        <div className="waiter-layout-grid">
          {/* LEFT: PRODUCTS SELECTION */}
          <div className="waiter-products-pane glass">
            <div className="waiter-categories-nav">
              <button 
                onClick={() => setSelectedCategory('all')} 
                className={`category-pill ${selectedCategory === 'all' ? 'active' : ''}`}
              >
                <Filter size={14} />
                <span>Todos</span>
              </button>
              {categories.map(cat => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`category-pill ${selectedCategory === cat.id ? 'active' : ''}`}
                >
                  {getCategoryIcon(cat.icon)}
                  <span>{cat.name}</span>
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

          {/* RIGHT: BILL + TABLES TABS */}
          <div className="waiter-right-pane">

            {/* Tab Toggle */}
            <div className="waiter-right-tabs glass">
              <button
                onClick={() => setWaiterTab('menu')}
                className={`waiter-rtab ${waiterTab === 'menu' ? 'active' : ''}`}
              >
                <Layers size={15} />
                <span>{editingOrderId ? '✏️ Editando Mesa' : 'Nova Comanda'}</span>
              </button>
              <button
                onClick={() => setWaiterTab('tables')}
                className={`waiter-rtab ${waiterTab === 'tables' ? 'active' : ''}`}
              >
                <User size={15} />
                <span>Mesas em Atendimento</span>
                {activeTableOrders.length > 0 && (
                  <span className="tables-badge">{activeTableOrders.length}</span>
                )}
              </button>
            </div>

            {/* -------- MENU / COMANDA TAB -------- */}
            {waiterTab === 'menu' && (
              <div className="waiter-bill-pane glass-glow">
                <div className="bill-header">
                  <h3>{editingOrderId ? 'Editando Comanda' : 'Nova Comanda'}</h3>
                  <span className="items-count">{waiterCart.reduce((sum, i) => sum + i.qty, 0)} itens</span>
                </div>

                {editingOrderId && (
                  <div className="editing-banner">
                    <RefreshCw size={13} />
                    <span>Modo edição ativo — clique em "Salvar Alterações"</span>
                    <button
                      onClick={() => {
                        setEditingOrderId(null);
                        setWaiterCart([]);
                        setTableNumber('');
                        setClientName('');
                      }}
                      className="cancel-edit-btn"
                    >
                      Cancelar
                    </button>
                  </div>
                )}

                {/* Table, Client and Salesperson Inputs */}
                <div className="bill-meta-inputs">
                  <div className="meta-input-group" style={{ minWidth: '80px', flex: '1 1 80px' }}>
                    <label>Mesa</label>
                    <input 
                      type="text" 
                      value={tableNumber} 
                      onChange={(e) => setTableNumber(e.target.value)} 
                      placeholder="Ex: 05" 
                    />
                  </div>
                  <div className="meta-input-group" style={{ minWidth: '130px', flex: '1 1 130px' }}>
                    <label>Cliente (Opcional)</label>
                    <input 
                      type="text" 
                      value={clientName} 
                      onChange={(e) => setClientName(e.target.value)} 
                      placeholder="Ex: Carlos" 
                    />
                  </div>
                  <div className="meta-input-group" style={{ minWidth: '130px', flex: '1 1 130px' }}>
                    <label>Atendente / Vendedor</label>
                    <input 
                      type="text" 
                      value={waiterName} 
                      onChange={(e) => setWaiterName(e.target.value)} 
                      placeholder="Ex: Pedro" 
                    />
                  </div>
                </div>

                {/* Bill items */}
                <div className="bill-items-list">
                  {waiterCart.length > 0 ? (
                    waiterCart.map(item => (
                      <div key={item.id} className="bill-item glass">
                        <div className="bill-item-row-top" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%' }}>
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
                        
                        <div className="bill-item-note-row" style={{ marginTop: '0.4rem', borderTop: '1px solid rgba(255, 255, 255, 0.03)', paddingTop: '0.4rem' }}>
                          <input 
                            type="text" 
                            value={item.notes || ''} 
                            onChange={(e) => handleUpdateNotes(item.id, e.target.value)} 
                            placeholder="Obs: Sem cebola, bem passado..." 
                            className="bill-item-note-input"
                            style={{
                              width: '100%',
                              background: 'rgba(255, 255, 255, 0.02)',
                              border: '1px solid rgba(255, 255, 255, 0.05)',
                              borderRadius: '6px',
                              padding: '0.35rem 0.6rem',
                              fontSize: '0.75rem',
                              color: 'rgba(255, 255, 255, 0.7)',
                              outline: 'none'
                            }}
                          />
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
                        <button onClick={() => setPaymentMethod('pix')} className={`pay-pill ${paymentMethod === 'pix' ? 'active' : ''}`}>PIX</button>
                        <button onClick={() => setPaymentMethod('credit')} className={`pay-pill ${paymentMethod === 'credit' ? 'active' : ''}`}>Crédito</button>
                        <button onClick={() => setPaymentMethod('debit')} className={`pay-pill ${paymentMethod === 'debit' ? 'active' : ''}`}>Débito</button>
                        <button onClick={() => setPaymentMethod('cash')} className={`pay-pill ${paymentMethod === 'cash' ? 'active' : ''}`}>Dinheiro</button>
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
                      <span>{isSubmitting ? 'Enviando...' : editingOrderId ? 'Salvar Alterações' : 'Lançar para Cozinha'}</span>
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* -------- TABLES MANAGEMENT TAB -------- */}
            {waiterTab === 'tables' && (
              <div className="waiter-tables-pane glass-glow">
                <div className="bill-header">
                  <h3>Mesas em Atendimento</h3>
                  <span className="items-count">{activeTableOrders.length} ativa{activeTableOrders.length !== 1 ? 's' : ''}</span>
                </div>

                {activeTableOrders.length === 0 ? (
                  <div className="bill-empty-state">
                    <CheckCircle2 size={40} className="empty-cart-icon" style={{ color: 'var(--accent-green)' }} />
                    <p>Nenhuma mesa em atendimento no momento.</p>
                  </div>
                ) : (
                  <div className="tables-list">
                    {activeTableOrders.map(order => {
                      const tableNum = getTableNumberStr(order);
                      const statusLabel = {
                        pending: { text: 'Aguardando', color: '#f0a500' },
                        preparing: { text: 'Preparando', color: '#3b9eff' },
                        ready: { text: 'Pronto', color: '#00e676' },
                      }[order.status] || { text: order.status, color: '#aaa' };

                      return (
                        <div key={order.id} className="table-order-card glass">
                          <div className="table-card-header">
                            <div className="table-number-badge">Mesa {tableNum}</div>
                            <span className="table-status-chip" style={{ color: statusLabel.color, borderColor: statusLabel.color }}>
                              {statusLabel.text}
                            </span>
                          </div>

                          <div className="table-card-body">
                            <p className="table-client-name">
                              <User size={13} /> {order.client_name}
                            </p>
                            <div className="table-items-summary">
                              {order.items.slice(0, 3).map((item, idx) => (
                                <span key={idx} className="table-item-pill">
                                  {item.qty}x {item.name}
                                </span>
                              ))}
                              {order.items.length > 3 && (
                                <span className="table-item-pill more">+{order.items.length - 3} itens</span>
                              )}
                            </div>
                          </div>

                          <div className="table-card-footer">
                            <span className="table-total">R$ {Number(order.total).toFixed(2)}</span>
                            <div className="table-actions">
                              <button
                                onClick={() => handleEditTable(order)}
                                className="table-action-btn edit"
                                title="Editar Pedido"
                              >
                                <RefreshCw size={14} />
                                <span>Editar</span>
                              </button>
                              <button
                                onClick={() => handleOpenFinalize(order)}
                                className="table-action-btn finalize"
                                title="Fechar Mesa"
                              >
                                <CheckCircle2 size={14} />
                                <span>Fechar Mesa</span>
                              </button>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>

      {/* -------- FINALIZE TABLE MODAL -------- */}
      {finalizeModal.isOpen && finalizeModal.order && (
        <div className="finalize-modal-overlay">
          <div className="finalize-modal-card glass-glow">
            <div className="finalize-modal-icon">
              <CheckCircle2 size={34} />
            </div>
            <h3 className="finalize-modal-title">Fechar Mesa</h3>
            <p className="finalize-modal-sub">
              Mesa {getTableNumberStr(finalizeModal.order)}
              {' '} · {' '} <strong>{finalizeModal.order.client_name}</strong>
            </p>

            {/* Items recap */}
            <div className="finalize-items-recap">
              {finalizeModal.order.items.map((item, idx) => (
                <div key={idx} className="finalize-recap-row">
                  <span>{item.qty}x {item.name}</span>
                  <span>R$ {(Number(item.price || item.unitPrice || 0) * item.qty).toFixed(2)}</span>
                </div>
              ))}
              <div className="finalize-recap-total">
                <span>Total</span>
                <strong>R$ {Number(finalizeModal.order.total).toFixed(2)}</strong>
              </div>
            </div>

            {/* Payment selection */}
            <div className="finalize-payment-section">
              <label>Forma de Pagamento</label>
              <div className="payment-pills">
                {['pix', 'credit', 'debit', 'cash'].map(m => (
                  <button
                    key={m}
                    onClick={() => setFinalizeModal(prev => ({ ...prev, paymentMethod: m }))}
                    className={`pay-pill ${finalizeModal.paymentMethod === m ? 'active' : ''}`}
                  >
                    {{ pix: 'PIX', credit: 'Crédito', debit: 'Débito', cash: 'Dinheiro' }[m]}
                  </button>
                ))}
              </div>
            </div>

            <div className="finalize-modal-actions">
              <button
                onClick={() => setFinalizeModal({ isOpen: false, order: null, paymentMethod: 'pix' })}
                className="custom-confirm-btn cancel"
              >
                Cancelar
              </button>
              <button onClick={handleConcludeTable} className="custom-confirm-btn finalize-confirm">
                <CheckCircle2 size={15} /> Confirmar Fechamento
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
