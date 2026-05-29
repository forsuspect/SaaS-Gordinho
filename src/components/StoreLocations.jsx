import React, { useState, useRef } from 'react';
import { MapPin, Navigation, Clock, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react';
import './StoreLocations.css';

const stores = [
  {
    id: 'store-1',
    label: 'Unidade 1',
    name: 'Unidade Principal',
    address: 'Rua José Jaime Coutinho Dias, 366\nBairro Novo — Carpina / PE',
    hours: 'Terça a Domingo  •  18h00 às 23h30',
    mapQuery: 'Rua José Jaime Coutinho Dias, 366 - Bairro Novo, Carpina - PE',
  },
  {
    id: 'store-2',
    label: 'Unidade 2',
    name: 'Arena Carpina',
    address: 'Av. Dr. Manoel Maynard, 1456\nCentro — Carpina / PE',
    hours: 'Terça a Domingo  •  18h00 às 23h30',
    mapQuery: 'Av. Dr. Manoel Maynard, 1456 - Centro, Carpina - PE',
  },
  {
    id: 'store-3',
    label: 'Unidade 3',
    name: 'Gordinho Frios & Embalagens',
    address: 'Rua Dom Pedro II, 89\nSão José — Carpina / PE',
    hours: 'Terça a Domingo  •  18h00 às 23h30',
    mapQuery: 'Rua Dom Pedro II, 89 - São José, Carpina - PE',
  },
];

function StoreCard({ store }) {
  const routeUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(store.mapQuery)}`;
  const mapsUrl  = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(store.mapQuery)}`;
  const embedUrl = `https://www.google.com/maps?q=${encodeURIComponent(store.mapQuery)}&output=embed`;

  return (
    <div className="loc-card">
      {/* ── top badge ── */}
      <div className="loc-card-top">
        <span className="loc-badge">
          <MapPin size={11} />
          {store.label}
        </span>
      </div>

      {/* ── info block ── */}
      <div className="loc-info">
        <strong className="loc-store-name">{store.name}</strong>
        <p className="loc-address">{store.address}</p>

        <div className="loc-hours-row">
          <Clock size={13} className="loc-hours-ic" />
          <span>{store.hours}</span>
        </div>
      </div>

      {/* ── action buttons ── */}
      <div className="loc-actions">
        <a className="loc-btn loc-btn-primary" href={routeUrl} target="_blank" rel="noopener noreferrer">
          <Navigation size={15} />
          Traçar rota
        </a>
        <a className="loc-btn loc-btn-ghost" href={mapsUrl} target="_blank" rel="noopener noreferrer">
          <ExternalLink size={14} />
          Maps
        </a>
      </div>

      {/* ── map ── */}
      <div className="loc-map-wrap">
        <iframe
          title={`Mapa - ${store.label}`}
          loading="lazy"
          referrerPolicy="no-referrer-when-downgrade"
          src={embedUrl}
          className="loc-map-iframe"
        />
      </div>
    </div>
  );
}

export default function StoreLocations() {
  const [active, setActive] = useState(0);
  const trackRef = useRef(null);
  const touchStartX = useRef(null);

  const prev = () => setActive(i => (i === 0 ? stores.length - 1 : i - 1));
  const next = () => setActive(i => (i === stores.length - 1 ? 0 : i + 1));

  /* touch swipe */
  const onTouchStart = (e) => { touchStartX.current = e.touches[0].clientX; };
  const onTouchEnd   = (e) => {
    if (touchStartX.current === null) return;
    if (!e.changedTouches || e.changedTouches.length === 0) return;
    const dx = touchStartX.current - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 40) dx > 0 ? next() : prev();
    touchStartX.current = null;
  };

  return (
    <section id="locations" className="locations-section section-padding">
      <div className="locations-container">

        {/* ── header ── */}
        <div className="section-header">
          <div className="section-badge">
            <MapPin size={14} />
            <span>Lojas &amp; Localização</span>
          </div>
          <h2 className="section-title">
            Encontre uma <span className="neon-text-red">unidade</span>
          </h2>
          <p className="section-subtitle">
            3 unidades em Carpina — escolha a mais perto, veja o mapa e trace a rota.
          </p>
        </div>

        {/* ══ DESKTOP — grid 3 colunas ══ */}
        <div className="loc-desktop-grid">
          {stores.map(s => <StoreCard key={s.id} store={s} />)}
        </div>

        {/* ══ MOBILE — carrossel ══ */}
        <div className="loc-carousel-shell">
          <div
            className="loc-carousel-track"
            ref={trackRef}
            onTouchStart={onTouchStart}
            onTouchEnd={onTouchEnd}
            style={{ '--active-index': active }}
          >
            {stores.map(s => (
              <div key={s.id} className="loc-carousel-slide">
                <StoreCard store={s} />
              </div>
            ))}
          </div>

          {/* arrows */}
          <button className="loc-arrow loc-arrow-left"  onClick={prev} aria-label="Anterior">
            <ChevronLeft size={20} />
          </button>
          <button className="loc-arrow loc-arrow-right" onClick={next} aria-label="Próximo">
            <ChevronRight size={20} />
          </button>

          {/* dots */}
          <div className="loc-dots">
            {stores.map((_, i) => (
              <button
                key={i}
                className={`loc-dot${i === active ? ' active' : ''}`}
                onClick={() => setActive(i)}
                aria-label={`Unidade ${i + 1}`}
              />
            ))}
          </div>
        </div>

      </div>
    </section>
  );
}
