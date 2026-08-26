import { Link } from 'react-router-dom';
import getsyLogo from '../../assets/getsy-logo.png.png';
import './Footer.css';

export default function Footer() {
  return (
    <footer className="footer" id="footer">
      <div className="footer-main">
        <div className="footer-inner">
          {/* Brand column */}
          <div className="footer-brand">
            <div className="footer-logo">
              <img
                src={getsyLogo}
                alt="Getsy Logo"
                className="footer-logo-img"
              />
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
