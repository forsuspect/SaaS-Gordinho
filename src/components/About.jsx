import React from 'react';
import { ShieldCheck, Flame, Heart, Award } from 'lucide-react';
import './About.css';

export default function About() {
  return (
    <section id="about" className="about-section section-padding">
      <div className="about-container">
        {/* Visual grid side */}
        <div className="about-visuals">
          <div className="grid-collage">
            <div className="collage-img-wrapper large">
              <img 
                src="https://images.unsplash.com/photo-1550547660-d9450f859349?auto=format&fit=crop&w=600&q=80" 
                alt="Churrasqueira fogo premium" 
                className="collage-img"
              />
            </div>
            
            <div className="collage-img-wrapper small glass-glow">
              <div className="collage-stat">
                <h2>100%</h2>
                <p>Grelhado no Fogo</p>
              </div>
            </div>

            <div className="collage-img-wrapper medium">
              <img 
                src="https://images.unsplash.com/photo-1572802419224-296b0aeee0d9?auto=format&fit=crop&w=600&q=80" 
                alt="Preparando hambúrguer brioche" 
                className="collage-img"
              />
            </div>
          </div>
        </div>

        {/* Written history / selling side */}
        <div className="about-content">
          <div className="section-badge-left">
            <Award size={14} />
            <span>Nossa História</span>
          </div>
          
          <h2 className="about-title">Nascidos da Paixão pelo <span className="neon-text-red">Verdadeiro Fogo</span></h2>
          
          <p className="about-text">
            O **Gordinho Burguer** começou em 2018 com um único propósito: resgatar a essência do hambúrguer clássico grelhado em fogo alto, como nos melhores churrascos americanos.
          </p>
          
          <p className="about-text">
            Nossos blends são moídos diariamente com carnes nobres e frescas (nunca congeladas), nosso queijo cheddar é derretido no vapor e nossos pães brioche são assados artesanalmente todas as manhãs. Não é apenas fast-food, é culinária e paixão.
          </p>

          {/* Pillars List */}
          <div className="about-pillars">
            <div className="pillar-card glass">
              <Flame size={24} className="pillar-icon" />
              <div>
                <h4>Grelhado de Verdade</h4>
                <p>Carnes defumadas nas brasas para garantir aquele sabor defumado inconfundível.</p>
              </div>
            </div>

            <div className="pillar-card glass">
              <ShieldCheck size={24} className="pillar-icon" />
              <div>
                <h4>Zero Conservantes</h4>
                <p>Ingredientes 100% naturais de produtores locais selecionados.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
