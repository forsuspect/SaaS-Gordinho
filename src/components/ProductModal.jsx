import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import { X, Plus, Minus, ShoppingBag } from 'lucide-react';
import './ProductModal.css';

export default function ProductModal({ product, onClose }) {
  const { addToCart } = useApp();
  
  if (!product) return null;

  // Customizer States
  const [selectedSize, setSelectedSize] = useState('');
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [qty, setQty] = useState(1);
  const [notes, setNotes] = useState('');
  const [doneness, setDoneness] = useState('Ao ponto');

  const shouldShowDoneness =
    product?.category_id === 'cat-burgers' ||
    /burger/i.test(product?.name || '') ||
    /hamb[uú]rg/i.test(product?.name || '');

  // Set default size on load
  useEffect(() => {
    if (product.sizes && product.sizes.length > 0) {
      setSelectedSize(product.sizes[0].name);
    } else {
      setSelectedSize('Padrão');
    }
    // Reset other states
    setSelectedAddons([]);
    setQty(1);
    setNotes('');
    setDoneness('Ao ponto');
  }, [product]);

  // Addon toggle helper
  const handleAddonToggle = (addon) => {
    if (selectedAddons.some(a => a.name === addon.name)) {
      setSelectedAddons(prev => prev.filter(a => a.name !== addon.name));
    } else {
      setSelectedAddons(prev => [...prev, addon]);
    }
  };

  // Live Unit Price Calculator
  const getUnitPrice = () => {
    const sizeModifier = product.sizes?.find(s => s.name === selectedSize)?.priceModifier || 0;
    const addonsCost = selectedAddons.reduce((sum, item) => sum + item.price, 0);
    return product.price + sizeModifier + addonsCost;
  };

  const handleAddProduct = () => {
    const donenessText = shouldShowDoneness ? `Ponto da carne: ${doneness}` : '';
    const composedNotes = [donenessText, notes].filter(Boolean).join(' • ');
    addToCart(product, qty, selectedSize, selectedAddons, composedNotes);
    onClose();
  };

  return (
    <div className="modal-overlay">
      <div className="modal-backdrop" onClick={onClose}></div>
      
      <div className="modal-card glass-glow">
        {/* Header with image */}
        <div className="modal-header-image">
          <img src={product.image} alt={product.name} className="modal-banner-img" />
          <button onClick={onClose} className="modal-close-btn" aria-label="Fechar">
            <X size={20} />
          </button>
        </div>

        {/* Scrollable details and customization */}
        <div className="modal-scroll-content">
          <div className="modal-info-block">
            <h2 className="modal-title">{product.name}</h2>
            <p className="modal-desc">{product.description}</p>
          </div>

          {/* Sizes */}
          {product.sizes && product.sizes.length > 0 && (
            <div className="customizer-section">
              <h4 className="section-title">Escolha o Tamanho</h4>
              <div className="sizes-grid">
                {product.sizes.map(size => (
                  <button 
                    key={size.name}
                    onClick={() => setSelectedSize(size.name)}
                    className={`size-option-btn glass ${selectedSize === size.name ? 'active' : ''}`}
                  >
                    <span className="size-name">{size.name}</span>
                    <span className="size-price">
                      {size.priceModifier > 0 ? `+ R$ ${size.priceModifier.toFixed(2)}` : 'Incluso'}
                    </span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Addons */}
          {product.addons && product.addons.length > 0 && (
            <div className="customizer-section">
              <h4 className="section-title">Adicionais Extras</h4>
              <div className="addons-list">
                {product.addons.map(addon => {
                  const isChecked = selectedAddons.some(a => a.name === addon.name);
                  return (
                    <div 
                      key={addon.name} 
                      onClick={() => handleAddonToggle(addon)}
                      className={`addon-row glass ${isChecked ? 'active' : ''}`}
                    >
                      <div className="addon-check-label">
                        <input 
                          type="checkbox" 
                          checked={isChecked} 
                          readOnly 
                          className="custom-checkbox" 
                        />
                        <span className="addon-name">{addon.name}</span>
                      </div>
                      <span className="addon-price">+ R$ {addon.price.toFixed(2)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Doneness */}
          {shouldShowDoneness && (
            <div className="customizer-section">
              <h4 className="section-title">Ponto da Carne</h4>
              <div className="sizes-grid">
                {['Mal passado', 'Ao ponto', 'Bem passado'].map(opt => (
                  <button
                    key={opt}
                    type="button"
                    onClick={() => setDoneness(opt)}
                    className={`size-option-btn glass ${doneness === opt ? 'active' : ''}`}
                  >
                    <span className="size-name">{opt}</span>
                    <span className="size-price">Recomendado</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Observations */}
          <div className="customizer-section">
            <h4 className="section-title">Observações do Item</h4>
            <textarea 
              placeholder="Ex: sem queijo, pão bem selado, molho à parte..." 
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="modal-notes-textarea glass"
            />
          </div>
        </div>

        {/* Modal footer (Qty and Add button) */}
        <div className="modal-footer glass">
          <div className="qty-picker-container">
            <button onClick={() => setQty(prev => Math.max(1, prev - 1))} className="qty-picker-btn">
              <Minus size={14} />
            </button>
            <span className="qty-picker-val">{qty}</span>
            <button onClick={() => setQty(prev => prev + 1)} className="qty-picker-btn">
              <Plus size={14} />
            </button>
          </div>

          <button onClick={handleAddProduct} className="neon-btn modal-submit-btn">
            <ShoppingBag size={16} />
            <span>Adicionar • R$ {(getUnitPrice() * qty).toFixed(2)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
