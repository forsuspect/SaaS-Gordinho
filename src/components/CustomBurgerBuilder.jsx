import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { Flame, Plus, ShieldCheck } from 'lucide-react';
import './CustomBurgerBuilder.css';

export default function CustomBurgerBuilder() {
  const { addToCart } = useApp();

  // Bun choices
  const BUNS = [
    { id: 'bun-brioche', name: 'Pão Brioche Selado', price: 0, color: '#e5a65d' },
    { id: 'bun-australiano', name: 'Pão Australiano Macio', price: 2.00, color: '#563e24' },
    { id: 'bun-glutenfree', name: 'Pão Sem Glúten', price: 4.00, color: '#dcb88f' }
  ];

  // Meat choices
  const MEATS = [
    { id: 'meat-beef150', name: 'Blend Bovino 150g', price: 12.00, color: '#583626' },
    { id: 'meat-beef300', name: 'Double Blend Bovino 300g', price: 20.00, color: '#44281c', isDouble: true },
    { id: 'meat-chicken', name: 'Frango Empanado Crocante', price: 10.00, color: '#d2a654' },
    { id: 'meat-veggie', name: 'Blend Futuro Vegano 130g', price: 15.00, color: '#68594f' }
  ];

  // Cheese choices
  const CHEESES = [
    { id: 'cheese-cheddar', name: 'Cheddar Cremoso', price: 3.50, color: '#ffaf1a' },
    { id: 'cheese-monterey', name: 'Monterey Jack Suave', price: 4.00, color: '#fff9e6' },
    { id: 'cheese-prato', name: 'Queijo Prato Clássico', price: 3.00, color: '#ffd166' },
    { id: 'cheese-none', name: 'Sem Queijo', price: 0, color: 'transparent' }
  ];

  // Salad choices (Multiple selection)
  const SALADS = [
    { id: 'salad-lettuce', name: 'Alface Americana', price: 0, color: '#4ade80' },
    { id: 'salad-tomato', name: 'Tomate Fresco', price: 0, color: '#f87171' },
    { id: 'salad-onion', name: 'Cebola Roxa', price: 0, color: '#c084fc' },
    { id: 'salad-pickles', name: 'Picles Artesanal', price: 2.00, color: '#859f3d' }
  ];

  // Sauces choices (Multiple selection)
  const SAUCES = [
    { id: 'sauce-house', name: 'Maionese Verde da Casa', price: 0, color: '#bce4b5' },
    { id: 'sauce-bbq', name: 'Barbecue Defumado', price: 1.50, color: '#742013' },
    { id: 'sauce-ketchup', name: 'Ketchup Artesanal', price: 0, color: '#dc2626' }
  ];

  // Extra add-ons (Multiple selection)
  const ADDONS = [
    { id: 'add-bacon', name: 'Bacon fatiado bem crocante', price: 4.50, color: '#a7383a' },
    { id: 'add-egg', name: 'Ovo Frito Gema Mole', price: 2.50, color: '#ffffff' },
    { id: 'add-caramelized', name: 'Cebola Caramelizada', price: 3.00, color: '#78350f' }
  ];

  // Builder States
  const [bun, setBun] = useState(BUNS[0]);
  const [meat, setMeat] = useState(MEATS[0]);
  const [doneness, setDoneness] = useState('Ao ponto');
  const [cheese, setCheese] = useState(CHEESES[0]);
  const [selectedSalads, setSelectedSalads] = useState([SALADS[0], SALADS[1]]); // Default lettuce, tomato
  const [selectedSauces, setSelectedSauces] = useState([SAUCES[0]]);
  const [selectedAddons, setSelectedAddons] = useState([]);
  const [notes, setNotes] = useState('');

  // Handle Multi Selections
  const toggleSalad = (item) => {
    if (selectedSalads.some(s => s.id === item.id)) {
      setSelectedSalads(prev => prev.filter(s => s.id !== item.id));
    } else {
      setSelectedSalads(prev => [...prev, item]);
    }
  };

  const toggleSauce = (item) => {
    if (selectedSauces.some(s => s.id === item.id)) {
      setSelectedSauces(prev => prev.filter(s => s.id !== item.id));
    } else {
      setSelectedSauces(prev => [...prev, item]);
    }
  };

  const toggleAddon = (item) => {
    if (selectedAddons.some(a => a.id === item.id)) {
      setSelectedAddons(prev => prev.filter(a => a.id !== item.id));
    } else {
      setSelectedAddons(prev => [...prev, item]);
    }
  };

  // Calculator
  const getCustomBurgerPrice = () => {
    const baseCost = 10.00; // base artisan bread prep cost
    const bunCost = bun.price;
    const meatCost = meat.price;
    const cheeseCost = cheese.price;
    const saladsCost = selectedSalads.reduce((sum, s) => sum + s.price, 0);
    const saucesCost = selectedSauces.reduce((sum, s) => sum + s.price, 0);
    const addonsCost = selectedAddons.reduce((sum, a) => sum + a.price, 0);

    return baseCost + bunCost + meatCost + cheeseCost + saladsCost + saucesCost + addonsCost;
  };

  // Submit to AppContext Cart
  const handleAddToOrder = () => {
    // Generate addon list to fit the standard cart item structure
    const allCustomAddons = [
      { name: `Pão: ${bun.name}`, price: bun.price },
      { name: `Carne: ${meat.name}`, price: meat.price },
      ...(meat.id.startsWith('meat-beef') ? [{ name: `Ponto da carne: ${doneness}`, price: 0 }] : []),
      { name: `Queijo: ${cheese.name}`, price: cheese.price },
      ...selectedSalads.map(s => ({ name: s.name, price: s.price })),
      ...selectedSauces.map(s => ({ name: `Molho: ${s.name}`, price: s.price })),
      ...selectedAddons.map(a => ({ name: a.name, price: a.price }))
    ];

    const customProduct = {
      id: 'custom-artisan-burger',
      name: 'Hambúrguer Customizado',
      description: `Pão ${bun.name}, ${meat.name}${meat.id.startsWith('meat-beef') ? ` (${doneness})` : ''}, ${cheese.name}. Saladas: ${selectedSalads.map(s=>s.name).join(', ') || 'Nenhuma'}. Molhos: ${selectedSauces.map(s=>s.name).join(', ') || 'Nenhum'}.`,
      price: 10.00, // base prep
      image: 'https://images.unsplash.com/photo-1568901346375-23c9450c58cd?auto=format&fit=crop&w=300&q=80',
    };

    addToCart(customProduct, 1, 'Padrão Custom', allCustomAddons, notes || 'Hambúrguer feito pelo construtor de hambúrguer artesanal.');
    
    // Reset options
    setSelectedAddons([]);
    setNotes('');
  };

  return (
    <section id="builder" className="builder-section section-padding">
      <div className="section-header">
        <div className="section-badge">
          <Flame size={14} />
          <span>Chef por um Dia</span>
        </div>
        <h2 className="section-title">Monte seu <span className="neon-text-red">Hambúrguer</span></h2>
        <p className="section-subtitle">
          Escolha cada detalhe e monte uma obra-prima artesanal com a sua cara. Nós grelhamos exatamente do seu jeito!
        </p>
      </div>

      <div className="builder-container">
        {/* Visual Burger Render (LEFT) */}
        <div className="builder-preview-box glass-glow">
          <div className="burger-rendering-canvas">
            {/* Top Bun */}
            <div 
              className="burger-layer bun-top" 
              style={{ backgroundColor: bun.color }}
            >
              <div className="sesame-seeds"></div>
            </div>

            {/* Addons (Bacon, Eggs, Onion) */}
            {selectedAddons.some(a => a.id === 'add-egg') && <div className="burger-layer layer-egg"></div>}
            {selectedAddons.some(a => a.id === 'add-bacon') && <div className="burger-layer layer-bacon"></div>}
            {selectedAddons.some(a => a.id === 'add-caramelized') && <div className="burger-layer layer-caramelized"></div>}

            {/* Cheese Melt Drips */}
            {cheese.id !== 'cheese-none' && (
              <div className="burger-layer layer-cheese" style={{ backgroundColor: cheese.color }}>
                <div className="cheese-drip left" style={{ backgroundColor: cheese.color }}></div>
                <div className="cheese-drip right" style={{ backgroundColor: cheese.color }}></div>
              </div>
            )}

            {/* Meat Patties */}
            <div className="burger-layer layer-meat" style={{ backgroundColor: meat.color }}>
              {meat.isDouble && (
                <>
                  <div className="burger-layer cheese-between" style={{ backgroundColor: cheese.color }}></div>
                  <div className="burger-layer layer-meat-double" style={{ backgroundColor: meat.color }}></div>
                </>
              )}
            </div>

            {/* Salads (Lettuce, Tomato, Onion, Pickles) */}
            {selectedSalads.some(s => s.id === 'salad-onion') && <div className="burger-layer layer-onion"></div>}
            {selectedSalads.some(s => s.id === 'salad-tomato') && <div className="burger-layer layer-tomato"></div>}
            {selectedSalads.some(s => s.id === 'salad-pickles') && <div className="burger-layer layer-pickles"></div>}
            {selectedSalads.some(s => s.id === 'salad-lettuce') && <div className="burger-layer layer-lettuce"></div>}

            {/* Sauces layer */}
            {selectedSauces.length > 0 && <div className="burger-layer layer-sauce"></div>}

            {/* Bottom Bun */}
            <div className="burger-layer bun-bottom" style={{ backgroundColor: bun.color }}></div>
          </div>
          
          <div className="builder-pricing-card glass">
            <h3>Seu Hambúrguer Customizado</h3>
            <div className="pricing-total-block">
              <span>Valor Total</span>
              <h2>R$ {getCustomBurgerPrice().toFixed(2)}</h2>
            </div>
            <button onClick={handleAddToOrder} className="neon-btn builder-add-btn">
              <Plus size={18} />
              <span>Adicionar ao Meu Pedido</span>
            </button>
            <p className="prep-time-disclaimer">⏱️ Tempo adicional de preparo: 5 min</p>
          </div>
        </div>

        {/* Builder Controls (RIGHT) */}
        <div className="builder-controls glass">
          <div className="control-tabs-container">
            {/* 1. Bun */}
            <div className="builder-control-group">
              <h4 className="control-title">1. Escolha o Pão</h4>
              <div className="options-grid">
                {BUNS.map(b => (
                  <button 
                    key={b.id}
                    onClick={() => setBun(b)}
                    className={`option-btn ${bun.id === b.id ? 'active' : ''}`}
                  >
                    <span>{b.name}</span>
                    <span className="option-price">{b.price > 0 ? `+ R$ ${b.price.toFixed(2)}` : 'Grátis'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 2. Meat */}
            <div className="builder-control-group">
              <h4 className="control-title">2. Escolha o Blend de Carne</h4>
              <div className="options-grid">
                {MEATS.map(m => (
                  <button 
                    key={m.id}
                    onClick={() => setMeat(m)}
                    className={`option-btn ${meat.id === m.id ? 'active' : ''}`}
                  >
                    <span>{m.name}</span>
                    <span className="option-price">+ R$ {m.price.toFixed(2)}</span>
                  </button>
                ))}
              </div>

              {meat.id.startsWith('meat-beef') && (
                <div className="builder-doneness-row glass">
                  <span className="doneness-label">Ponto da carne</span>
                  <div className="doneness-options">
                    {['Mal passado', 'Ao ponto', 'Bem passado'].map(opt => (
                      <button
                        key={opt}
                        type="button"
                        onClick={() => setDoneness(opt)}
                        className={`doneness-btn ${doneness === opt ? 'active' : ''}`}
                      >
                        {opt}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* 3. Cheese */}
            <div className="builder-control-group">
              <h4 className="control-title">3. Escolha o Queijo</h4>
              <div className="options-grid">
                {CHEESES.map(c => (
                  <button 
                    key={c.id}
                    onClick={() => setCheese(c)}
                    className={`option-btn ${cheese.id === c.id ? 'active' : ''}`}
                  >
                    <span>{c.name}</span>
                    <span className="option-price">{c.price > 0 ? `+ R$ ${c.price.toFixed(2)}` : 'Incluso'}</span>
                  </button>
                ))}
              </div>
            </div>

            {/* 4. Salad Multi Selection */}
            <div className="builder-control-group">
              <h4 className="control-title">4. Salada Fresca (Opcional)</h4>
              <div className="options-grid">
                {SALADS.map(s => {
                  const isActive = selectedSalads.some(active => active.id === s.id);
                  return (
                    <button 
                      key={s.id}
                      onClick={() => toggleSalad(s)}
                      className={`option-btn ${isActive ? 'active' : ''}`}
                    >
                      <input type="checkbox" checked={isActive} readOnly className="control-checkbox" />
                      <span>{s.name}</span>
                      <span className="option-price">{s.price > 0 ? `+ R$ ${s.price.toFixed(2)}` : 'Grátis'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 5. Sauces Multi Selection */}
            <div className="builder-control-group">
              <h4 className="control-title">5. Escolha os Molhos</h4>
              <div className="options-grid">
                {SAUCES.map(s => {
                  const isActive = selectedSauces.some(active => active.id === s.id);
                  return (
                    <button 
                      key={s.id}
                      onClick={() => toggleSauce(s)}
                      className={`option-btn ${isActive ? 'active' : ''}`}
                    >
                      <input type="checkbox" checked={isActive} readOnly className="control-checkbox" />
                      <span>{s.name}</span>
                      <span className="option-price">{s.price > 0 ? `+ R$ ${s.price.toFixed(2)}` : 'Grátis'}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* 6. Extras Multi Selection */}
            <div className="builder-control-group">
              <h4 className="control-title">6. Adicionais Premium</h4>
              <div className="options-grid">
                {ADDONS.map(a => {
                  const isActive = selectedAddons.some(active => active.id === a.id);
                  return (
                    <button 
                      key={a.id}
                      onClick={() => toggleAddon(a)}
                      className={`option-btn ${isActive ? 'active' : ''}`}
                    >
                      <input type="checkbox" checked={isActive} readOnly className="control-checkbox" />
                      <span>{a.name}</span>
                      <span className="option-price">+ R$ {a.price.toFixed(2)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Notes */}
            <div className="builder-control-group">
              <h4 className="control-title">Observações do Hambúrguer</h4>
              <textarea 
                placeholder="Ex: Hambúrguer ao ponto para mal passado, sem salada, molho à parte..." 
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                className="builder-textarea glass"
              />
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
