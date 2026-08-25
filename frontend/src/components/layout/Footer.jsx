import { Link } from 'react-router-dom';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-main">
        <div className="footer-inner">
          {/* Brand column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <svg width="36" height="36" viewBox="0 0 40 40" fill="none">
                <rect x="4" y="12" width="32" height="24" rx="4" fill="#0e8c7f" />
                <rect x="8" y="16" width="24" height="16" rx="2" fill="#ffffff" opacity="0.3" />
                <path d="M14 12V8a6 6 0 0 1 12 0v4" stroke="#0e8c7f" strokeWidth="3" fill="none" />
                <circle cx="16" cy="22" r="2" fill="#ffffff" />
                <circle cx="24" cy="22" r="2" fill="#ffffff" />
                <circle cx="20" cy="27" r="2" fill="#ffffff" />
                <circle cx="20" cy="22" r="1.5" fill="#e8922d" />
              </svg>
              <span className="footer-logo-text">Getsy</span>
            </div>
            <p className="footer-description">
              Hyperlocal product-discovery platform for Indian towns &amp; cities.
              See what's really on the shelf before you walk in.
            </p>
          </div>

          {/* Explore column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Explore</h4>
            <ul className="footer-column-links">
              <li><Link to="/categories">Footwear</Link></li>
              <li><Link to="/categories">Clothing</Link></li>
              <li><Link to="/categories">Ornaments</Link></li>
              <li><Link to="/categories">Accessories</Link></li>
              <li><Link to="/categories">Hardware</Link></li>
            </ul>
          </div>

          {/* Platform column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Platform</h4>
            <ul className="footer-column-links">
              <li><a href="#">Community Requests</a></li>
              <li><a href="#">Shop Owner Login</a></li>
              <li><a href="#">Customer Sign Up</a></li>
            </ul>
          </div>

          {/* Company column */}
          <div className="footer-column">
            <h4 className="footer-column-title">Company</h4>
            <ul className="footer-column-links">
              <li><a href="#">About Getsy</a></li>
              <li><a href="#">Support</a></li>
              <li><a href="#">Privacy Policy</a></li>
              <li><a href="#">Terms of Service</a></li>
            </ul>
          </div>
        </div>
      </div>

      {/* Bottom bar */}
      <div className="footer-bottom">
        <p>&copy; 2026 Getsy. All rights reserved. Know before you go.</p>
      </div>
    </footer>
  );
}
