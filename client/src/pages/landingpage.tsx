import React from "react";
import { useNavigate } from "react-router-dom";

import Footer from "../components/footer";
import TrueLogo from "../assets/true.png";
import SealLogo from "../assets/seal.png";
import SuiLogo from "../assets/sui.png";
import "./landingpage.css";
import Navbar from "../components/navbar";
import ConnectWalletButton from "../components/ConnectButton";

const LandingPage: React.FC = () => {
  const navigate = useNavigate();

  const creators = [
  {
    name: "Luna Films",
    tag: "Documentary Filmmaker",
    subscribers: "1.9k",
    videos: 44,
    rating: 4.8,
    img: "src/assets/pic9 .png",
    cover: "src/assets/pic13.png",
  },
  {
    name: "Phoenix Productions",
    tag: "VFX Artist",
    subscribers: "850",
    videos: 32,
    rating: 4.6,
    img: "src/assets/pic10.png",
    cover: "src /assets/pic14.png",
  },
  {
    name: "Nebula Studios",
    tag: "Film Studio",
    subscribers: "2.4k",
    videos: 67,
    rating: 4.9,
    img: "src/assets/pic11.png",
    cover: "src/assets/pic15.png",
  },
  {
    name: "Echo Documentaries",
    tag: "Visual Storyteller",
    subscribers: "920",
    videos: 38,
    rating: 4.7,
    img: "src/assets/pic12.png",
    cover: "src/assets/pic16.png",
  },
];

const trending = [
  {
    creator: "Luna Films",
    price: "150 SUI",
    img: "src/assets/pic3.png",
    title: "The Symphony of Light: Making Of",
    time: "Released 5 hours ago",
  },
  {
    creator: "Nebula Studios",
    price: "50 SUI (rental)",
    img: "src/assets/pic2.png",
    title: "Cosmic Dawn: VFX Breakdown",
    time: "Released 2 hours ago",
  },
  {
    creator: "Echo Documentaries",
    price: "75 SUI",
    img: "src/assets/pic4.png",
    title: "Wilderness Whispers: Director’s Cut",
    time: "Released 1 day ago",
  },
];

const techFeatures = [
  {
    img: "src/assets/pic19.png",
    title: "Lightning-Fast Transactions",
    desc: "Powered by high-performance smart contracts for instant purchases and efficient creator payouts."
  },
  {
    img: "src/assets/pic17.png",
    title: "Permanent Decentralized Storage",
    desc: "Your content is preserved on a decentralized network, ensuring longevity and tamper-proof delivery without any central failures."
  },
  {
    img: "src/assets/pic18.png",
    title: "Advanced Access Control",
    desc: "Blockchain-verified access ensures only paying viewers unlock premium content."
  }
];

const testimonials = [
  {
    text: "“The transparency and payout model is way better than traditional platforms. I actually feel in control of my work.”",
    name: "Sarah Cole",
    role: "Film Creator",
    img: "src/assets/Ellipse9.png"
  },
  {
    text: "“My BTS content blew up here. The blockchain access system is shockingly smooth. Totally impressed.”",
    name: "Marcus Blake",
    role: "VFX Artist",
    img: "src/assets/Ellipse10.png"
  },
  {
    text: "“The best platform for creators who want to protect their work. And the payment system? Instant. I love it.”",
    name: "Nina Howard",
    role: "Documentary Producer",
    img: "src/assets/Group(3).png"
  }
];

const stats = [
  { label: "Active Creators", value: "10,000+" },
  { label: "BTS Videos", value: "50,000+" },
  { label: "Creator Earnings", value: "$2.5M+" },
  { label: "Creator Satisfaction", value: "95%" }
];

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
            <ConnectWalletButton />

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
              <img src={TrueLogo} />
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
              <img src={SealLogo} />
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
              <img src={SuiLogo} />
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
       <section className="creators-section">
      <h2 className="section-title">Meet Our Top Creators</h2>
      <p className="section-sub">Industry professionals sharing their creative process</p>

      <div className="creators-grid">
        {creators.map((c, index) => (
          <div className="creator-card" key={index}>
            <img src={c.img} className="creator-avatar" />
            <h3>{c.name}</h3>
            <span className="creator-tag">{c.tag}</span>

            <div className="creator-stats">
              <span>{c.subscribers} Subscribers</span>
              <span>{c.videos} Videos</span>
              <span>⭐ {c.rating}</span>
            </div>

            <img src={c.cover} className="creator-cover" />

            <button className="view-profile">VIEW PROFILE</button>
          </div>
        ))}
      </div>
    </section>
    <section className="trending-section">
      <div className="trending-header">
        <h2>Trending Behind-the-Scenes</h2>
        <a className="view-all">View All →</a>
      </div>

      <div className="trending-grid">
        {trending.map((t, index) => (
          <div className="trending-card" key={index}>
            <img src={t.img} className="trending-img" />

            <div className="card-top">
              <span className="creator-tag">{t.creator}</span>
              <span className="price-tag">{t.price}</span>
            </div>

            <h3>{t.title}</h3>
            <p>{t.time}</p>
          </div>
        ))}
      </div>
    </section>
     <section className="tech-section">
        <h2 className="section-title">Built on Cutting-Edge Web3 Tech</h2>

        <div className="tech-grid">
          {techFeatures.map((item, i) => (
            <div className="tech-card" key={i}>
              <img className="tech-img" src={item.img} />
              <h3>{item.title}</h3>
              <p>{item.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Testimonials */}
      <section className="testimonial-section">
        <h2 className="section-title">Loved by Creators Worldwide</h2>

        <div className="testimonial-grid">
          {testimonials.map((t, i) => (
            <div className="testimonial-card" key={i}>
              <p className="testimonial-text">{t.text}</p>

              <div className="testimonial-user">
                <img src={t.img} className="testimonial-avatar" />
                <div>
                  <h4>{t.name}</h4>
                  <span>{t.role}</span>
                </div>
              </div>

              <div className="stars">⭐⭐⭐⭐⭐</div>
            </div>
          ))}
        </div>
      </section>

      {/* Stats */}
      <section className="stats-section">
        <div className="stats-grid">
          {stats.map((s, i) => (
            <div className="stats-card" key={i}>
              <h3>{s.value}</h3>
              <p>{s.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="cta-section">
        <h2>Ready to Share Your Story?</h2>
        <p>Join thousands of creators monetizing their behind-the-scenes content.</p>

        <div className="cta-buttons">
          <button className="btn-primary" onClick={() => navigate("/dashboard")}>START CREATING</button>
          <button className="btn-secondary" onClick={() => navigate("/marketplace")}>BROWSE MARKETPLACE</button>
        </div>
      </section>
      <Footer />
    </>
  );
};

export default LandingPage;
