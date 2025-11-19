import React from "react";
import { useNavigate } from "react-router-dom";
import TrueLogo from "../assets/true.png";
import SealLogo from "../assets/seal.png";
import SuiLogo from "../assets/sui.png";
import "./landingpage.css";
import Navbar from "../components/navbar";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <>
      <section className="hero">
        <Navbar />
        <div className="hero-content">
          <h1>Backstage - Own the Story Behind the Scenes.</h1>

          <p>
            The world's first Marketplace for exclusive behind-the-scenes
            content. Powered by Sui blockchain, Secured by SEAL, stored forever
            on Walrus.
          </p>

          <p>
            10,000+ Creators <span>•</span> 50,000+ BTS Videos <span>•</span>{" "}
            $2.5M+ Earned
          </p>

          <div className="hero-btn">
            <button className="connect-btn">Connect Wallet</button>

            <button
              onClick={() => navigate("/marketplace")}
              className="explore-btn"
            >
              Explore Marketplace
            </button>
          </div>
        </div>
      </section>
      <section className="why">
          <h2>Why Creators Choose Backstage</h2>
          <div className="why-cards">
            <div className="why-card">
              <img src="" />
              <h4>True Ownership</h4>
              <p>Upload exclusive BTS content directly to Walrus for permanent, decentralized storage. 
                No platform can take it down or change your terms.</p>
              <div className="why-list">
                <li>Immutable storage</li>
                <li>Creator-controlled pricing</li>
                <li>Direct fan relationships</li>
              </div>
            </div>
            <div className="why-card">
              <img src="" />
              <h4>SEAL-Protected Access</h4>
              <p>Every purchase creates a unique SEAL access token. Set expiration dates, wallet 
                bindings, and custom policies. Your buyers get authenticated, secure access.</p>
                <div className="why-list">
                  <li>Customizable policies</li>
                  <li>Wallet-bound tokens</li>
                  <li>Automated enforcement</li>
                </div>
            </div>
            <div className="why-card">
              <img src="" />
              <h4>Instant Earnings</h4>
              <p>Every purchase creates a unique SEAL access token. Set expiration dates, wallet bindings, 
                and custom policies. Your buyers get authenticated, secure access.
              </p>
              <div className="why-list">
                <li>Instant settlement</li>
                <li>Low transaction fees</li>
                <li>Full transparency</li>
              </div>
            </div>
          </div>
      </section>
    </>
  );
};

export default LandingPage;
