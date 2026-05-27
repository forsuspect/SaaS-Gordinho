import React, { useState, useEffect } from 'react';
import { useApp } from '../context/AppContext';
import ProductCard from './ProductCard';
import { Search, Filter, Flame, Utensils, CupSoda, IceCream, Sparkles } from 'lucide-react';
import './MenuSection.css';

export default function MenuSection({ onProductClick }) {
  const { products, categories } = useApp();
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Trigger brief skeleton loading effect on filter change to wow users
  useEffect(() => {
    setIsLoading(true);
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, [selectedCategory, searchQuery]);

  // Helper to map icon names to Lucide icons
  const getCategoryIcon = (iconName) => {
    switch (iconName) {
      case 'Sparkles': return <Sparkles size={16} />;
      case 'Flame': return <Flame size={16} />;
      case 'Utensils': return <Utensils size={16} />;
      case 'CupSoda': return <CupSoda size={16} />;
      case 'IceCream': return <IceCream size={16} />;
      default: return <Filter size={16} />;
    }
  };

  // Filter items based on query and category
  const filteredProducts = products.filter(product => {
    const matchesCategory = selectedCategory === 'all' || product.category_id === selectedCategory;
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          product.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <section id="menu" className="menu-section section-padding">
      <div className="section-header">
        <div className="section-badge">
          <Utensils size={14} />
          <span>Cardápio Artesanal</span>
        </div>
        <h2 className="section-title">Nossas <span className="neon-text-red">Criações</span></h2>
        <p className="section-subtitle">
          Explore nossos burguers grelhados no fogo, acompanhamentos crocantes e sobremesas insanas.
        </p>
      </div>

      {/* Filter and Search Controls */}
      <div className="menu-controls-container">
        {/* Search */}
        <div className="menu-search-wrapper glass">
          <Search size={18} className="search-icon" />
          <input 
            type="text" 
            placeholder="Buscar seu burger favorito..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="menu-search-input"
          />
        </div>

        {/* Category Pills */}
        <div className="menu-categories-pills">
          <button 
            onClick={() => setSelectedCategory('all')} 
            className={`category-pill glass ${selectedCategory === 'all' ? 'active' : ''}`}
          >
            <Filter size={14} />
            <span>Todos</span>
          </button>
          
          {categories.map(cat => (
            <button 
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)} 
              className={`category-pill glass ${selectedCategory === cat.id ? 'active' : ''}`}
            >
              {getCategoryIcon(cat.icon)}
              <span>{cat.name}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Products Display (with Skeleton Loaders) */}
      {isLoading ? (
        <div className="grid-responsive">
          {[1, 2, 3, 4].map(n => (
            <div key={n} className="skeleton-card glass">
              <div className="skeleton skeleton-img"></div>
              <div className="skeleton-info">
                <div className="skeleton skeleton-title"></div>
                <div className="skeleton skeleton-text"></div>
                <div className="skeleton skeleton-text short"></div>
                <div className="skeleton-footer">
                  <div className="skeleton skeleton-price"></div>
                  <div className="skeleton skeleton-btn"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : filteredProducts.length > 0 ? (
        <div className="grid-responsive">
          {filteredProducts.map(product => (
            <ProductCard 
              key={product.id} 
              product={product} 
              onAddClick={onProductClick} 
            />
          ))}
        </div>
      ) : (
        <div className="menu-empty-state glass">
          <p className="empty-emoji">🍔</p>
          <h3>Nenhum burger encontrado</h3>
          <p>Tente ajustar a busca ou limpar os filtros para encontrar o que deseja.</p>
          {(searchQuery || selectedCategory !== 'all') && (
            <button 
              onClick={() => { setSearchQuery(''); setSelectedCategory('all'); }} 
              className="neon-btn reset-filters-btn"
            >
              Limpar Filtros
            </button>
          )}
        </div>
      )}
    </section>
  );
}
