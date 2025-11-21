import React, { useRef } from "react";
import ConnectWalletButton from "./ConnectButton";
import "./mylibrary.css";

const HERO_IMAGE = "/mnt/data/6a48356c-0a66-4145-ba80-0b3fc2337ce1.png";

type VideoItem = {
  id: number;
  title: string;
  creator: string;
  duration: string;
  thumbnail: string;
  badge?: string;
  price?: string;
};

const continueWatching: VideoItem[] = [
  {
    id: 1,
    title: "VFX Masterclass: Epic Battle Breakdown",
    creator: "Luna Films",
    duration: "46:22",
    thumbnail: HERO_IMAGE,
  },
  {
    id: 2,
    title: "Documentary BTS: Iceland Journey",
    creator: "Alec Rivers",
    duration: "28:15",
    thumbnail: HERO_IMAGE,
  },
  {
    id: 3,
    title: "Music Video Breakdown: Summer Hit",
    creator: "Echo Studios",
    duration: "35:12",
    thumbnail: HERO_IMAGE,
  },
  {
    id: 4,
    title: "Director's Commentary: Award Winner",
    creator: "Pheonix Productions",
    duration: "32:30",
    thumbnail: HERO_IMAGE,
  },
  {
    id: 5,
    title: "Cinematography Tips",
    creator: "Visual Masters",
    duration: "13:08",
    thumbnail: HERO_IMAGE,
  },
];

const newAdditions: VideoItem[] = [
  {
    id: 11,
    title: "Fashion Photoshoot: High Fashion BTS",
    creator: "Style Studio",
    duration: "08:22",
    thumbnail: HERO_IMAGE,
    badge: "NEW",
  },
  {
    id: 12,
    title: "Animation Process: Character Design",
    creator: "Pixel Masters",
    duration: "11:04",
    thumbnail: HERO_IMAGE,
    badge: "NEW",
  },
  {
    id: 13,
    title: "Live Concert Recording: Stadium Tour",
    creator: "Sound Wave Media",
    duration: "22:10",
    thumbnail: HERO_IMAGE,
    badge: "NEW",
  },
  {
    id: 14,
    title: "Commercial Production: Product Launch",
    creator: "Brand Vision",
    duration: "09:40",
    thumbnail: HERO_IMAGE,
    badge: "NEW",
  },
];

export default function MyLibrary() {
  const continueRef = useRef<HTMLDivElement | null>(null);
  const newRef = useRef<HTMLDivElement | null>(null);

  const scroll = (ref: React.RefObject<HTMLDivElement>, dir: number) => {
    if (!ref.current) return;
    ref.current.scrollBy({ left: dir * 420, behavior: "smooth" });
  };

  return (
    <div className="mylib-root">
      <div className="dashboard-navbar">
            <div className="logo">
              <img src="" alt="logo" />
                <div>
                 <p>Backstage</p>
                  <span>Creator</span>
                </div>
           </div>
            <nav className="nav-links">
              <a href="/marketplace">Marketplace</a>
              <a href="/dashboard">Dashboard</a>
              <a href="/mylibrary">My Library</a>
            </nav>
            <div>
              <ConnectWalletButton />
            </div>
          </div>
      <main className="mylib-container">
        <h1 className="page-title">My Library</h1>

        <div className="filters">
          {["All", "Unwatched", "In Progress", "Completed", "Subscriptions"].map(
            (f) => (
              <button key={f} className={`filter-btn ${f === "All" ? "active" : ""}`}>
                {f}
              </button>
            )
          )}
        </div>

        <section className="stat-row">
          <article className="stat-card">
            <div className="small-label">Watch Time</div>
            <div className="stat-large">87 Hours</div>
            <div className="stat-sub">+12% this month</div>
          </article>

          <article className="stat-card">
            <div className="small-label">Completion Rate</div>
            <div className="stat-large">78%</div>
          </article>

          <article className="stat-card">
            <div className="small-label">Your Library</div>
            <div className="stat-large">24 Videos</div>
          </article>

          <article className="stat-card highlight">
            <div className="small-label">Total Invested</div>
            <div className="stat-large">$680</div>
          </article>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>Continue Watching</h2>
            <a className="view-all">View All</a>
          </div>

          <div className="carousel-wrap">
            <button className="scroll-btn left" onClick={() => scroll(continueRef, -1)}>
              ‹
            </button>

            <div className="carousel" ref={continueRef}>
              {continueWatching.map((v) => (
                <div key={v.id} className="card video-card">
                  <div className="thumb">
                    <img src={v.thumbnail} alt={v.title} />
                    <span className="duration">{v.duration}</span>
                  </div>
                  <div className="card-body">
                    <h4 className="video-title">{v.title}</h4>
                    <p className="meta">{v.creator}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="scroll-btn right" onClick={() => scroll(continueRef, 1)}>
              ›
            </button>
          </div>
        </section>

        <section className="section">
          <div className="section-header">
            <h2>New Additions</h2>
            <a className="view-all">View All</a>
          </div>

          <div className="carousel-wrap">
            <button className="scroll-btn left" onClick={() => scroll(newRef, -1)}>
              ‹
            </button>

            <div className="carousel" ref={newRef}>
              {newAdditions.map((v) => (
                <div key={v.id} className="card video-card">
                  <div className="thumb">
                    <img src={v.thumbnail} alt={v.title} />
                    {v.badge && <span className="badge">{v.badge}</span>}
                    <span className="duration">{v.duration}</span>
                  </div>
                  <div className="card-body">
                    <h4 className="video-title">{v.title}</h4>
                    <p className="meta">{v.creator}</p>
                  </div>
                </div>
              ))}
            </div>

            <button className="scroll-btn right" onClick={() => scroll(newRef, 1)}>
              ›
            </button>
          </div>
        </section>

        <footer className="mylib-footer">© 2025 Backstage • Terms • Privacy • Support</footer>
      </main>
    </div>
  );
}