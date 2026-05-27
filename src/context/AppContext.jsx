import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { dbService } from '../services/db';

const AppContext = createContext();

export function AppProvider({ children }) {
  // --- STATE ---
  const [cart, setCart] = useState([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [user, setUser] = useState(null);
  const [orders, setOrders] = useState([]);
  const [settings, setSettings] = useState({});
  const [categories, setCategories] = useState([]);
  const [products, setProducts] = useState([]);
  const [coupons, setCoupons] = useState([]);
  const [activeCoupon, setActiveCoupon] = useState(null);
  const [toasts, setToasts] = useState([]);
  const [darkMode, setDarkMode] = useState(true);

  // Sound alert for new orders
  const playNewOrderSound = () => {
    try {
      const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      
      // Play a beautiful premium bell double chime
      const playTone = (freq, startTime, duration) => {
        const osc = audioCtx.createOscillator();
        const gainNode = audioCtx.createGain();
        
        osc.type = 'sine';
        osc.frequency.setValueAtTime(freq, startTime);
        
        gainNode.gain.setValueAtTime(0.15, startTime);
        gainNode.gain.exponentialRampToValueAtTime(0.001, startTime + duration);
        
        osc.connect(gainNode);
        gainNode.connect(audioCtx.destination);
        
        osc.start(startTime);
        osc.stop(startTime + duration);
      };
      
      const now = audioCtx.currentTime;
      playTone(523.25, now, 0.4); // C5
      playTone(659.25, now + 0.15, 0.6); // E5
    } catch (err) {
      console.warn('Audio play blocked or unsupported:', err);
    }
  };

  // Toast Helper
  const showToast = (message, type = 'info') => {
    const id = Date.now();
    setToasts(prev => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 4000);
  };

  // Keep a ref to the latest user so polling can read it without re-registering
  const userRef = useRef(user);
  useEffect(() => {
    userRef.current = user;
  }, [user]);

  // --- INITIAL SYNC (runs once on mount) ---
  useEffect(() => {
    // 1. Session restore
    const savedUser = localStorage.getItem('bh_current_user');
    if (savedUser) {
      setUser(JSON.parse(savedUser));
    }

    // 2. Fetch Initial Database Data
    async function loadData() {
      try {
        const catList = await dbService.getCategories();
        const prodList = await dbService.getProducts();
        const config = await dbService.getSettings();
        const orderList = await dbService.getOrders();
        const couponList = await dbService.getCoupons();

        setCategories(catList);
        setProducts(prodList);
        setSettings(config);
        setOrders(orderList);
        setCoupons(couponList);
      } catch (err) {
        console.error('Error seeding initial context:', err);
      }
    }
    loadData();
  }, []); // <-- runs ONCE only

  // --- LIVE POLLING (separate effect, also runs once) ---
  useEffect(() => {
    const interval = setInterval(async () => {
      try {
        const freshOrders = await dbService.getOrders();
        setOrders(prev => {
          if (prev.length > 0 && freshOrders.length > prev.length) {
            // Read the current user from ref — no re-registration needed
            const currentUser = userRef.current;
            const isStaff = currentUser?.role === 'employee' || currentUser?.role === 'admin';
            if (isStaff) {
              playNewOrderSound();
              showToast('🍔 Novo pedido pendente na cozinha!', 'info');
            }
          }
          return freshOrders;
        });
      } catch (_) {
        // Silent: fallback to localStorage already handled inside dbService.getOrders()
      }
    }, 5000);

    return () => clearInterval(interval);
  }, []); // <-- runs ONCE only, reads user via ref

  // --- CART OPERATIONS ---
  const addToCart = (product, qty, selectedSize, selectedAddons, notes) => {
    const addonKey = selectedAddons.map(a => a.name).sort().join('|');
    const cartItemId = `${product.id}-${selectedSize}-${addonKey}-${notes}`;

    const addonCost = selectedAddons.reduce((sum, item) => sum + item.price, 0);
    const sizeCost = product.sizes?.find(s => s.name === selectedSize)?.priceModifier || 0;
    const unitPrice = product.price + sizeCost + addonCost;

    // Read current cart snapshot OUTSIDE the updater to decide the toast message
    // (setCart updater must be pure — no side effects like showToast inside it)
    setCart(prevCart => {
      const existingItemIndex = prevCart.findIndex(item => item.cartItemId === cartItemId);

      if (existingItemIndex >= 0) {
        const updated = [...prevCart];
        updated[existingItemIndex] = {
          ...updated[existingItemIndex],
          qty: updated[existingItemIndex].qty + qty
        };
        return updated;
      }

      return [...prevCart, {
        cartItemId,
        id: product.id,
        name: product.name,
        image: product.image,
        unitPrice,
        price: product.price,
        qty,
        selectedSize,
        selectedAddons,
        notes
      }];
    });

    // Show toast AFTER setCart — completely outside the updater
    // Use a microtask so it always fires once, after the state update commits
    Promise.resolve().then(() => {
      showToast(`${product.name} adicionado ao carrinho!`, 'success');
    });
  };

  const updateCartQty = (cartItemId, delta) => {
    setCart(prev => prev.map(item => {
      if (item.cartItemId === cartItemId) {
        const newQty = item.qty + delta;
        return newQty > 0 ? { ...item, qty: newQty } : null;
      }
      return item;
    }).filter(Boolean));
  };

  const removeFromCart = (cartItemId) => {
    setCart(prev => prev.filter(item => item.cartItemId !== cartItemId));
    showToast('Item removido do carrinho.', 'info');
  };

  const clearCart = () => {
    setCart([]);
    setActiveCoupon(null);
  };

  const getCartSubtotal = () => {
    return cart.reduce((sum, item) => sum + (item.unitPrice * item.qty), 0);
  };

  const getCartDiscount = () => {
    if (!activeCoupon) return 0;
    const subtotal = getCartSubtotal();
    if (subtotal < activeCoupon.min_order_value) return 0;

    if (activeCoupon.discount_type === 'percentage') {
      return Number(((subtotal * activeCoupon.value) / 100).toFixed(2));
    } else {
      return Number(activeCoupon.value);
    }
  };

  const getCartTotal = () => {
    const subtotal = getCartSubtotal();
    const discount = getCartDiscount();
    const delivery = settings.delivery_fee_base || 0;
    return Math.max(0, subtotal - discount + delivery);
  };

  const applyCoupon = (code) => {
    const coupon = coupons.find(c => c.code.toUpperCase() === code.toUpperCase());
    if (!coupon) {
      showToast('Cupom inválido!', 'info');
      return false;
    }
    if (!coupon.active) {
      showToast('Cupom expirado!', 'info');
      return false;
    }
    const subtotal = getCartSubtotal();
    if (subtotal < coupon.min_order_value) {
      showToast(`Cupom exige pedido mínimo de R$ ${coupon.min_order_value.toFixed(2)}`, 'info');
      return false;
    }

    setActiveCoupon(coupon);
    showToast(`Cupom ${coupon.code} aplicado com sucesso!`, 'success');
    return true;
  };

  // --- AUTH OPERATIONS ---
  const login = async (email, password) => {
    try {
      const loggedUser = await dbService.login(email, password);
      setUser(loggedUser);
      localStorage.setItem('bh_current_user', JSON.stringify(loggedUser));
      showToast(`Bem-vindo, ${loggedUser.name}!`, 'success');
      return loggedUser;
    } catch (err) {
      showToast(err.message || 'Erro ao realizar login', 'info');
      throw err;
    }
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('bh_current_user');
    showToast('Sessão encerrada com sucesso.', 'info');
  };

  const register = async (name, email, password, phone, address) => {
    try {
      const newUser = {
        name,
        email,
        password,
        phone,
        address,
        role: 'client'
      };
      const created = await dbService.saveUser(newUser);
      showToast('Cadastro realizado! Realize o login.', 'success');
      return created;
    } catch (err) {
      showToast('Erro ao criar conta.', 'info');
      throw err;
    }
  };

  // --- ORDER CREATION & TRACKING ---
  const placeOrder = async (deliveryType, address, paymentMethod, guestName = null, guestPhone = null) => {
    if (cart.length === 0) return null;

    try {
      const subtotal = getCartSubtotal();
      const discount = getCartDiscount();
      const deliveryFee = deliveryType === 'delivery' ? settings.delivery_fee_base : 0;

      const orderData = {
        user_id: user ? user.id : 'usr-guest',
        client_name: user ? user.name : (guestName || 'Cliente Visitante'),
        client_phone: user ? user.phone : (guestPhone || '(11) 99999-9999'),
        items: cart,
        delivery_type: deliveryType,
        delivery_address: deliveryType === 'delivery' ? address : null,
        delivery_fee: deliveryFee,
        discount,
        total: subtotal - discount + deliveryFee,
        payment_method: paymentMethod,
        status: 'pending'
      };

      const newOrder = await dbService.saveOrder(orderData);
      
      // Update local context
      const freshOrders = await dbService.getOrders();
      setOrders(freshOrders);
      
      // Clear Cart
      clearCart();
      setIsCartOpen(false);
      showToast('Pedido realizado com sucesso!', 'success');
      
      return newOrder;
    } catch (err) {
      showToast('Erro ao enviar pedido.', 'info');
      console.error(err);
      throw err;
    }
  };

  const updateOrderStatus = async (orderId, newStatus) => {
    try {
      const target = orders.find(o => o.id === orderId);
      if (!target) return;

      const updated = { ...target, status: newStatus };
      await dbService.saveOrder(updated);

      const freshOrders = await dbService.getOrders();
      setOrders(freshOrders);
      showToast(`Status do pedido #${target.order_number} atualizado!`, 'success');
    } catch (err) {
      showToast('Erro ao atualizar pedido.', 'info');
      console.error(err);
    }
  };

  // --- CRUD ACTIONS FOR ADMIN ---
  const refreshProducts = async () => {
    const list = await dbService.getProducts();
    setProducts(list);
  };

  const refreshCategories = async () => {
    const list = await dbService.getCategories();
    setCategories(list);
  };

  const saveProduct = async (product) => {
    await dbService.saveProduct(product);
    await refreshProducts();
    showToast('Produto salvo com sucesso!', 'success');
  };

  const deleteProduct = async (id) => {
    await dbService.deleteProduct(id);
    await refreshProducts();
    showToast('Produto excluído.', 'info');
  };

  const saveCategory = async (category) => {
    await dbService.saveCategory(category);
    await refreshCategories();
    showToast('Categoria salva.', 'success');
  };

  const deleteCategory = async (id) => {
    await dbService.deleteCategory(id);
    await refreshCategories();
    showToast('Categoria excluída.', 'info');
  };

  const saveSettings = async (newSettings) => {
    await dbService.saveSettings(newSettings);
    setSettings(newSettings);
    showToast('Configurações atualizadas.', 'success');
  };

  const saveCoupon = async (coupon) => {
    await dbService.saveCoupon(coupon);
    const fresh = await dbService.getCoupons();
    setCoupons(fresh);
    showToast('Cupom salvo.', 'success');
  };

  const deleteCoupon = async (code) => {
    await dbService.deleteCoupon(code);
    const fresh = await dbService.getCoupons();
    setCoupons(fresh);
    showToast('Cupom excluído.', 'info');
  };

  // Theme support
  const toggleTheme = () => {
    setDarkMode(!darkMode);
  };

  return (
    <AppContext.Provider value={{
      cart,
      isCartOpen,
      setIsCartOpen,
      user,
      orders,
      settings,
      categories,
      products,
      coupons,
      activeCoupon,
      toasts,
      darkMode,
      toggleTheme,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      getCartSubtotal,
      getCartDiscount,
      getCartTotal,
      applyCoupon,
      login,
      logout,
      register,
      placeOrder,
      updateOrderStatus,
      saveProduct,
      deleteProduct,
      saveCategory,
      deleteCategory,
      saveSettings,
      saveCoupon,
      deleteCoupon,
      showToast
    }}>
      {children}
      
      {/* Toast Alert Popups */}
      <div className="notification-container">
        {toasts.map(toast => (
          <div key={toast.id} className={`notification-toast ${toast.type}`}>
            <span className="toast-icon">
              {toast.type === 'success' && '🟢'}
              {toast.type === 'error' && '🔴'}
              {toast.type === 'warning' && '🟡'}
              {toast.type === 'info' && '🔵'}
            </span>
            <span className="toast-message">{toast.message}</span>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}

export function useApp() {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used inside an AppProvider');
  }
  return context;
}
