import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./components.css";
import ConnectWalletButton from "./ConnectButton";
import { WalConversionButton } from "./walConversionButton";


const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <img src="" alt="logo" />
        <p>Backstage</p>
      </div>

      <nav className="nav-links">
        <NavLink to="/">Home</NavLink>
        <NavLink to="/marketplace">Marketplace</NavLink>
        <NavLink to="/dashboard">Dashboard</NavLink>
      </nav>

      <div className="wallet-section" style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
        <WalConversionButton />
        <ConnectWalletButton />
      </div>
    </div>
  );
};

// Custom NavLink component for consistent styling
const NavLink: React.FC<{ to: string; children: React.ReactNode }> = ({ to, children }) => {
  const location = useLocation();
  const isActive = location.pathname === to;
  
  return (
    <Link 
      to={to} 
      className={`nav-link ${isActive ? 'active' : ''}`}
      style={{
        display: 'flex',
        padding: '0.5rem 1rem',
        textDecoration: 'none',
        color: isActive ? '#2563eb' : '#4b5563',
        fontWeight: isActive ? '600' : '400',
        borderBottom: isActive ? '2px solid #2563eb' : '2px solid transparent',
        transition: 'all 0.2s ease-in-out',
      }}
    >
      {children}
    </Link>
  );
};

export default Navbar;
