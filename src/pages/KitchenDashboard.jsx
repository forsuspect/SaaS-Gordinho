import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import Navbar from '../components/Navbar';
import { Printer, Check, Play, Truck, ChevronRight, XCircle, LogOut } from 'lucide-react';
import './KitchenDashboard.css';

export default function KitchenDashboard() {
  const { user, orders, updateOrderStatus, logout } = useApp();
  const navigate = useNavigate();

  // Selected order to print (renders in the hidden printable thermal ticket container)
  const [printOrder, setPrintOrder] = useState(null);
  
  // Kitchen-only live notification for new orders
  const [activeNotification, setActiveNotification] = useState(null);
  const knownOrderIdsRef = React.useRef(new Set(orders.map(o => o.id)));

  React.useEffect(() => {
    if (orders.length > 0) {
      // Find orders that are not in the known set
      const newOrders = orders.filter(o => !knownOrderIdsRef.current.has(o.id));
      
      if (newOrders.length > 0) {
        const latestNewOrder = newOrders[newOrders.length - 1];
        
        // Trigger alert only for fresh pending orders
        if (latestNewOrder.status === 'pending') {
          setActiveNotification(latestNewOrder);
          
          // Sound alert specifically inside kitchen
          try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            
            const playTone = (freq, startTime, duration, vol = 0.8) => {
              const osc = audioCtx.createOscillator();
              const gain = audioCtx.createGain();
              osc.type = 'triangle'; // triangle is much fuller and louder than sine
              osc.frequency.setValueAtTime(freq, startTime);
              gain.gain.setValueAtTime(vol, startTime);
              gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
              osc.connect(gain);
              gain.connect(audioCtx.destination);
              osc.start(startTime);
              osc.stop(startTime + duration);
            };

            const now = audioCtx.currentTime;
            // High-volume, rich, long operational quadruple chime sequence
            playTone(523.25, now, 0.6, 0.85);       // C5 - 600ms
            playTone(659.25, now + 0.3, 0.6, 0.85); // E5 - 600ms
            playTone(783.99, now + 0.6, 0.8, 0.85); // G5 - 800ms
            playTone(1046.50, now + 0.9, 1.4, 0.95); // C6 - 1.4s (High sustain bell)
          } catch (e) {
            console.warn('Audio play blocked:', e);
          }
        }
        
        // Mark all current order IDs as known
        orders.forEach(o => knownOrderIdsRef.current.add(o.id));
      }
    }
  }, [orders]);

  // Unauthorized page if user is not employee or admin
  const isStaff = user?.role === 'employee' || user?.role === 'admin';
  
  if (!user || !isStaff) {
    return (
      <div className="portal-unauthorized section-padding">
        <div className="unauth-card glass-glow">
          <p className="lock-emoji">🔒</p>
          <h2>Acesso de Funcionário</h2>
          <p>Você precisa estar logado com credenciais de cozinha ou administração para visualizar a tela operacional.</p>
          <button onClick={() => navigate('/login')} className="neon-btn unauth-login-btn">
            Acessar com Credenciais
          </button>
        </div>
      </div>
    );
  }

  // Active kitchen orders (excluding delivered and cancelled)
  const kitchenOrders = orders.filter(o => 
    ['pending', 'preparing', 'ready', 'shipping'].includes(o.status)
  );

  // Divide orders into kitchen Kanban stages
  const pendingOrders = kitchenOrders.filter(o => o.status === 'pending');
  const preparingOrders = kitchenOrders.filter(o => o.status === 'preparing');
  const finishedOrders = kitchenOrders.filter(o => ['ready', 'shipping'].includes(o.status));

  // Trigger Native browser printing flow
  const handlePrintFlow = (order) => {
    setPrintOrder(order);
    
    // Brief delay to let React update the DOM print template, then trigger window.print()
    setTimeout(() => {
      window.print();
    }, 150);
  };

  return (
    <>
      <Navbar />

      <div className="kitchen-dashboard-page section-padding">
        {/* Sub-header controls */}
        <div className="kitchen-header">
          <div>
            <h1 className="kitchen-title">Painel Operacional da Cozinha</h1>
            <p className="kitchen-subtitle">Monitore os preparos na grelha e despache entregas em tempo real.</p>
          </div>
          
          <div className="kitchen-staff-actions">
            <div className="staff-indicator glass">
              <span className="blink-green-dot"></span>
              <span>Cozinha Online</span>
            </div>
            
            <button onClick={() => { navigate('/login'); logout(); }} className="staff-logout-btn" title="Desconectar">
              <LogOut size={16} />
              <span>Sair</span>
            </button>
          </div>
        </div>

        {/* 3-Column Kitchen optimized Board */}
        <div className="kitchen-kanban-board">
          
          {/* COLUMN 1: PENDENTES (Aguardando Confirmação) */}
          <div className="kanban-column pending">
            <div className="column-header">
              <h3>📥 Pendentes ({pendingOrders.length})</h3>
            </div>
            
            <div className="column-orders-list">
              {pendingOrders.map(order => (
                <div key={order.id} className="kitchen-order-card glass">
                  <div className="order-card-header">
                    <h4>Pedido #{order.order_number}</h4>
                    <span className="order-time">{new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>
                  
                  <div className="order-card-body">
                    <p className="client-meta">👤 {order.client_name} • {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Atendimento Local'}</p>
                    {order.waiter_name && (
                      <p className="waiter-meta" style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                        💁 Atendente: <strong>{order.waiter_name}</strong>
                      </p>
                    )}
                    
                    <ul className="order-items-list">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.qty}x</strong> {item.name} ({item.selectedSize})
                          {item.selectedAddons.length > 0 && (
                            <span className="item-addon-txt"> (+ {item.selectedAddons.map(a=>a.name).join(', ')})</span>
                          )}
                          {item.notes && <p className="item-note">Obs: "{item.notes}"</p>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-card-actions">
                    <button onClick={() => handlePrintFlow(order)} className="action-icon-btn print-btn" title="Imprimir cupom térmico">
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>
                    
                    <button onClick={() => updateOrderStatus(order.id, 'preparing')} className="action-icon-btn confirm-btn">
                      <Play size={16} />
                      <span>Preparar</span>
                    </button>
                  </div>
                </div>
              ))}
              {pendingOrders.length === 0 && <p className="column-empty">Nenhum pedido novo pendente.</p>}
            </div>
          </div>

          {/* COLUMN 2: EM PREPARO (Na Grelha) */}
          <div className="kanban-column preparing">
            <div className="column-header">
              <h3>🔥 Na Grelha ({preparingOrders.length})</h3>
            </div>

            <div className="column-orders-list">
              {preparingOrders.map(order => (
                <div key={order.id} className="kitchen-order-card glass accent-preparing">
                  <div className="order-card-header">
                    <h4>Pedido #{order.order_number}</h4>
                    <span className="order-time">{new Date(order.created_at).toLocaleTimeString([], {hour:'2-digit', minute:'2-digit'})}</span>
                  </div>

                  <div className="order-card-body">
                    <p className="client-meta">👤 {order.client_name} • {order.delivery_type === 'delivery' ? '🛵 Entrega' : '🏪 Atendimento Local'}</p>
                    {order.waiter_name && (
                      <p className="waiter-meta" style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                        💁 Atendente: <strong>{order.waiter_name}</strong>
                      </p>
                    )}

                    <ul className="order-items-list">
                      {order.items.map((item, idx) => (
                        <li key={idx}>
                          <strong>{item.qty}x</strong> {item.name} ({item.selectedSize})
                          {item.selectedAddons.length > 0 && (
                            <span className="item-addon-txt"> (+ {item.selectedAddons.map(a=>a.name).join(', ')})</span>
                          )}
                          {item.notes && <p className="item-note">Obs: "{item.notes}"</p>}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="order-card-actions">
                    <button onClick={() => handlePrintFlow(order)} className="action-icon-btn print-btn">
                      <Printer size={16} />
                      <span>Imprimir</span>
                    </button>

                    <button 
                      onClick={() => updateOrderStatus(order.id, order.delivery_type === 'delivery' ? 'shipping' : 'ready')} 
                      className="action-icon-btn ready-btn"
                    >
                      <Check size={16} />
                      <span>Finalizar</span>
                    </button>
                  </div>
                </div>
              ))}
              {preparingOrders.length === 0 && <p className="column-empty">Nenhum burger na grelha no momento.</p>}
            </div>
          </div>

          {/* COLUMN 3: PRONTOS / ENVIADOS */}
          <div className="kanban-column finished">
            <div className="column-header">
              <h3>🛵 Despachados / Prontos ({finishedOrders.length})</h3>
            </div>

            <div className="column-orders-list">
              {finishedOrders.map(order => (
                <div key={order.id} className="kitchen-order-card glass accent-finished">
                  <div className="order-card-header">
                    <h4>Pedido #{order.order_number}</h4>
                    <span className="badge-type">{order.delivery_type === 'delivery' ? 'Em Entrega' : 'Pronto p/ Retirada'}</span>
                  </div>

                  <div className="order-card-body">
                    <p className="client-meta">👤 {order.client_name} ({order.client_phone})</p>
                    {order.waiter_name && (
                      <p className="waiter-meta" style={{ fontSize: '0.78rem', color: 'rgba(255, 255, 255, 0.5)', marginTop: '0.2rem', marginBottom: '0.4rem' }}>
                        💁 Atendente: <strong>{order.waiter_name}</strong>
                      </p>
                    )}
                    
                    {order.delivery_type === 'delivery' && order.delivery_address && (
                      <p className="delivery-meta-address">📍 {order.delivery_address.street}, {order.delivery_address.number}</p>
                    )}
                  </div>

                  <div className="order-card-actions">
                    <button onClick={() => handlePrintFlow(order)} className="action-icon-btn print-btn">
                      <Printer size={16} />
                      <span>Reimprimir</span>
                    </button>

                    <button onClick={() => updateOrderStatus(order.id, 'delivered')} className="action-icon-btn delivered-btn">
                      <Check size={16} />
                      <span>Entregue ✓</span>
                    </button>
                  </div>
                </div>
              ))}
              {finishedOrders.length === 0 && <p className="column-empty">Nenhum pedido finalizado pendente de despacho.</p>}
            </div>
          </div>

        </div>
      </div>

      {/* --- HIDDEN THERMAL RECEIPT PRINT AREA (Visible ONLY during window.print()) --- */}
      {/* NOTE: keep this div as a direct child of the fragment so @media print can show it
           while hiding only the specific dashboard elements above, not all of #root */}
      {printOrder && (
        <div id="thermal-receipt-print-area">
          <div className="receipt-align-center">
            <h2 className="receipt-brand">GORDINHO BURGUER</h2>
            <p className="receipt-meta">Av. Paulista, 1000 - SP/SP</p>
            <p className="receipt-meta">WhatsApp: (11) 99999-9999</p>
            <p className="divider-line">================================</p>
            <h3 className="receipt-order-title">CUPOM DE ENTREGA</h3>
            <h2 className="receipt-order-num">PEDIDO Nº {printOrder.order_number}</h2>
            <p className="receipt-meta">Data: {new Date(printOrder.created_at).toLocaleDateString()} {new Date(printOrder.created_at).toLocaleTimeString()}</p>
            <p className="divider-line">================================</p>
          </div>

          <div className="receipt-section">
            <p><strong>CLIENTE:</strong> {printOrder.client_name}</p>
            <p><strong>FONE:</strong> {printOrder.client_phone}</p>
            <p><strong>TIPO:</strong> {printOrder.delivery_type === 'delivery' ? 'ENTREGA À DOMICÍLIO' : 'RETIRADA NA LOJA'}</p>
            {printOrder.waiter_name && (
              <p><strong>ATENDENTE:</strong> {printOrder.waiter_name.toUpperCase()}</p>
            )}
            
            {printOrder.delivery_type === 'delivery' && printOrder.delivery_address && (
              <p>
                <strong>ENDEREÇO:</strong> {printOrder.delivery_address.street}, {printOrder.delivery_address.number} - {printOrder.delivery_address.neighborhood}, {printOrder.delivery_address.city}. CEP: {printOrder.delivery_address.zip}
                {printOrder.delivery_address.reference && ` (${printOrder.delivery_address.reference})`}
              </p>
            )}
          </div>

          <p className="divider-line">--------------------------------</p>
          <div className="receipt-items-section">
            <div className="receipt-item-row-header">
              <span className="item-row-qty">QTD</span>
              <span className="item-row-desc">ITEM/DETALHE</span>
              <span className="item-row-total">TOTAL</span>
            </div>
            
            {printOrder.items.map((item, idx) => (
              <div key={idx} className="receipt-item-row">
                <span className="item-row-qty">{item.qty}x</span>
                <div className="item-row-desc-details">
                  <span className="item-desc-name">{item.name} ({item.selectedSize})</span>
                  {item.selectedAddons.length > 0 && (
                    <span className="item-desc-addons"> + {item.selectedAddons.map(a => `${a.name} (+R$ ${a.price.toFixed(2)})`).join(', ')}</span>
                  )}
                  {item.notes && <span className="item-desc-note"> Obs: "{item.notes}"</span>}
                </div>
                <span className="item-row-total">R$ {(item.unitPrice * item.qty).toFixed(2)}</span>
              </div>
            ))}
          </div>

          <p className="divider-line">--------------------------------</p>
          <div className="receipt-financial-section">
            <div className="financial-row">
              <span>SUBTOTAL:</span>
              <span>R$ {(printOrder.total - printOrder.delivery_fee + printOrder.discount).toFixed(2)}</span>
            </div>
            {printOrder.discount > 0 && (
              <div className="financial-row text-discount">
                <span>DESCONTO (CUPOM):</span>
                <span>- R$ {printOrder.discount.toFixed(2)}</span>
              </div>
            )}
            <div className="financial-row">
              <span>TAXA ENTREGA:</span>
              <span>R$ {printOrder.delivery_fee.toFixed(2)}</span>
            </div>
            <div className="financial-row total-large">
              <span>TOTAL GERAL:</span>
              <span>R$ {printOrder.total.toFixed(2)}</span>
            </div>
            <p className="financial-row">
              <strong>PAGAMENTO:</strong> {printOrder.payment_method.toUpperCase()}
            </p>
          </div>

          <p className="divider-line">================================</p>
          
          <div className="receipt-align-center">
            <p className="receipt-qrcode-label">Acompanhe seu pedido pelo celular</p>
            {/* Dynamic visual printable QR code using standard google chart api for receipt scan compatibility! */}
            <img 
              src={`https://api.qrserver.com/v1/create-qr-code/?size=100x100&data=${window.location.origin}/portal`} 
              alt="Receipt Status Tracking QR Code" 
              className="receipt-qrcode-img"
            />
            <p className="receipt-footer-txt">Obrigado pela preferência!</p>
            <p className="receipt-footer-txt">Gordinho Burguer artesanal grelhado no fogo</p>
          </div>
        </div>
      )}

      {/* --- KITCHEN INCOMING ORDER FLASH NOTIFICATION MODAL --- */}
      {activeNotification && (
        <div className="kitchen-alert-overlay">
          <div className="kitchen-alert-modal glass-glow">
            <div className="alert-badge-incoming">📥 NOVO PEDIDO CHEGOU!</div>
            
            <div className="alert-content-box">
              <h2 className="alert-order-number">Pedido #{activeNotification.order_number}</h2>
              <p className="alert-client-name">👤 {activeNotification.client_name}</p>
              <span className="alert-delivery-badge">{activeNotification.delivery_type === 'delivery' ? '🛵 Delivery' : '🏪 Atendimento Local'}</span>
              
              <div className="alert-items-list-wrap">
                <ul>
                  {activeNotification.items.map((item, idx) => (
                    <li key={idx}>
                      <strong>{item.qty}x</strong> {item.name} ({item.selectedSize})
                    </li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="alert-action-row">
              <button 
                onClick={() => {
                  updateOrderStatus(activeNotification.id, 'preparing');
                  setActiveNotification(null);
                }} 
                className="neon-btn alert-action-btn alert-accept"
              >
                🔥 Iniciar Preparo
              </button>
              
              <button 
                onClick={() => setActiveNotification(null)} 
                className="alert-action-btn alert-dismiss"
              >
                Ciente
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
