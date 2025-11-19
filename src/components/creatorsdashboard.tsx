import React from "react";
import ConnectWalletButton from "./ConnectButton";
import EarningsIcon from "../assets/earnings.png";
import ViewsIcon from "../assets/views.png";
import UploadBTS from "./uploadbts";
import PassesIcon from "../assets/passes.png";
import SubscribersIcon from "../assets/suscribers.png";
import {
  Activity,
  Video,
  Shield,
  ChartArea,
  UsersRound,
  Settings,
  Wallet,
  CloudUpload,
} from "lucide-react";
import "./creatorsdashboard.css";

interface StatItem {
  label: string;
  value: string;
  change: string;
  color: string;
  icon: string;
}

interface RecentItem {
  title: string;
  time: string;
  badge?: string;
}

export default function CreatorDashboard() {
  const [activeTab, setActiveTab] = React.useState("Dashboard");

  const stats: StatItem[] = [
    { label: "Total Earnings", value: "$12,450", change: "+$2,340 this month", color: "#FFD70026", icon: EarningsIcon },
    { label: "Total Views", value: "156,247", change: "+12.5% this month", color: "#0078FF26", icon: ViewsIcon },
    { label: "Passes Sold", value: "1,240", change: "+2% this week", color: "#0078FF26", icon: PassesIcon },
    { label: "Active Subscribers", value: "342", change: "+3% this week", color: "#0078FF26", icon: SubscribersIcon },
  ];

  const recent: RecentItem[] = [
    { title: "New purchase: 'Documentary BTS' by @Driftwo_02", time: "2 hours ago", badge: "+$50.00" },
    { title: "You earned $10 from ‘VFX Breakdown’", time: "3 hours ago" },
    { title: "New subscriber: @creative_mind", time: "Yesterday" },
    { title: "Your video reached 10K views: 'Director's Cut'", time: "2 days ago", badge: "Milestone" },
  ];

  return (
    <>
    <div className="dashboard-navbar">
      <div className="logo">
        <img src="" alt="logo" />
          <div>
           <p>Backstage</p>
            <span>Creator</span>
          </div>
     </div>
      <nav className="nav-links">
        <a href="">Dashboard</a>
      </nav>
      <div>
        <ConnectWalletButton />
      </div>
    </div>
    <div className="dashboard-container">
      <div className="dashboard-inner">
        <div className="layout">
          {/* Sidebar */}
          <aside className="dashboard-sidebar">
            <nav className="nav-link">
              <a
                className={`nav-item ${activeTab === "Dashboard" ? "active" : ""}`}
                onClick={() => setActiveTab("Dashboard")}
              >
                <Activity size={16} /> Dashboard
              </a>

              <a
                className={`nav-item ${activeTab === "UploadBTS" ? "active" : ""}`}
                onClick={() => setActiveTab("UploadBTS")}
              >
                <CloudUpload size={18} /> Upload BTS Video
              </a>

              <a className="nav-item"><Video size={18} /> My Content</a>
              <a className="nav-item"><Shield size={18} /> Access Policies</a>
              <a className="nav-item"><ChartArea size={18} /> Analytics</a>
              <a className="nav-item"><UsersRound size={18} /> Subscribers</a>
              <a className="nav-item"><Wallet size={18} /> Earnings</a>
              <a className="nav-item"><Settings size={18} /> Settings</a>
            </nav>

            <div className="sidebar-footer">© 2024 Backstage</div>
          </aside>

          {/* Main */}
          <main className="dashboard-main">
            {activeTab === "Dashboard" && (
              <>
              <div className="main-header">
              <div>
                <h1 className="main-title">Welcome back</h1>

                <p className="main-subtitle">
                </p>Here’s what’s happening with your content today
              </div>

              <div className="header-right">
                <button
                  className="upload-btn"
                  onClick={() => setActiveTab("UploadBTS")}
                >
                  + Upload New BTS
                </button>
                <div className="profile-box">Profile</div>
              </div>
            </div>
                <section className="stats-grid">
                  {stats.map((s) => (
                    <div key={s.label} className="stat-card">
                      <div className="stat-content">
                        <div>
                          <div className="stat-label">{s.label}</div>
                          <div className="stat-value">{s.value}</div>
                          <div className="stat-change">{s.change}</div>
                        </div>

                        <div
                          className="stat-icon"
                          style={{ backgroundColor: s.color }}
                        >
                          <img src={s.icon} alt="" />
                        </div>
                      </div>

                      <div className="sparkline">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div
                            key={i}
                            className={`bar bar-h${i}`}
                            style={{ backgroundColor: s.color }}
                          />
                        ))}
                      </div>
                    </div>
                  ))}
                </section>

                {/* Recent activity */}
                <section className="recent-section">
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
              </>
            )}

            {activeTab === "UploadBTS" && <UploadBTS />}
          </main>
        </div>
      </div>
    </div>
    </>
  );
}
