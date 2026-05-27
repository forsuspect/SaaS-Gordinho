import React from 'react';
import { useApp } from '../context/AppContext';
import { Sparkles, ShoppingCart, Plus } from 'lucide-react';
import './Promotions.css';

export default function Promotions({ onProductClick }) {
  const { products } = useApp();
  
  // Filter only items in the "Combos" category or marked as best sellers
  const comboProducts = products.filter(p => p.category_id === 'cat-combos');

  if (comboProducts.length === 0) return null;

  return (
    <section id="combos" className="promotions-section section-padding">
      <div className="section-header">
        <div className="section-badge">
          <Sparkles size={14} />
          <span>Ofertas Especiais</span>
        </div>
        <h2 className="section-title">Combos <span className="neon-text-red">Lendários</span></h2>
        <p className="section-subtitle">
          Os maiores favoritos da casa reunidos com batata crocante e bebida trincando por um preço incomparável.
        </p>
      </div>

      <div className="combos-grid">
        {comboProducts.map(combo => (
          <div key={combo.id} className="combo-card glass-glow">
            {/* Combo Discount Badge */}
            <div className="combo-badge-discount">
              <span>Mais Vendido</span>
            </div>

            {/* Visual Burger Render */}
            <div className="combo-image-box">
              <img src={combo.image} alt={combo.name} className="combo-img" />
              <div className="image-overlay-shadow"></div>
            </div>

            {/* Details */}
            <div className="combo-details">
              <h3 className="combo-name">{combo.name}</h3>
              <p className="combo-description">{combo.description}</p>
              
              {/* Features pills */}
              <div className="combo-pills">
                <span className="pill-item">🍔 Burger Premium</span>
                <span className="pill-item">🍟 Fritas Crocantes</span>
                <span className="pill-item">🥤 Bebida Gelada</span>
              </div>

              {/* Price & Add to Cart action */}
              <div className="combo-footer">
                <div className="combo-price-block">
                  <span className="price-label">A partir de</span>
                  <span className="combo-price">R$ {combo.price.toFixed(2)}</span>
                </div>

                <button 
                  onClick={() => onProductClick(combo)} 
                  className="combo-add-btn"
                  title="Customizar e adicionar"
                >
                  <Plus size={16} />
                  <span>Quero Esse</span>
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
