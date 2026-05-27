import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { ShoppingBag, User, LogOut, Menu, X, Flame, ShieldAlert } from 'lucide-react';
import './Navbar.css';

export default function Navbar() {
  const { cart, setIsCartOpen, user, logout } = useApp();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

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
    <header className={`navbar-header ${isScrolled ? 'scrolled' : 'transparent'}`}>
      <div className="navbar-container">
        {/* Logo */}
        <Link to="/" className="navbar-logo" onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}>
          <img src="/logo.png" alt="Gordinho Burguer" className="brand-logo" />
          <span>GORDINHO <span className="red-text">BURGUER</span></span>
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
  );
}
