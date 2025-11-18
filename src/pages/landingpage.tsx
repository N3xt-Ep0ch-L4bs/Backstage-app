import React from "react";
import { useNavigate } from "react-router-dom";
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
    </>
  );
};

export default LandingPage;
