import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { User, Mail, Phone, Lock, Sparkles, CheckCircle } from 'lucide-react';
import './RegisterSection.css';

export default function RegisterSection() {
  const { register } = useApp();
  
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [registered, setRegistered] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

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

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    // Ensure we have exactly 11 digits (DDD + phone number)
    const digitsOnly = phone.replace(/\D/g, '');
    if (digitsOnly.length < 11) {
      setError('Por favor, digite o número de telefone completo com DDD.');
      return;
    }

    setLoading(true);

    if (!name || !email || !phone || !password) {
      setError('Por favor, preencha todos os campos obrigatórios.');
      setLoading(false);
      return;
    }

    try {
      await register(name, email, password, phone, '');
      setRegistered(true);
      // Reset form fields
      setName('');
      setEmail('');
      setPhone('');
      setPassword('');
    } catch (err) {
      setError(err.message || 'Erro ao realizar o cadastro. Tente outro e-mail.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="register" className="register-section section-padding">
      <div className="register-bg-glow"></div>
      
      <div className="register-section-container">
        <div className="register-info-column">
          <div className="register-tag">
            <Sparkles size={14} className="tag-sparkle" />
            <span>Clube Gordinho Burguer</span>
          </div>
          <h2 className="register-section-title">
            Cadastre-se e ganhe <span className="red-text">10% OFF</span> no primeiro pedido!
          </h2>
          <p className="register-section-description">
            Crie sua conta em segundos para acompanhar seus pedidos em tempo real na grelha, salvar seus endereços favoritos e ter acesso a cupons exclusivos de fim de semana.
          </p>

          <div className="register-features-list">
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <div>
                <h4>Acompanhamento Live</h4>
                <p>Veja quando seu blend entra na grelha e sai para entrega.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <div>
                <h4>Descontos Exclusivos</h4>
                <p>Cupons automáticos liberados direto no seu carrinho.</p>
              </div>
            </div>
            <div className="feature-item">
              <span className="feature-check">✓</span>
              <div>
                <h4>Histórico de Sabores</h4>
                <p>Repita seus pedidos favoritos com apenas um clique.</p>
              </div>
            </div>
          </div>
        </div>

        <div className="register-form-column">
          <div className="register-form-card glass-glow">
            {registered ? (
              <div className="register-success-state">
                <CheckCircle size={58} className="success-icon-glow" />
                <h3>Cadastro Realizado!</h3>
                <p>Sua conta de cliente premium está pronta. Agora você pode entrar com seu e-mail e senha.</p>
                <a href="/login" className="neon-btn success-login-btn">
                  Fazer Login Agora
                </a>
              </div>
            ) : (
              <form onSubmit={handleRegister} className="register-embedded-form">
                <h3>Faça seu Cadastro</h3>
                <p className="form-subtitle">Preencha os dados abaixo para criar sua conta VIP.</p>
                
                {error && <div className="register-error-msg">{error}</div>}

                <div className="register-input-row">
                  <div className="register-input-wrapper glass">
                    <User size={18} className="input-icon" />
                    <input 
                      type="text" 
                      placeholder="Nome Completo *" 
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-wrapper glass">
                    <Mail size={18} className="input-icon" />
                    <input 
                      type="email" 
                      placeholder="Seu Melhor E-mail *" 
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-wrapper glass">
                    <Phone size={18} className="input-icon" />
                    <input 
                      type="tel" 
                      placeholder="WhatsApp / Celular *" 
                      value={phone}
                      onChange={handlePhoneChange}
                      required 
                    />
                  </div>
                </div>

                <div className="register-input-row">
                  <div className="register-input-wrapper glass">
                    <Lock size={18} className="input-icon" />
                    <input 
                      type="password" 
                      placeholder="Crie uma Senha *" 
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      required 
                    />
                  </div>
                </div>

                <button type="submit" disabled={loading} className="neon-btn register-submit-button">
                  {loading ? 'Cadastrando...' : 'Cadastrar e Ganhar 10% OFF'}
                </button>
              </form>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
