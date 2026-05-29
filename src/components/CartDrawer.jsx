import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, Trash2, Tag, MapPin, CreditCard, ChevronRight, DollarSign, ArrowRight } from 'lucide-react';
import './CartDrawer.css';

export default function CartDrawer() {
  const { 
    cart, 
    isCartOpen, 
    setIsCartOpen, 
    user,
    updateCartQty, 
    removeFromCart, 
    getCartSubtotal, 
    getCartDiscount, 
    getCartTotal, 
    applyCoupon, 
    activeCoupon, 
    settings, 
    placeOrder,
    showToast
  } = useApp();

  const navigate = useNavigate();

  // Step state: 'cart' or 'checkout' or 'pix-qr' or 'success'
  const [step, setStep] = useState('cart');
  
  // Checkout Form States
  const [couponCode, setCouponCode] = useState('');
  const [deliveryType, setDeliveryType] = useState('delivery'); // 'delivery' or 'takeout'
  const [paymentMethod, setPaymentMethod] = useState('pix'); // 'pix', 'credit', 'debit', 'cash'
  
  const [address, setAddress] = useState({
    street: '',
    number: '',
    neighborhood: '',
    city: 'São Paulo',
    zip: '',
    reference: ''
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdOrder, setCreatedOrder] = useState(null);
  const [guestName, setGuestName] = useState('');
  const [guestPhone, setGuestPhone] = useState('');

  useEffect(() => {
    if (isCartOpen) {
      document.body.classList.add('modal-open');
    } else {
      document.body.classList.remove('modal-open');
    }
    return () => {
      document.body.classList.remove('modal-open');
    };
  }, [isCartOpen]);

  if (!isCartOpen) return null;

  const subtotal = getCartSubtotal();
  const discount = getCartDiscount();
  const deliveryFee = deliveryType === 'delivery' ? (settings.delivery_fee_base || 5.00) : 0;
  const total = getCartTotal();

  const handleApplyCoupon = (e) => {
    e.preventDefault();
    if (!couponCode) return;
    applyCoupon(couponCode);
    setCouponCode('');
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setAddress(prev => ({ ...prev, [name]: value }));
  };

  // Compose structured text message for WhatsApp ordering
  const getWhatsAppMessage = (order) => {
    let msg = `🍔 *NOVO PEDIDO - GORDINHO BURGUER* 🍔\n`;
    msg += `------------------------------------\n`;
    msg += `*Pedido #:${order.order_number}*\n\n`;
    
    order.items.forEach(item => {
      msg += `*${item.qty}x ${item.name}*\n`;
      msg += `   _Tamanho:_ ${item.selectedSize}\n`;
      if (item.selectedAddons.length > 0) {
        msg += `   _Adicionais:_ ${item.selectedAddons.map(a => `${a.name} (+R$ ${a.price.toFixed(2)})`).join(', ')}\n`;
      }
      if (item.notes) {
        msg += `   _Obs:_ "${item.notes}"\n`;
      }
      msg += `   _Preço Unit:_ R$ ${item.unitPrice.toFixed(2)}\n\n`;
    });

    msg += `------------------------------------\n`;
    msg += `*Subtotal:* R$ ${subtotal.toFixed(2)}\n`;
    if (discount > 0) {
      msg += `*Desconto:* - R$ ${discount.toFixed(2)}\n`;
    }
    if (order.delivery_fee > 0) {
      msg += `*Taxa de Entrega:* R$ ${order.delivery_fee.toFixed(2)}\n`;
    }
    msg += `*TOTAL DO PEDIDO:* R$ ${order.total.toFixed(2)}\n\n`;

    msg += `*FORMA DE PAGAMENTO:* ${order.payment_method.toUpperCase()}\n`;
    msg += `*TIPO:* ${order.delivery_type === 'delivery' ? 'Entrega 🛵' : 'Retirada na Loja 🏪'}\n`;
    
    if (order.delivery_type === 'delivery' && order.delivery_address) {
      const addr = order.delivery_address;
      msg += `*ENDEREÇO:* ${addr.street}, nº ${addr.number} - ${addr.neighborhood}, ${addr.city}. CEP: ${addr.zip}\n`;
      if (addr.reference) {
        msg += `*Ponto de Ref:* ${addr.reference}\n`;
      }
    }
    msg += `------------------------------------\n`;
    msg += user
      ? `Acompanhar status do meu pedido em tempo real: ${window.location.origin}/portal`
      : `Para acompanhar o status do pedido, faça login: ${window.location.origin}/login`;

    return encodeURIComponent(msg);
  };

  const handlePlaceOrder = async () => {
    // Basic validation
    if (!user) {
      if (!guestName.trim() || !guestPhone.trim()) {
        showToast('Por favor, preencha seu Nome e WhatsApp/Telefone para continuar.', 'error');
        return;
      }
    }

    if (deliveryType === 'delivery') {
      if (!address.street || !address.number || !address.neighborhood || !address.zip) {
        showToast('Por favor, preencha todos os campos obrigatórios do endereço.', 'error');
        return;
      }
    }

    setIsSubmitting(true);
    try {
      const order = await placeOrder(deliveryType, address, paymentMethod, guestName, guestPhone);
      setCreatedOrder(order);

      if (paymentMethod === 'pix') {
        setStep('pix-qr');
      } else {
        if (user) {
          // Logged-in users can track inside portal
          setIsCartOpen(false);
          setStep('cart');
          navigate('/portal');
        } else {
          // Guest checkout: show success panel and offer login
          setStep('success');
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendWhatsApp = () => {
    if (!createdOrder) return;
    const phone = settings.whatsapp_number || '5511999999999';
    const text = getWhatsAppMessage(createdOrder);
    const url = `https://api.whatsapp.com/send?phone=${phone}&text=${text}`;
    window.open(url, '_blank');
    
    // Close after send — if guest, offer login instead of portal
    if (user) {
      setIsCartOpen(false);
      setStep('cart');
      navigate('/portal');
    } else {
      setStep('success');
    }
  };

  return (
    <div className="cart-drawer-overlay">
      <div className="cart-drawer-backdrop" onClick={() => setIsCartOpen(false)}></div>
      
      <div className="cart-drawer-panel glass-glow">
        {/* Drawer Header */}
        <div className="cart-drawer-header">
          <h2>
            {step === 'cart' && 'Seu Carrinho'}
            {step === 'checkout' && 'Finalizar Pedido'}
            {step === 'pix-qr' && 'Pagamento PIX'}
          </h2>
          <button onClick={() => setIsCartOpen(false)} className="cart-close-btn">
            <X size={22} />
          </button>
        </div>

        {/* --- STEP 1: CART LIST --- */}
        {step === 'cart' && (
          <>
            <div className="cart-items-container">
              {cart.length > 0 ? (
                cart.map(item => (
                  <div key={item.cartItemId} className="cart-item glass">
                    <img src={item.image} alt={item.name} className="cart-item-img" />
                    
                    <div className="cart-item-info">
                      <h4 className="cart-item-name">{item.name}</h4>
                      <p className="cart-item-variant">Tamanho: {item.selectedSize}</p>
                      {item.selectedAddons.length > 0 && (
                        <p className="cart-item-addons">
                          +{item.selectedAddons.map(a => a.name).join(', ')}
                        </p>
                      )}
                      {item.notes && <p className="cart-item-notes">Obs: "{item.notes}"</p>}
                      
                      <div className="cart-item-price-qty">
                        <span className="cart-item-price">R$ {(item.unitPrice * item.qty).toFixed(2)}</span>
                        
                        <div className="qty-controls">
                          <button onClick={() => updateCartQty(item.cartItemId, -1)} className="qty-btn">
                            <Minus size={12} />
                          </button>
                          <span>{item.qty}</span>
                          <button onClick={() => updateCartQty(item.cartItemId, 1)} className="qty-btn">
                            <Plus size={12} />
                          </button>
                        </div>
                      </div>
                    </div>

                    <button onClick={() => removeFromCart(item.cartItemId)} className="cart-item-remove-btn" title="Remover item">
                      <Trash2 size={16} />
                    </button>
                  </div>
                ))
              ) : (
                <div className="cart-empty-state">
                  <p className="cart-empty-emoji">🛒</p>
                  <h3>Seu carrinho está vazio</h3>
                  <p>Adicione um delicioso hambúrguer para começar seu pedido!</p>
                  <button onClick={() => setIsCartOpen(false)} className="neon-btn continue-shopping-btn">
                    Ver Cardápio
                  </button>
                </div>
              )}
            </div>

            {cart.length > 0 && (
              <div className="cart-summary-footer glass">
                {/* Coupon Form */}
                <form onSubmit={handleApplyCoupon} className="coupon-form">
                  <Tag size={16} className="coupon-icon" />
                  <input 
                    type="text" 
                    placeholder="Cupom de Desconto..." 
                    value={couponCode}
                    onChange={(e) => setCouponCode(e.target.value)}
                    className="coupon-input"
                  />
                  <button type="submit" className="coupon-submit">Aplicar</button>
                </form>

                {activeCoupon && (
                  <div className="active-coupon-badge">
                    <span>Cupom 🎫 <strong>{activeCoupon.code}</strong> aplicado (-{activeCoupon.discount_type === 'percentage' ? `${activeCoupon.value}%` : `R$ ${activeCoupon.value.toFixed(2)}`})</span>
                  </div>
                )}

                {/* Subtotal, Discount, Total lines */}
                <div className="cart-totals-lines">
                  <div className="total-line">
                    <span>Subtotal</span>
                    <span>R$ {subtotal.toFixed(2)}</span>
                  </div>
                  {discount > 0 && (
                    <div className="total-line discount">
                      <span>Desconto</span>
                      <span>- R$ {discount.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="total-line">
                    <span>Entrega</span>
                    <span className="text-muted">A calcular</span>
                  </div>
                  <div className="total-line grand-total">
                    <span>Total Estimado</span>
                    <span>R$ {(subtotal - discount).toFixed(2)}</span>
                  </div>
                </div>

                <button onClick={() => setStep('checkout')} className="neon-btn checkout-step-btn">
                  <span>Ir para o Checkout</span>
                  <ChevronRight size={18} />
                </button>
              </div>
            )}
          </>
        )}

        {/* --- STEP 2: CHECKOUT INFO --- */}
        {step === 'checkout' && (
          <div className="checkout-step-container">
            <div className="checkout-scrollable">
              {/* Guest Identification (if not logged in) */}
              {!user && (
                <div className="checkout-card glass">
                  <h3 className="checkout-card-title">👤 Identificação</h3>
                  <div className="address-form-grid" style={{ marginBottom: '1rem' }}>
                    <div className="form-group span-3">
                      <label>Nome Completo *</label>
                      <input 
                        type="text" 
                        value={guestName} 
                        onChange={(e) => setGuestName(e.target.value)} 
                        placeholder="Ex: João Silva" 
                        required 
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px', width: '100%', color: 'white' }}
                      />
                    </div>
                    <div className="form-group span-3">
                      <label>WhatsApp / Celular *</label>
                      <input 
                        type="tel" 
                        value={guestPhone} 
                        onChange={(e) => setGuestPhone(e.target.value)} 
                        placeholder="Ex: (81) 99999-9999" 
                        required 
                        style={{ background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', padding: '0.6rem', borderRadius: '8px', width: '100%', color: 'white' }}
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* Delivery Choice */}
              <div className="checkout-card glass">
                <h3 className="checkout-card-title">🛵 Opção de Entrega</h3>
                <div className="delivery-choice-buttons">
                  <button 
                    onClick={() => setDeliveryType('delivery')}
                    className={`delivery-choice-btn ${deliveryType === 'delivery' ? 'active' : ''}`}
                  >
                    <span>Delivery (Entrega)</span>
                  </button>
                  <button 
                    onClick={() => setDeliveryType('takeout')}
                    className={`delivery-choice-btn ${deliveryType === 'takeout' ? 'active' : ''}`}
                  >
                    <span>Retirar na Loja</span>
                  </button>
                </div>
              </div>

              {/* Delivery Address (if Delivery selected) */}
              {deliveryType === 'delivery' && (
                <div className="checkout-card glass">
                  <h3 className="checkout-card-title">📍 Endereço de Entrega</h3>
                  <div className="address-form-grid">
                    <div className="form-group span-4">
                      <label>Rua *</label>
                      <input type="text" name="street" value={address.street} onChange={handleInputChange} placeholder="Ex: Av. Paulista" required />
                    </div>
                    <div className="form-group span-2">
                      <label>Número *</label>
                      <input type="text" name="number" value={address.number} onChange={handleInputChange} placeholder="123" required />
                    </div>
                    <div className="form-group span-3">
                      <label>Bairro *</label>
                      <input type="text" name="neighborhood" value={address.neighborhood} onChange={handleInputChange} placeholder="Bela Vista" required />
                    </div>
                    <div className="form-group span-3">
                      <label>CEP *</label>
                      <input type="text" name="zip" value={address.zip} onChange={handleInputChange} placeholder="01310-100" required />
                    </div>
                    <div className="form-group span-6">
                      <label>Referência / Apto</label>
                      <input type="text" name="reference" value={address.reference} onChange={handleInputChange} placeholder="Ex: Bloco A Ap 32" />
                    </div>
                  </div>
                </div>
              )}

              {/* Payment Selector */}
              <div className="checkout-card glass">
                <h3 className="checkout-card-title">💳 Método de Pagamento</h3>
                <div className="payment-options-grid">
                  <button 
                    onClick={() => setPaymentMethod('pix')} 
                    className={`payment-option-btn ${paymentMethod === 'pix' ? 'active' : ''}`}
                  >
                    <DollarSign size={16} />
                    <span>Pix (Chave/QR)</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('credit')} 
                    className={`payment-option-btn ${paymentMethod === 'credit' ? 'active' : ''}`}
                  >
                    <CreditCard size={16} />
                    <span>Crédito (Entrega)</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('debit')} 
                    className={`payment-option-btn ${paymentMethod === 'debit' ? 'active' : ''}`}
                  >
                    <CreditCard size={16} />
                    <span>Débito (Entrega)</span>
                  </button>
                  <button 
                    onClick={() => setPaymentMethod('cash')} 
                    className={`payment-option-btn ${paymentMethod === 'cash' ? 'active' : ''}`}
                  >
                    <DollarSign size={16} />
                    <span>Dinheiro</span>
                  </button>
                </div>
              </div>
            </div>

            {/* Sticky summary checkout */}
            <div className="checkout-summary-footer glass">
              <div className="checkout-summary-lines">
                <div className="checkout-line">
                  <span>Subtotal:</span>
                  <span>R$ {subtotal.toFixed(2)}</span>
                </div>
                {discount > 0 && (
                  <div className="checkout-line discount">
                    <span>Desconto (cupom):</span>
                    <span>- R$ {discount.toFixed(2)}</span>
                  </div>
                )}
                <div className="checkout-line">
                  <span>Taxa de Entrega:</span>
                  <span>R$ {deliveryFee.toFixed(2)}</span>
                </div>
                <div className="checkout-line total">
                  <span>Total:</span>
                  <span>R$ {total.toFixed(2)}</span>
                </div>
              </div>

              <div className="checkout-action-row">
                <button onClick={() => setStep('cart')} className="checkout-back-btn">
                  Voltar
                </button>
                
                <button 
                  onClick={handlePlaceOrder} 
                  disabled={isSubmitting} 
                  className="neon-btn checkout-submit-btn"
                >
                  {isSubmitting ? 'Enviando...' : (paymentMethod === 'pix' ? 'Gerar PIX QR' : 'Confirmar Pedido')}
                  <ArrowRight size={18} />
                </button>
              </div>
            </div>
          </div>
        )}

        {/* --- STEP 3: PIX QR CODE SHOWCASE --- */}
        {step === 'pix-qr' && (
          <div className="pix-step-container">
            <div className="pix-qr-box glass">
              <p className="pix-instruction">Escaneie o QR Code abaixo para pagar via Pix</p>
              
              {/* Premium Simulated Pix QR Code */}
              <div className="qr-code-wrapper">
                <div className="qr-code-corners"></div>
                <img 
                  src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=00020101021226380014br.gov.bcb.pix0116${settings.pix_key || 'gordinho@pix.com.br'}5204000053039865405${total.toFixed(2)}5802BR5912GordinhoBurguer6009SaoPaulo62070503***63047248`} 
                  alt="Pix QR Code" 
                  className="pix-qr-img" 
                />
              </div>

              <div className="pix-key-display">
                <span className="key-label">Chave Copie e Cole:</span>
                <input 
                  type="text" 
                  readOnly 
                  value={`00020101021226380014br.gov.bcb.pix0116${settings.pix_key || 'gordinho@pix.com.br'}5204000053039865405${total.toFixed(2)}5802BR5912GordinhoBurguer6009SaoPaulo62070503***63047248`} 
                  className="pix-key-input glass"
                />
                <button 
                  onClick={() => {
                    navigator.clipboard.writeText(`00020101021226380014br.gov.bcb.pix0116${settings.pix_key || 'gordinho@pix.com.br'}5204000053039865405${total.toFixed(2)}5802BR5912GordinhoBurguer6009SaoPaulo62070503***63047248`);
                    alert('Chave Pix copiada com sucesso!');
                  }}
                  className="pix-copy-btn"
                >
                  Copiar Chave
                </button>
              </div>
            </div>

            <div className="pix-actions-footer">
              <p className="pix-timer">⏱️ O QR Code expira em 10 minutos.</p>
              
              <button onClick={handleSendWhatsApp} className="whatsapp-submit-btn">
                <span>Enviar Comprovante p/ WhatsApp</span>
              </button>
              
              <button 
                onClick={() => { 
                  if (user) {
                    setIsCartOpen(false);
                    setStep('cart');
                    navigate('/portal');
                  } else {
                    setStep('success');
                  }
                }} 
                className="pix-continue-btn"
              >
                Acompanhar sem enviar WhatsApp
              </button>
            </div>
          </div>
        )}

        {/* --- STEP 4: GUEST SUCCESS / NEXT STEPS --- */}
        {step === 'success' && createdOrder && (
          <div className="guest-success-step">
            <div className="guest-success-card glass">
              <h3>Pedido #{createdOrder.order_number} criado!</h3>
              <p className="guest-success-sub">
                Você fez o pedido como <strong>convidado</strong>. Se quiser acompanhar o status em tempo real, faça login (ou crie uma conta).
              </p>

              <div className="guest-success-actions">
                <button
                  type="button"
                  className="neon-btn guest-success-login"
                  onClick={() => {
                    setIsCartOpen(false);
                    setStep('cart');
                    navigate('/login');
                  }}
                >
                  Fazer login / Criar conta
                </button>

                <button
                  type="button"
                  className="guest-success-continue"
                  onClick={() => {
                    setIsCartOpen(false);
                    setStep('cart');
                  }}
                >
                  Continuar sem cadastro
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
