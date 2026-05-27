import React from 'react';
import { X, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './WelcomeDiscountModal.css';

export default function WelcomeDiscountModal({ open, onClose }) {
  const navigate = useNavigate();

  if (!open) return null;

  return (
    <div className="welcome-modal-overlay" role="dialog" aria-modal="true">
      <div className="welcome-modal-backdrop" onClick={onClose} />

      <div className="welcome-modal-card glass-glow">
        <button type="button" className="welcome-modal-close" onClick={onClose} aria-label="Fechar">
          <X size={18} />
        </button>

        <div className="welcome-modal-header">
          <img src="/logo.png" alt="Gordinho Burguer" className="welcome-modal-logo" />
          <div className="welcome-modal-badge">
            <Sparkles size={14} />
            <span>Boas-vindas</span>
          </div>
        </div>

        <h2 className="welcome-modal-title">
          Cadastre-se e ganhe <span className="red-text">10% OFF</span>
        </h2>
        <p className="welcome-modal-subtitle">
          Crie sua conta em segundos e já aproveite o desconto no primeiro pedido.
        </p>

        <div className="welcome-modal-actions">
          <button
            type="button"
            className="neon-btn welcome-modal-primary"
            onClick={() => {
              onClose();
              navigate('/login?mode=register');
            }}
          >
            <span>Criar conta com 10% OFF</span>
            <ArrowRight size={18} />
          </button>

          <button type="button" className="welcome-modal-secondary" onClick={onClose}>
            Agora não
          </button>
        </div>
      </div>
    </div>
  );
}

