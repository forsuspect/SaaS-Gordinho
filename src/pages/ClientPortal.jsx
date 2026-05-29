import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { Package, Clock, MapPin, CreditCard, ChevronRight, RefreshCw, ShoppingBag, CheckCircle } from 'lucide-react';
import './ClientPortal.css';

export default function ClientPortal() {
  const { user, orders, addToCart, setIsCartOpen } = useApp();
  const navigate = useNavigate();

  // If not logged in, redirect
  if (!user) {
    return (
      <div className="portal-unauthorized section-padding">
        <div className="unauth-card glass-glow">
          <p className="lock-emoji">🔒</p>
          <h2>Acesso Restrito</h2>
          <p>Você precisa estar logado para visualizar seus pedidos e acompanhar entregas em tempo real.</p>
          <button onClick={() => navigate('/login')} className="neon-btn unauth-login-btn">
            Fazer Login
          </button>
        </div>
      </div>
    );
  }

  // Filter orders belonging to this user
  const clientOrders = orders.filter(o => o.user_id === user.id);

  // Separate active orders vs history
  const activeOrders = clientOrders.filter(o => 
    ['pending', 'preparing', 'ready', 'shipping'].includes(o.status)
  );

  const orderHistory = clientOrders.filter(o => 
    ['delivered', 'cancelled'].includes(o.status)
  );

  // Status mapping details
  const getStatusDetails = (status) => {
    switch (status) {
      case 'pending': 
        return { label: 'Recebido', desc: 'Seu pedido foi recebido e está aguardando confirmação.', step: 1 };
      case 'preparing': 
        return { label: 'Em Preparo', desc: 'Nossos chefs artesanais já estão grelhando seu blend!', step: 2 };
      case 'ready': 
        return { label: 'Pronto para Retirada', desc: 'Seu pedido já está pronto e embalado no balcão.', step: 3 };
      case 'shipping': 
        return { label: 'Saiu para Entrega', desc: 'O motoboy já coletou seu pedido e está a caminho!', step: 3 };
      case 'delivered': 
        return { label: 'Entregue', desc: 'Pedido entregue! Bom apetite!', step: 4 };
      case 'cancelled': 
        return { label: 'Cancelado', desc: 'Esse pedido foi cancelado.', step: 0 };
      default: 
        return { label: 'Pendente', desc: '', step: 1 };
    }
  };

  // Re-order details item handler
  const handleReorder = (orderItems) => {
    orderItems.forEach(item => {
      // Re-add each item configuration to the active cart context
      const originalProduct = {
        id: item.product_id || item.id,
        name: item.name,
        price: item.price,
        image: item.image || 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
        sizes: [{ name: item.selectedSize, priceModifier: 0 }],
        addons: item.selectedAddons
      };
      addToCart(originalProduct, item.qty, item.selectedSize, item.selectedAddons, item.notes || '');
    });

    setIsCartOpen(true); // Open sidebar cart
  };

  return (
    <>
      <Navbar />
      
      <div className="client-portal-page section-padding">
        <div className="portal-container">
          {/* Header Area */}
          <div className="portal-header">
            <div>
              <span className="welcome-tag">Olá, Bem-vindo(a)</span>
              <h1 className="client-name-title">{user.name}</h1>
            </div>
            
            <div className="client-meta-pill glass">
              <span className="meta-dot"></span>
              <span>Conta de Cliente</span>
            </div>
          </div>

          {/* Active Tracker Sections */}
          {activeOrders.length > 0 && (
            <div className="active-trackers-wrapper">
              <h2 className="portal-section-title">🛵 Acompanhamento em Tempo Real</h2>
              
              {activeOrders.map(order => {
                const statusInfo = getStatusDetails(order.status);
                return (
                  <div key={order.id} className="tracker-card glass-glow">
                    <div className="tracker-card-header">
                      <div>
                        <h3>Pedido #{order.order_number}</h3>
                        <p className="tracker-date">Realizado em {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                      </div>
                      <div className="tracker-status-badge glass">
                        <span>{statusInfo.label}</span>
                      </div>
                    </div>

                    {/* Timeline Tracker Graphic */}
                    <div className="tracker-timeline">
                      <div className={`timeline-step ${statusInfo.step >= 1 ? 'active' : ''}`}>
                        <div className="step-circle">📥</div>
                        <span>Recebido</span>
                      </div>

                      <div className={`timeline-line ${statusInfo.step >= 2 ? 'active' : ''}`}></div>

                      <div className={`timeline-step ${statusInfo.step >= 2 ? 'active' : ''}`}>
                        <div className="step-circle">🔥</div>
                        <span>Preparando</span>
                      </div>

                      <div className={`timeline-line ${statusInfo.step >= 3 ? 'active' : ''}`}></div>

                      <div className={`timeline-step ${statusInfo.step >= 3 ? 'active' : ''}`}>
                        <div className="step-circle">{order.delivery_type === 'delivery' ? '🛵' : '🏪'}</div>
                        <span>{order.delivery_type === 'delivery' ? 'Em trânsito' : 'No Balcão'}</span>
                      </div>

                      <div className={`timeline-line ${statusInfo.step >= 4 ? 'active' : ''}`}></div>

                      <div className={`timeline-step ${statusInfo.step >= 4 ? 'active' : ''}`}>
                        <div className="step-circle">🎉</div>
                        <span>Entregue</span>
                      </div>
                    </div>

                    {/* Tracking details */}
                    <div className="tracker-details">
                      <p className="tracker-desc-text">📢 {statusInfo.desc}</p>
                      
                      <div className="tracker-details-list">
                        {order.waiter_name && (
                          <div className="tracker-waiter-info" style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '0.8rem' }}>
                            <span>💁 Atendido por:</span>
                            <strong>{order.waiter_name}</strong>
                          </div>
                        )}
                        <h4>Itens Pedidos:</h4>
                        <ul>
                          {order.items.map((item, idx) => (
                            <li key={idx}>
                              <strong>{item.qty}x</strong> {item.name} ({item.selectedSize})
                            </li>
                          ))}
                        </ul>
                        <div className="tracker-total">
                          <span>Total Pago:</span>
                          <strong>R$ {order.total.toFixed(2)}</strong>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* History Section */}
          <div className="portal-history-section">
            <h2 className="portal-section-title">⏳ Histórico de Pedidos</h2>

            {orderHistory.length > 0 ? (
              <div className="history-list">
                {orderHistory.map(order => (
                  <div key={order.id} className="history-row glass">
                    <div className="history-header">
                      <div className="history-num-date">
                        <Package size={20} className="history-icon" />
                        <div>
                          <h4>Pedido #{order.order_number}</h4>
                          <p>{new Date(order.created_at).toLocaleDateString()} às {new Date(order.created_at).toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}</p>
                        </div>
                      </div>

                      <span className={`history-status ${order.status}`}>
                        {order.status === 'delivered' ? 'Entregue ✓' : 'Cancelado ❌'}
                      </span>
                    </div>

                    {/* Items summaries */}
                    <div className="history-body">
                      <p className="history-items-summary">
                        {order.items.map(i => `${i.qty}x ${i.name}`).join(', ')}
                      </p>
                      
                      <div className="history-totals-reorder">
                        <span className="history-price">Total: R$ {order.total.toFixed(2)}</span>
                        
                        <button 
                          onClick={() => handleReorder(order.items)} 
                          className="reorder-btn"
                          title="Adicionar estes mesmos itens ao carrinho"
                        >
                          <RefreshCw size={12} />
                          <span>Repetir Pedido</span>
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="history-empty glass">
                <CheckCircle size={32} className="history-empty-icon" />
                <h3>Nenhum pedido anterior</h3>
                <p>Assim que seus pedidos finalizarem, eles aparecerão catalogados aqui no seu histórico.</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </>
  );
}
