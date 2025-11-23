import { useState } from "react";
import "./mycontent.css";
import { SquareArrowOutUpRight } from "lucide-react"
import { Play, Edit, Link, Settings, BarChart, Users, Eye } from "lucide-react";


export const DETAIL_TABS = ["Overview", "Analytics", "Purchases", "Reviews", "Settings"];

export const CONTENT_DETAILS_TEXT = `
Join us on an incredible journey to the land of fire and ice. This exclusive 
behind-the-scenes content shows our crew navigating extreme weather conditions, 
creating breathtaking visuals, and capturing transformative footage of Iceland.
`;

export const NETWORK_INFO = {
  status: "Active",
  size: "3.9GB",
};

export const ACCESS_POLICY = {
  policyId: "0x17FDD839FFAA11",
  accessType: "Paid Content",
  duration: "Lifetime",
  transfers: "Non-transferable",
};

export const PERFORMANCE_METRICS = {
  views: 1247,
  earnings: "$6,750",
  salesCompleted: "245 / 500",
  avgWatchTime: "9:45",
  uniqueUsers: 342,
};

export const RECENT_ACTIVITY = [
  "New Review from @Arctic",
  "Sale from user @filmpro",
  "New View from user @warm"
];

// Stats at top
const stats = [
  { label: "Total Videos", value: 24, color: "blue" },
  { label: "Drafts", value: 3, color: "yellow" },
  { label: "Published", value: 21, color: "green" },
];

// Content cards
const contentItems = [
  {
    id: 1,
    title: "Documentary BTS: The Making Of",
    views: "14.5k views",
    sales: "45 sales",
    earned: "$876 earned",
    rating: "4.9★",
    price: "$10 USD",
    progress: 40,
    tag: "Documentary",
    img: "src/assets/pic25.png",
  },
  {
    id: 2,
    title: "Street Photography — Lagos Edition",
    views: "9.2k views",
    sales: "31 sales",
    earned: "$540 earned",
    rating: "4.7★",
    price: "$8 USD",
    progress: 70,
    tag: "Photography",
    img: "src/assets/pic24.png",
  },
  {
    id: 3,
    title: "Behind The Scenes: Fashion Shoot",
    views: "22.1k views",
    sales: "110 sales",
    earned: "$1,220 earned",
    rating: "4.8★",
    price: "$12 USD",
    progress: 90,
    tag: "Fashion",
    img: "src/assets/pic23.png",
  },
  {
    id: 4,
    title: "How to Edit Cinematic Videos",
    views: "6.4k views",
    sales: "18 sales",
    earned: "$220 earned",
    rating: "4.5★",
    price: "$7 USD",
    progress: 55,
    tag: "Tutorial",
    img: "src/assets/pic22.png",
  },
  {
    id: 5,
    title: "Travel Vlog: Exploring Zanzibar",
    views: "18k views",
    sales: "75 sales",
    earned: "$910 earned",
    rating: "4.9★",
    price: "$11 USD",
    progress: 80,
    tag: "Travel",
    img: "src/assets/pic26.jpg",
  },
  {
    id: 6,
    title: "Masterclass: Lighting For Video",
    views: "4.8k views",
    sales: "12 sales",
    earned: "$160 earned",
    rating: "4.4★",
    price: "$6 USD",
    progress: 30,
    tag: "Masterclass",
    img: "src/assets/pic15.png",
  },
  {
    id: 7,
    title: "Music Video Breakdown: Scene by Scene",
    views: "25.4k views",
    sales: "140 sales",
    earned: "$1,520 earned",
    rating: "5.0★",
    price: "$14 USD",
    progress: 95,
    tag: "Music",
    img: "src/assets/pic13.png",
  },
  {
    id: 8,
    title: "Beginner’s Guide: Mobile Filmmaking",
    views: "3.9k views",
    sales: "10 sales",
    earned: "$120 earned",
    rating: "4.3★",
    price: "$5 USD",
    progress: 20,
    tag: "Tutorial",
    img: "src/assets/pic20.png",
  }
];

// ======================= MAIN COMPONENT =======================

