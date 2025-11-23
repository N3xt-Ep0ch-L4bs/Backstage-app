import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import "./components.css";
import ConnectWalletButton from "./ConnectButton";
import { WalConversionButton } from "./walConversionButton";

const Navbar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <img src="" alt="logo" />
        <p>Backstage</p>
      </div>

      <nav className="nav-links">
        <Link to="/" className={`nav-link ${isActive("/") ? "active" : ""}`}>
          Home
        </Link>

        <Link
          to="/marketplace"
          className={`nav-link ${isActive("/marketplace") ? "active" : ""}`}
        >
          Marketplace
        </Link>

        <Link
          to="/dashboard"
          className={`nav-link ${isActive("/dashboard") ? "active" : ""}`}
        >
          Dashboard
        </Link>
      </nav>

      <div className="wallet-section">
        <WalConversionButton /> 
        <ConnectWalletButton />
      </div>
      
    </div>
  );
};

export default Navbar;
