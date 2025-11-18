import React from "react";
import "./creatorDashboard.css";

interface StatItem {
  label: string;
  value: string;
  change: string;
  color: "yellow" | "sky" | "indigo" | "emerald";
}

interface RecentItem {
  title: string;
  time: string;
  badge?: string;
}

export default function CreatorDashboard(): JSX.Element {
  const stats: StatItem[] = [
    { label: "Total Earnings", value: "$12,450", change: "+$2,340 this month", color: "yellow" },
    { label: "Total Views", value: "156,247", change: "+12.5% this month", color: "sky" },
    { label: "Passes Sold", value: "1,240", change: "+2% this week", color: "indigo" },
    { label: "Active Subscribers", value: "342", change: "+3% this week", color: "emerald" },
  ];

  const recent: RecentItem[] = [
    { title: "New purchase: 'Documentary BTS' by @Driftwo_02", time: "2 hours ago", badge: "+$50.00" },
    { title: "You earned $10 from ‘VFX Breakdown’", time: "3 hours ago" },
    { title: "New subscriber: @creative_mind", time: "Yesterday" },
    { title: "Your video reached 10K views: 'Director's Cut'", time: "2 days ago", badge: "Milestone" },
  ];

  return (
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <div className="layout">
          {/* Sidebar */}
          <aside className="sidebar">
            <div className="sidebar-header">
              <div className="sidebar-logo">B</div>
              <div>
                <h3 className="sidebar-title">Backstage</h3>
                <p className="sidebar-subtitle">Creator</p>
              </div>
            </div>

            <nav className="nav-links">
              <a className="nav-item active">Dashboard</a>
              <a className="nav-item">Upload BTS Video</a>
              <a className="nav-item">My Content</a>
              <a className="nav-item">Access Policies</a>
              <a className="nav-item">Analytics</a>
              <a className="nav-item">Subscribers</a>
              <a className="nav-item">Earnings</a>
              <a className="nav-item">Settings</a>
            </nav>

            <div className="sidebar-footer">© 2024 Backstage</div>
          </aside>

          {/* Main */}
          <main className="main">
            {/* Header */}
            <header className="main-header">
              <div>
                <h1 className="main-title">Welcome back</h1>
                <p className="main-subtitle">Here’s what’s happening with your content today</p>
              </div>

              <div className="header-right">
                <button className="upload-btn">+ Upload New BTS</button>
                <div className="profile-box">Profile</div>
              </div>
            </header>

            {/* Stats */}
            <section className="stats-grid">
              {stats.map((s) => (
                <div key={s.label} className="stat-card">
                  <div className="stat-content">
                    <div>
                      <div className="stat-label">{s.label}</div>
                      <div className="stat-value">{s.value}</div>
                      <div className="stat-change">{s.change}</div>
                    </div>

                    <div className={`stat-icon ${s.color}`}>
                      <svg width="18" height="18" viewBox="0 0 24 24">
                        <path d="M12 2v20" stroke="currentColor" strokeWidth="1.5" />
                        <path d="M5 12h14" stroke="currentColor" strokeWidth="1.5" />
                      </svg>
                    </div>
                  </div>

                  <div className="sparkline">
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className={`bar bar-${s.color} bar-h${i}`} />
                    ))}
                  </div>
                </div>
              ))}
            </section>

            {/* Recent activity */}
            <section className="recent-section">
              <div className="recent-header">
                <h2 className="recent-title">Recent Activity</h2>
                <a className="view-all">View All</a>
              </div>

              <div className="recent-list">
                {recent.map((r, idx) => (
                  <div key={idx} className="recent-item">
                    <div className="recent-left">
                      <div className="recent-icon">📦</div>
                      <div>
                        <div className="recent-text">{r.title}</div>
                        <div className="recent-time">{r.time}</div>
                      </div>
                    </div>

                    {r.badge && <div className="recent-badge">{r.badge}</div>}
                  </div>
                ))}
              </div>
            </section>

            {/* Footer */}
            <footer className="footer">
              © 2024 Backstage. All rights reserved. • Terms of Service • Privacy Policy • Support
            </footer>
          </main>
        </div>
      </div>
    </div>
  );
}
