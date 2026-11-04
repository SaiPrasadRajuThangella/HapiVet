import { Link } from 'react-router-dom';
import { useCollection } from '../lib/store';
import { LOGO } from './Navbar';

export default function Footer() {
  const settings = useCollection('settings');
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <img src={LOGO} alt="HapiVet AI" loading="lazy" />
            <p style={{ maxWidth: 320 }}>AI-native practice management for modern veterinary clinics. Built by veterinarians, for veterinarians.</p>
            <p style={{ marginTop: 14 }}>{settings.address}</p>
          </div>
          <div>
            <h4>Product</h4>
            <ul>
              <li><Link to="/#agents">AI Agents</Link></li>
              <li><Link to="/#copilot">Clinical Copilot</Link></li>
              <li><Link to="/#revenue">Billing & Payments</Link></li>
              <li><Link to="/pricing">Pricing</Link></li>
            </ul>
          </div>
          <div>
            <h4>Company</h4>
            <ul>
              <li><Link to="/about">About Us</Link></li>
              <li><Link to="/#achievements">Achievements</Link></li>
              <li><Link to="/demo">Book a Demo</Link></li>
              <li><Link to="/contact">Contact Us</Link></li>
            </ul>
          </div>
          <div>
            <h4>Connect</h4>
            <ul>
              <li><a href={settings.linkedin} target="_blank" rel="noreferrer">LinkedIn</a></li>
              <li><Link to="/admin">Admin Panel</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <span>© {new Date().getFullYear()} HapiVet Inc. All rights reserved.</span>
          <span>Privacy Policy · Terms of Service</span>
        </div>
      </div>
    </footer>
  );
}