export default function MyContent() {
  const [selectedContent, setSelectedContent] = useState<number | null>(null);
  const selectedItem = contentItems.find(item => item.id === selectedContent);

  if (selectedItem) {
    return <MyContentDetails item={selectedItem} onClose={() => setSelectedContent(null)} />;
  }

  return (
    <div className="mycontent-container">
      <div className="mycontent-header">
        <h1>My Content</h1>
        <button className="upload-btn">+ Upload New</button>
      </div>

      <div className="filter-row">
        <p>Filter by:</p>
        <select><option>All Status</option></select>
        <select><option>All Categories</option></select>
        <select><option>All Time</option></select>
        <input type="text" placeholder="Search your content" />
        <select><option>Most Recent</option></select>
      </div>

      <div className="stats-row">
        {stats.map((stat) => (
          <div key={stat.label} className="stat-box">
            <h2>{stat.value}</h2>
            <p>{stat.label}</p>
          </div>
        ))}
      </div>

      <div className="grid-content">
        {contentItems.map((item) => (
          <div
            className="content-card"
            key={item.id}
            onClick={() => setSelectedContent(item.id)}
          >
            <div className="thumbnail">
              <img src={item.img} alt="thumb" />
              <button className="play-btn"><Play size={22} /></button>
            </div>

            <div className="content-info">
              <h3>{item.title}</h3>
              <div className="meta">
                <span>{item.views}</span> · <span>{item.sales}</span> · <span>{item.rating}</span>
              </div>
              <p className="earned">{item.earned}</p>

              <div className="progress-bar">
                <div className="progress-fill" style={{ width: `${item.progress}%` }}></div>
              </div>

              <button className="edit-btn">Edit</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ======================= CIRCLE COMPONENT =======================

function ProgressCircle({ value, max, label }: { value: number; max: number; label: string }) {
  const radius = 42;
  const circumference = 2 * Math.PI * radius;
  const progress = Math.min(value / max, 1);
  const offset = circumference - progress * circumference;

  return (
    <div className="circle-progress-wrapper">
      <svg width="100" height="100">
        <circle
          className="circle-bg"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="7"
          fill="none"
        />
        <circle
          className="circle-fill"
          cx="50"
          cy="50"
          r={radius}
          strokeWidth="7"
          fill="none"
          strokeDasharray={circumference}
          strokeDashoffset={offset}
        />
      </svg>

      <div className="circle-center">
        <strong>{value.toLocaleString()}</strong>
        <p>{label}</p>
      </div>
    </div>
  );
}

interface MyContentDetailsProps {
  item: typeof contentItems[0];
  onClose: () => void;
}

function MyContentDetails({ item, onClose }: MyContentDetailsProps) {
  return (
    <div className="detail-container">
      <button className="close-btn" onClick={onClose}>Back</button>

      <div className="detail-layout">

        {/* LEFT */}
        <div className="left-column">
          <h2 className="video-title">{item.title}</h2>

          <div className="video-banner">
            <img src={item.img} alt="video thumb" />
            <button className="play-overlay"><Play size={32} /></button>
          </div>

          <div className="action-buttons">
            <button><Edit size={16}/> Edit Content</button>
            <button><Settings size={16}/> Change Pricing</button>
            <button><Link size={16}/> Share Link</button>
            <button><BarChart size={16}/> View in Marketplace</button>
          </div>

          {/* Tabs */}
          <div className="tabs">
            {DETAIL_TABS.map((tab, i) => (
              <button key={i} className={i === 0 ? "active" : ""}>{tab}</button>
            ))}
          </div>

          {/* Overview */}
          <div className="panel">
            <h3>Content Details</h3>
            <p className="description">{CONTENT_DETAILS_TEXT}</p>

            <div className="info-grid">
              <div><p>Category <span>{item.tag}</span></p></div>
              <div><p>Duration <span>17:21</span></p></div>
              <div><p>Published <span>3 days ago</span></p></div>
              <div><p>Last Updated <span>3 days ago</span></p></div>
            </div>
          </div>

          <div className="panel">
            <h3>Stored on Walrus Network</h3>
            <div className="network-row">
              <p>Storage Path</p>
              <span className="green">{NETWORK_INFO.status}</span>
            </div>
            <p>Size: {NETWORK_INFO.size}</p>
            <button className="view-btn"><SquareArrowOutUpRight size={23} /> View on Explorer</button>
          </div>

          <div className="panel">
            <h3>SEAL Access Policy</h3>
            <div><label>Policy ID</label><p>{ACCESS_POLICY.policyId}</p></div>
            <div><label>Access Type</label><p>{ACCESS_POLICY.accessType}</p></div>
            <div><label>Duration</label><p>{ACCESS_POLICY.duration}</p></div>
            <div><label>Transfers</label><p>{ACCESS_POLICY.transfers}</p></div>
          </div>
        </div>

        {/* RIGHT */}
        <div className="right-column">

          <div className="panel metric-box">
            <h3>Performance</h3>
            <h1>{PERFORMANCE_METRICS.views}</h1>
            <p>Total Views</p>
          </div>

          <div className="panel metric-box">
            <h3>Earnings from This Content</h3>
            <h1>{PERFORMANCE_METRICS.earnings}</h1>
            <p>Revenue generated</p>
          </div>

          <div className="panel metric-box">
            <h3>Sales Progress</h3>
            <div className="progress-circle">
              <strong>{PERFORMANCE_METRICS.salesCompleted}</strong>
              <p>Sales completed</p>
            </div>
          </div>

          <div className="panel metric-box">
            <h3>Performance</h3>
            <ProgressCircle
              value={PERFORMANCE_METRICS.views}
              max={3000}   
              label="Total Views"
            />
          </div>


          <div className="panel metric-box recent-activity">
            <h3>Recent Activity</h3>
            <ul>
              {RECENT_ACTIVITY.map((act, i) => (
                <li key={i} className="activity-item">
                  <span className="dot"></span>
                  <p>{act}</p>
                  <span className="time">just now</span>
                </li>
              ))}
            </ul>
          </div>

        </div>

      </div>
    </div>
  );
}
