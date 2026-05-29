import React from 'react';
import { Phone, MapPin, Clock } from 'lucide-react';
import './Footer.css';

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="footer-section">
      <div className="footer-container">
        {/* Brand details */}
        <div className="footer-brand-box">
          <div className="footer-logo">
            <img src="/logo.png" alt="Gordinho Burguer" className="brand-logo brand-logo-footer" />
            <span>Gordinho <span className="red-text">Burguer</span></span>
          </div>
          
          <p className="footer-about-text">
            O autêntico hambúrguer de verdade, grelhado direto no fogo alto. Sabor defumado, ingredientes selecionados e entrega ultra rápida.
          </p>

          {/* Socials */}
          <div className="social-icons">
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Acessar Instagram">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line></svg>
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-link" aria-label="Acessar Facebook">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
            </a>
          </div>
        </div>

        {/* Operating hours */}
        <div className="footer-links-group">
          <h4 className="footer-title">Funcionamento</h4>
          <div className="footer-hours">
            <div className="hours-row">
              <Clock size={16} className="footer-detail-icon" />
              <div>
                <p className="days">Terça a Domingo</p>
                <p className="time">18h00 às 23h30</p>
              </div>
            </div>
            <div className="hours-row closed">
              <Clock size={16} className="footer-detail-icon text-muted" />
              <div>
                <p className="days">Segunda-Feira</p>
                <p className="time text-muted">Fechado para descanso</p>
              </div>
            </div>
          </div>
        </div>

        {/* Contacts */}
        <div className="footer-links-group">
          <h4 className="footer-title">Contato & Endereço</h4>
          <ul className="footer-contacts">
            <li className="contact-row">
              <Phone size={16} className="footer-detail-icon" />
              <a href="tel:+5511999999999" className="contact-link">(11) 99999-9999</a>
            </li>
            <li className="contact-row">
              <MapPin size={16} className="footer-detail-icon" />
              <span className="address-text">Av. Paulista, 1000 - Bela Vista, São Paulo/SP</span>
            </li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <div className="footer-bottom-content">
          <p>© {currentYear} Gordinho Burguer. Todos os direitos reservados.</p>
          <p className="footer-dev">
            Desenvolvido por{' '}
            <a
              href="https://automize-one.vercel.app/"
              target="_blank"
              rel="noopener noreferrer"
              className="footer-dev-link"
            >
              Automize
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
