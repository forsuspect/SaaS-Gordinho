import React from 'react';
import { Flame, Clock, ShieldCheck, ArrowRight } from 'lucide-react';
import './Hero.css';

export default function Hero({ onOrderNowClick }) {
  return (
    <section className="hero-section">
      <div className="hero-background-glow"></div>
      
      <div className="hero-container">
        {/* Left Side: Bold Catchy Selling Content */}
        <div className="hero-content">
          <div className="hero-badge glass">
            <Flame size={16} className="badge-icon" />
            <span>Gordinho Burguer — O Melhor Hambúrguer Artesanal da Região</span>
          </div>
          
          <h1 className="hero-title">
            Morda a <span className="neon-text-red">Perfeição</span>, Sinta a Diferença.
          </h1>
          
          <p className="hero-description">
            Ingredientes selecionados, carnes nobres grelhadas no fogo como churrasco e um pão brioche amanteigado ultra macio. Peça agora e receba em minutos na sua porta.
          </p>
          
          <div className="hero-cta-group">
            <button onClick={onOrderNowClick} className="neon-btn hero-main-btn">
              <span>Pedir Agora</span>
              <ArrowRight size={18} />
            </button>
            
            <a href="#menu" className="hero-sec-btn">
              Visualizar Cardápio
            </a>
          </div>

          {/* Quick trust metrics */}
          <div className="hero-metrics">
            <div className="metric-item glass">
              <Clock size={20} className="metric-icon" />
              <div>
                <h4>25-35 min</h4>
                <p>Entrega Veloz</p>
              </div>
            </div>
            
            <div className="metric-item glass">
              <ShieldCheck size={20} className="metric-icon" />
              <div>
                <h4>Ingredientes 100%</h4>
                <p>Naturais e Selecionados</p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Double Burger showcase with neon red ambient background */}
        <div className="hero-visual">
          <div className="hero-image-wrapper">
            <div className="neon-halo"></div>
            {/* Using the beautiful generated double cheeseburger image */}
            <img 
              src="/burger_hero.png" 
              alt="Hambúrguer Gourmet Premium Double Cheeseburger" 
              className="hero-main-burger-img"
            />
            
            {/* Floating details cards for extra high-fidelity premium design */}
            <div className="floating-card rating-card glass">
              <span className="star">⭐</span>
              <div>
                <h5>4.9 Estrelas</h5>
                <p>+2.500 avaliações</p>
              </div>
            </div>

            <div className="floating-card promo-card glass">
              <span className="fire">🔥</span>
              <div>
                <h5>Combo Especial</h5>
                <p>Fritas + refri grátis</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
