import React from "react";
import { useNavigate } from "react-router-dom";
import "./components.css";
import ConnectWalletButton from "./ConnectButton";

const Navbar: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="navbar">
      <div className="logo" onClick={() => navigate("/")}>
        <img src="" alt="logo" />
        <p>Backstage</p>
      </div>

      <nav className="nav-links">
        <a href="/">Home</a>
        <a href="/marketplace">Marketplace</a>
        <a href="/dashboard">Dashboard</a>
      </nav>

      <div className="connected-btn">
        <ConnectWalletButton />
      </div>
    </div>
  );
};

export default Navbar;
