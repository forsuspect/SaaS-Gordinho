import React, { useEffect, useState } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { Lock, Mail, User, Phone, ArrowLeft, Flame, ShieldAlert, Sparkles } from 'lucide-react';
import './Login.css';

export default function Login() {
  const { login, register } = useApp();
  const navigate = useNavigate();
  const location = useLocation();

  // Mode: 'login' or 'register'
  const [mode, setMode] = useState('login');

  useEffect(() => {
    const search = new URLSearchParams(location.search);
    const requestedMode = search.get('mode');
    if (requestedMode === 'register') setMode('register');
    if (requestedMode === 'login') setMode('login');
  }, [location.search]);
  
  // Input fields
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  
  const [errorMsg, setErrorMsg] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Auto-format phone to (XX) XXXXX-XXXX
  const handlePhoneChange = (e) => {
    const rawValue = e.target.value;
    const digits = rawValue.replace(/\D/g, '').substring(0, 11);
    
    let formatted = '';
    if (digits.length > 0) {
      formatted += `(${digits.slice(0, 2)}`;
    }
    if (digits.length > 2) {
      formatted += `) ${digits.slice(2, 7)}`;
    }
    if (digits.length > 7) {
      formatted += `-${digits.slice(7, 11)}`;
    }
    setPhone(formatted);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg('');
    setIsSubmitting(true);

    try {
      if (mode === 'login') {
        const user = await login(email, password);
        // Redirect based on roles
        if (user.role === 'admin') navigate('/admin');
        else if (user.role === 'employee') navigate('/kitchen');
        else navigate('/portal');
      } else {
        const digitsOnly = phone.replace(/\D/g, '');
        if (digitsOnly.length < 11) {
          setErrorMsg('Por favor, digite o celular completo com DDD.');
          setIsSubmitting(false);
          return;
        }

        if (!name || !email || !password || !phone) {
          setErrorMsg('Preencha todos os campos obrigatórios.');
          setIsSubmitting(false);
          return;
        }
        await register(name, email, password, phone, '');
        setMode('login');
        setEmail(email);
        setPassword(password);
      }
    } catch (err) {
      setErrorMsg(err.message || 'Erro de autenticação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Demo shortcut autofill function
  const handleQuickLogin = (role) => {
    setErrorMsg('');
    if (role === 'admin') {
      setEmail('admin@gordinhoburguer.com');
      setPassword('admin');
    } else if (role === 'kitchen') {
      setEmail('cozinha@gordinhoburguer.com');
      setPassword('123');
    } else {
      setEmail('cliente@gmail.com');
      setPassword('123');
    }
  };

  return (
    <div className="login-page">
      {/* Return button */}
      <Link to="/" className="back-to-home-link glass">
        <ArrowLeft size={16} />
        <span>Voltar ao Site</span>
      </Link>

      <div className="login-background-flame"></div>

      <div className="login-container">
        {/* Form panel */}
        <div className="login-card glass-glow">
          <div className="login-header">
            <Link to="/" className="login-logo">
              <img src="/logo.png" alt="Gordinho Burguer" className="brand-logo brand-logo-login" />
              <span>GORDINHO <span className="red-text">BURGUER</span></span>
            </Link>
            <h3>{mode === 'login' ? 'Acessar Conta' : 'Criar Nova Conta'}</h3>
            <p className="login-subtitle">
              {mode === 'login' 
                ? 'Insira suas credenciais para continuar.' 
                : 'Preencha o formulário para fazer pedidos premium.'}
            </p>
          </div>

          {errorMsg && <div className="login-error-alert">{errorMsg}</div>}

          <form onSubmit={handleSubmit} className="login-form">
            {mode === 'register' && (
              <>
                <div className="login-input-group glass">
                  <User size={18} className="input-icon" />
                  <input 
                    type="text" 
                    placeholder="Nome Completo *" 
                    value={name} 
                    onChange={(e) => setName(e.target.value)} 
                    required 
                  />
                </div>

                <div className="login-input-group glass">
                  <Phone size={18} className="input-icon" />
                  <input 
                    type="tel" 
                    placeholder="Celular/WhatsApp *" 
                    value={phone} 
                    onChange={handlePhoneChange} 
                    required
                  />
                </div>
              </>
            )}

            <div className="login-input-group glass">
              <Mail size={18} className="input-icon" />
              <input 
                type="email" 
                placeholder="E-mail *" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
              />
            </div>

            <div className="login-input-group glass">
              <Lock size={18} className="input-icon" />
              <input 
                type="password" 
                placeholder="Senha *" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
              />
            </div>

            <button type="submit" disabled={isSubmitting} className="neon-btn login-submit-btn">
              {isSubmitting ? 'Aguarde...' : (mode === 'login' ? 'Entrar na Conta' : 'Concluir Cadastro')}
            </button>
          </form>

          {/* Toggle buttons */}
          <div className="login-toggle-mode">
            {mode === 'login' ? (
              <p>Não tem conta? <button onClick={() => setMode('register')} className="toggle-btn">Cadastre-se</button></p>
            ) : (
              <p>Já tem uma conta? <button onClick={() => setMode('login')} className="toggle-btn">Faça Login</button></p>
            )}
          </div>
        </div>

        {/* Demo Roles Panel (RIGHT/BOTTOM) */}
        <div className="demo-roles-panel glass">
          <div className="demo-title">
            <Sparkles size={16} className="demo-icon" />
            <h4>Acesso de Demonstração Rápido</h4>
          </div>
          <p className="demo-desc">Selecione uma conta de teste para preencher as credenciais e navegar nas diferentes permissões:</p>
          
          <div className="demo-buttons-stack">
            <button onClick={() => handleQuickLogin('client')} className="demo-btn client">
              <User size={16} />
              <div className="demo-btn-text">
                <strong>Cliente VIP</strong>
                <span>Ver histórico, fazer pedidos</span>
              </div>
            </button>

            <button onClick={() => handleQuickLogin('kitchen')} className="demo-btn staff">
              <Flame size={16} />
              <div className="demo-btn-text">
                <strong>Cozinha / Funcionário</strong>
                <span>Pedidos em tempo real, som, impressão</span>
              </div>
            </button>

            <button onClick={() => handleQuickLogin('admin')} className="demo-btn admin">
              <ShieldAlert size={16} />
              <div className="demo-btn-text">
                <strong>Administrador</strong>
                <span>Dashboard completo, vendas, estoque</span>
              </div>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
