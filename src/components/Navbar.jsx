import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User, LogOut, Menu, X, Flame, ShieldAlert } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { cart, setIsCartOpen, user, logout, orders } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [guestOrderAlert, setGuestOrderAlert] = useState(null);
  const navigate = useNavigate();
  const location = useLocation();

  // Polling check for guest order status with persistent localStorage tracking
  useEffect(() => {
    // Only track guest order if NOT logged in as a registered user
    if (!user && orders && orders.length > 0) {
      const recentOrderId = localStorage.getItem('recentGuestOrderId');
      const dismissedId = localStorage.getItem('dismissedGuestOrderId');

      if (recentOrderId && recentOrderId !== dismissedId) {
        // Find this guest order inside active synchronized orders list
        const guestOrder = orders.find(o => o.id === recentOrderId);
        if (guestOrder) {
          // Check if order status transitioned to a completed or ready state
          if (['ready', 'shipping', 'delivered'].includes(guestOrder.status)) {
            setGuestOrderAlert(guestOrder);

            // Play high operational chime sound exactly once per order
            const chimePlayedId = localStorage.getItem('chimePlayedGuestOrderId');
            if (chimePlayedId !== guestOrder.id) {
              localStorage.setItem('chimePlayedGuestOrderId', guestOrder.id);
              try {
                const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
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
                // High-pitched bright happy melody: E6 -> G6 -> C7
                playTone(1318.51, now, 0.25);
                playTone(1567.98, now + 0.12, 0.25);
                playTone(2093.00, now + 0.24, 0.45);
              } catch (_) {
                // Browser audio autoplay policy fallback
              }
            }
          }
        }
      }
    } else {
      setGuestOrderAlert(null);
    }
  }, [orders, user]);

  const handleDismissGuestAlert = () => {
    if (guestOrderAlert) {
      localStorage.setItem('dismissedGuestOrderId', guestOrderAlert.id);
      setGuestOrderAlert(null);
    }
  };

  // Detect scroll to toggle sticky glass styling
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 50) {
        setIsScrolled(true);
      } else {
        setIsScrolled(false);
      }
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const totalCartQty = cart.reduce((sum, item) => sum + item.qty, 0);

  const handleCartClick = () => {
    setIsCartOpen(true);
    setIsMobileMenuOpen(false);
  };

  const handleNavClick = (sectionId) => {
    setIsMobileMenuOpen(false);
    
    // If not on Home, navigate to Home first
    if (location.pathname !== '/') {
      navigate('/', { state: { scrollTo: sectionId } });
    } else {
      const element = document.getElementById(sectionId);
      if (element) {
        const offset = 80; // height of fixed navbar
        const elementPosition = element.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - offset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    }
  };

  // Scroll to section after navigation if state contains scrollTo
  useEffect(() => {
    if (location.pathname === '/' && location.state?.scrollTo) {
      setTimeout(() => {
        const element = document.getElementById(location.state.scrollTo);
        if (element) {
          const offset = 80;
          const elementPosition = element.getBoundingClientRect().top;
          const offsetPosition = elementPosition + window.pageYOffset - offset;
          window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
          });
        }
        // Clear history state to avoid scrolling on subsequent reloads
        window.history.replaceState({}, document.title);
      }, 100);
    }
  }, [location]);

  return (
    <>
      <header className={`navbar-header ${isScrolled ? 'scrolled' : 'transparent'}`}>
        <div className="navbar-container">
          {/* Logo */}
          <Link to="/" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
            <img src="/logo.png" alt="Gordinho Burguer" className="brand-logo" />
            <span><span>GORDINHO</span><span className="red-text">BURGUER</span></span>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="navbar-desktop-nav">
            <button onClick={() => handleNavClick('combos')} className="nav-link">Combos</button>
            <button onClick={() => handleNavClick('menu')} className="nav-link">Cardápio</button>
            <button onClick={() => handleNavClick('builder')} className="nav-link">Monte o Seu</button>
            <button onClick={() => handleNavClick('locations')} className="nav-link">Lojas</button>
          </nav>

          {/* Navbar Action Icons */}
          <div className="navbar-actions">
            {/* Cart Icon */}
            <button onClick={handleCartClick} className="action-btn cart-btn" aria-label="Carrinho de compras">
              <ShoppingBag size={22} />
              {totalCartQty > 0 && <span className="cart-badge">{totalCartQty}</span>}
            </button>

            {/* User Profile / Dashboard Redirect */}
            {user ? (
              <div className="user-nav-group">
                {user.role === 'admin' && (
                  <>
                    <Link to="/waiter" className="dashboard-link" title="Atendimento Salão" style={{ marginRight: '8px' }}>
                      <ShoppingBag size={18} className="glow-icon" style={{ color: 'var(--accent-green)' }} />
                      <span className="desktop-only">Vendas</span>
                    </Link>
                    <Link to="/admin" className="dashboard-link" title="Painel Admin">
                      <ShieldAlert size={18} className="glow-icon" />
                      <span className="desktop-only">Admin</span>
                    </Link>
                  </>
                )}
                {user.role === 'employee' && (
                  <>
                    <Link to="/waiter" className="dashboard-link" title="Atendimento Salão" style={{ marginRight: '8px' }}>
                      <ShoppingBag size={18} className="glow-icon" style={{ color: 'var(--accent-green)' }} />
                      <span className="desktop-only">Vendas</span>
                    </Link>
                    <Link to="/kitchen" className="dashboard-link" title="Painel Cozinha">
                      <Flame size={18} className="glow-icon" />
                      <span className="desktop-only">Cozinha</span>
                    </Link>
                  </>
                )}
                {user.role === 'client' && (
                  <Link to="/portal" className="dashboard-link" title="Meus Pedidos">
                    <User size={20} />
                    <span className="desktop-only">Pedidos</span>
                  </Link>
                )}
                <button onClick={logout} className="action-btn logout-btn" title="Sair">
                  <LogOut size={20} />
                </button>
              </div>
            ) : (
              <Link to="/login" className="login-nav-btn">
                <User size={18} />
                <span>Entrar</span>
              </Link>
            )}

            {/* Mobile Hamburguer Toggle */}
            <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} className="action-btn mobile-menu-toggle">
              {isMobileMenuOpen ? <X size={26} /> : <Menu size={26} />}
            </button>
          </div>
        </div>

        {/* Mobile Drawer Menu */}
        <div className={`navbar-mobile-drawer glass ${isMobileMenuOpen ? 'open' : ''}`}>
          <div className="mobile-drawer-header">
            <button
              type="button"
              className="mobile-drawer-close-btn"
              onClick={() => setIsMobileMenuOpen(false)}
              aria-label="Fechar menu"
            >
              <X size={24} />
            </button>
          </div>
          <nav className="mobile-nav-links">
            <button onClick={() => handleNavClick('combos')} className="mobile-nav-link">Combos Promocionais</button>
            <button onClick={() => handleNavClick('menu')} className="mobile-nav-link">Cardápio Premium</button>
            <button onClick={() => handleNavClick('builder')} className="mobile-nav-link">Monte seu Hambúrguer</button>
            <button onClick={() => handleNavClick('locations')} className="mobile-nav-link">Lojas & Localização</button>
            
            <div className="mobile-drawer-divider"></div>
            
            {user ? (
              <>
                <div className="mobile-user-info">
                  <p className="mobile-user-name">{user.name}</p>
                  <p className="mobile-user-email">{user.email}</p>
                </div>
                {user.role === 'admin' && (
                  <>
                    <Link to="/waiter" className="mobile-dashboard-btn" onClick={() => setIsMobileMenuOpen(false)} style={{ borderLeft: '3px solid var(--accent-green)' }}>Atendimento Salão (Vendas)</Link>
                    <Link to="/admin" className="mobile-dashboard-btn" onClick={() => setIsMobileMenuOpen(false)}>Painel Administrador</Link>
                  </>
                )}
                {user.role === 'employee' && (
                  <>
                    <Link to="/waiter" className="mobile-dashboard-btn" onClick={() => setIsMobileMenuOpen(false)} style={{ borderLeft: '3px solid var(--accent-green)' }}>Atendimento Salão (Vendas)</Link>
                    <Link to="/kitchen" className="mobile-dashboard-btn" onClick={() => setIsMobileMenuOpen(false)}>Painel Cozinha</Link>
                  </>
                )}
                {user.role === 'client' && (
                  <Link to="/portal" className="mobile-dashboard-btn" onClick={() => setIsMobileMenuOpen(false)}>Meus Pedidos</Link>
                )}
                <button onClick={() => { logout(); setIsMobileMenuOpen(false); }} className="mobile-logout-btn">
                  <LogOut size={16} /> Terminar Sessão
                </button>
              </>
            ) : (
              <Link to="/login" className="mobile-login-btn" onClick={() => setIsMobileMenuOpen(false)}>
                <User size={18} /> Acessar Minha Conta
              </Link>
            )}
          </nav>
        </div>
      </header>

      {/* Floating Guest Order Ready Chime Notification Banner */}
      {guestOrderAlert && (
        <div className="guest-order-ready-banner glass-glow">
          <div className="banner-content">
            <span className="bell-emoji pulsate">🔔</span>
            <p>
              ¡Oba! Seu pedido <strong>#{guestOrderAlert.order_number}</strong> está <strong>PRONTO</strong>!
              {guestOrderAlert.status === 'shipping' && ' 🛵 Saiu para entrega!'}
              {guestOrderAlert.status === 'ready' && guestOrderAlert.delivery_type === 'takeout' && ' 🏪 Já pode retirar na loja!'}
              {guestOrderAlert.status === 'ready' && guestOrderAlert.delivery_type === 'delivery' && ' 📦 Sendo embalado para entrega!'}
            </p>
          </div>
          <button onClick={handleDismissGuestAlert} className="banner-close-btn">
            Entendido
          </button>
        </div>
      )}
    </>
  );
}
