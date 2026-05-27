import React from 'react';
import { Star, MessageSquare } from 'lucide-react';
import './Reviews.css';

export default function Reviews() {
  const TESTIMONIALS = [
    {
      id: 1,
      name: 'Gabriel Menezes',
      role: 'Local Guide',
      text: 'O Monster Cheddar é inacreditável! O queijo derrete na boca e a cebola caramelizada dá um toque fantástico. Entrega super rápida, chegou pelando em casa!',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 2,
      name: 'Letícia Barbosa',
      role: 'Food Blogger',
      text: 'Fiz a customização do meu burger e adorei! Coloquei cebola caramelizada e ovo frito gema mole, a combinação com o pão australiano ficou perfeita. Minha hamburgueria favorita agora.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&w=100&q=80'
    },
    {
      id: 3,
      name: 'Thiago Martins',
      role: 'Cliente VIP',
      text: 'Batata rústica muito crocante e sequinha! O combo Gordinho Burguer vale muito a pena pelo preço e sabor. Além disso, a maionese verde artesanal deles é sem igual.',
      rating: 5,
      avatar: 'https://images.unsplash.com/photo-1599566150163-29194dcaad36?auto=format&fit=crop&w=100&q=80'
    }
  ];

  return (
    <section id="reviews" className="reviews-section section-padding">
      <div className="section-header">
        <div className="section-badge">
          <MessageSquare size={14} />
          <span>Voz do Cliente</span>
        </div>
        <h2 className="section-title">Quem Experimenta, <span className="neon-text-red">Recomenda</span></h2>
        <p className="section-subtitle">
          Veja a opinião espontânea de quem já provou nossos smashs e combos premium e se apaixonou.
        </p>
      </div>

      <div className="reviews-grid">
        {TESTIMONIALS.map(rev => (
          <div key={rev.id} className="review-card glass">
            {/* Header info */}
            <div className="review-header">
              <img src={rev.avatar} alt={rev.name} className="review-avatar" />
              <div>
                <h4 className="review-name">{rev.name}</h4>
                <p className="review-role">{rev.role}</p>
              </div>
            </div>

            {/* Stars */}
            <div className="review-stars">
              {[...Array(rev.rating)].map((_, i) => (
                <Star key={i} size={16} fill="#ffb300" color="#ffb300" />
              ))}
            </div>

            {/* Text review */}
            <p className="review-text">"{rev.text}"</p>
            
            <div className="review-stamp">✓ Compra Verificada</div>
          </div>
        ))}
      </div>
    </section>
  );
}
