import { Compass, LayoutGrid } from 'lucide-react';
import './HeroSection.css';

export default function HeroSection({ onExploreShops, onBrowseCategories }) {
  return (
    <section className="hero" id="hero-section">
      {/* Decorative background circles */}
      <div className="hero-bg-circle hero-bg-circle--1" />
      <div className="hero-bg-circle hero-bg-circle--2" />
      <div className="hero-bg-circle hero-bg-circle--3" />

      <div className="hero-inner">
        {/* Left: text content */}
        <div className="hero-content">
          {/* Carousel dots */}
          <div className="hero-dots">
            <span className="hero-dot hero-dot--active" />
            <span className="hero-dot" />
            <span className="hero-dot" />
            <span className="hero-dot" />
          </div>

          {/* Badge */}
          <div className="hero-badge">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
            <span>Hyperlocal Discovery</span>
          </div>

          {/* Headline */}
          <h1 className="hero-heading">
            See what's really on the shelf, before you walk in with Getsy.
          </h1>

          {/* Supporting text */}
          <p className="hero-text">
            Explore local shops and see what's actually on their shelves. From
            clothing and footwear to hardware and jewellery, find it all without
            leaving your neighbourhood.
          </p>

          {/* CTA buttons */}
          <div className="hero-actions">
            <button
              className="hero-btn hero-btn--primary"
              onClick={onExploreShops}
              id="explore-shops-btn"
            >
              <Compass size={16} />
              <span>Explore Shops</span>
            </button>
            <button
              className="hero-btn hero-btn--secondary"
              onClick={onBrowseCategories}
              id="browse-categories-btn"
            >
              <LayoutGrid size={16} />
              <span>Browse Categories</span>
            </button>
          </div>
        </div>

        {/* Right: illustration placeholder */}
        <div className="hero-illustration">
          <svg
            viewBox="0 0 320 340"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="hero-illustration-svg"
            aria-hidden="true"
          >
            {/* Phone body */}
            <rect x="80" y="30" width="160" height="280" rx="20" fill="#1a2432" />
            <rect x="88" y="50" width="144" height="244" rx="4" fill="#e6f7f2" />

            {/* Map-like content */}
            <rect x="88" y="50" width="144" height="244" rx="4" fill="#d5efe8" />
            <path d="M88 120 Q 130 90, 160 110 T 232 100" stroke="#0e8c7f" strokeWidth="2" opacity="0.4" fill="none" />
            <path d="M88 180 Q 140 160, 180 175 T 232 165" stroke="#0e8c7f" strokeWidth="1.5" opacity="0.3" fill="none" />
            <rect x="100" y="60" width="120" height="16" rx="8" fill="#0e8c7f" opacity="0.15" />

            {/* Location pins */}
            <g transform="translate(130, 100)">
              <circle cx="0" cy="-8" r="12" fill="#0e8c7f" />
              <circle cx="0" cy="-8" r="5" fill="white" />
              <path d="M0 4 L-6 -6 Q0 -16 6 -6 Z" fill="#0e8c7f" />
            </g>
            <g transform="translate(180, 150)">
              <circle cx="0" cy="-8" r="10" fill="#e8922d" />
              <circle cx="0" cy="-8" r="4" fill="white" />
              <path d="M0 2 L-5 -5 Q0 -14 5 -5 Z" fill="#e8922d" />
            </g>
            <g transform="translate(120, 200)">
              <circle cx="0" cy="-8" r="10" fill="#ef4444" />
              <circle cx="0" cy="-8" r="4" fill="white" />
              <path d="M0 2 L-5 -5 Q0 -14 5 -5 Z" fill="#ef4444" />
            </g>
            <g transform="translate(200, 220)">
              <circle cx="0" cy="-6" r="8" fill="#0e8c7f" opacity="0.7" />
              <circle cx="0" cy="-6" r="3" fill="white" />
            </g>

            {/* Bottom card on phone */}
            <rect x="96" y="250" width="128" height="36" rx="8" fill="white" />
            <rect x="104" y="258" width="50" height="6" rx="3" fill="#0e8c7f" opacity="0.5" />
            <rect x="104" y="270" width="80" height="4" rx="2" fill="#d1d5db" />

            {/* Phone notch */}
            <rect x="135" y="35" width="50" height="8" rx="4" fill="#374151" />
          </svg>

          {/* Floating pin decorations */}
          <div className="hero-floating-pin hero-floating-pin--1">
            <svg width="24" height="30" viewBox="0 0 24 30" fill="none">
              <path d="M12 28 C12 28 22 18 22 11 A10 10 0 0 0 2 11 C2 18 12 28 12 28Z" fill="#0e8c7f" opacity="0.2"/>
              <circle cx="12" cy="11" r="4" fill="#0e8c7f" opacity="0.3"/>
            </svg>
          </div>
          <div className="hero-floating-pin hero-floating-pin--2">
            <svg width="20" height="26" viewBox="0 0 24 30" fill="none">
              <path d="M12 28 C12 28 22 18 22 11 A10 10 0 0 0 2 11 C2 18 12 28 12 28Z" fill="#e8922d" opacity="0.25"/>
              <circle cx="12" cy="11" r="4" fill="#e8922d" opacity="0.35"/>
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
