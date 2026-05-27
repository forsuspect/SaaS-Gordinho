import React from 'react';
import { Plus, Star } from 'lucide-react';
import './ProductCard.css';

export default function ProductCard({ product, onAddClick }) {
  return (
    <div className="product-card glass">
      {/* Best Seller Badge */}
      {product.is_best_seller && (
        <div className="product-best-seller-tag">
          <Star size={10} fill="currentColor" />
          <span>Mais Vendido</span>
        </div>
      )}

      {/* Product Image */}
      <div className="product-img-container">
        <img 
          src={product.image} 
          alt={product.name} 
          className="product-image"
          loading="lazy"
        />
        <div className="product-image-blur-shadow" style={{ backgroundImage: `url(${product.image})` }}></div>
      </div>

      {/* Product Info */}
      <div className="product-info">
        <h3 className="product-name">{product.name}</h3>
        <p className="product-desc" title={product.description}>
          {product.description}
        </p>

        {/* Product Footer (Price & Button) */}
        <div className="product-card-footer">
          <div className="product-price-box">
            <span className="price-unit">R$</span>
            <span className="price-val">{product.price.toFixed(2)}</span>
          </div>

          <button 
            onClick={() => onAddClick(product)} 
            className="product-card-add-btn"
            aria-label={`Adicionar ${product.name} ao carrinho`}
          >
            <Plus size={16} />
            <span>Adicionar</span>
          </button>
        </div>
      </div>
    </div>
  );
}
