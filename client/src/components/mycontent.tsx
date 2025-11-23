import { useState } from "react";
import "./mycontent.css";
import { Play, Edit, Link, Settings, BarChart, Users, Eye } from "lucide-react";


const stats = [
  { label: "Total Videos", value: 24, color: "blue" },
  { label: "Drafts", value: 3, color: "yellow" },
  { label: "Published", value: 21, color: "green" },
];

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
      {selectedItem && <MyContentDetails item={selectedItem} onClose={() => setSelectedContent(null)} />}
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
            <button className="active">Overview</button>
            <button>Analytics</button>
            <button>Purchases</button>
            <button>Reviews</button>
            <button>Settings</button>
          </div>

          {/* Overview Panels */}
          <div className="panel">
            <h3>Content Details</h3>
            <p className="description">
              Join us on an incredible journey to the land of fire and ice. This exclusive behind-the-scenes content shows our crew navigating extreme weather conditions, creating breathtaking visuals, and capturing transformative footage of Iceland.
            </p>
            <div className="info-grid">
              <div>
                <p>Category <span>{item.tag}</span></p>
              </div>
              <div>
                <p>Duration <span>17:21</span></p>
              </div>
              <div>
                <p>Published <span>3 days ago</span></p>
              </div>
              <div>
                <p>Last Updated <span>3 days ago</span></p>
              </div>
            </div>
          </div>

          <div className="panel">
            <h3>Stored on Walrus Network</h3>
            <div className="network-row">
              <p>Storage Path</p>
              <span className="green">Active</span>
            </div>
            <p>Size: 3.9GB</p>
            <button className="view-btn">View on Explorer</button>
          </div>

          <div className="panel">
            <h3>SEAL Access Policy</h3>
            <div>
              <label>Policy ID</label>
              <p>0x17FDD839FFAA11</p>
            </div>
            <div>
              <label>Access Type</label>
              <p>Paid Content</p>
            </div>
            <div>
              <label>Duration</label>
              <p>Lifetime</p>
            </div>
            <div>
              <label>Transfers</label>
              <p>Non-transferable</p>
            </div>
          </div>
        </div>

        {/* Right side */}
        <div className="right-column">
          <div className="panel metric-box">
            <h3>Performance</h3>
            <h1>1,247</h1>
            <p>Total Views</p>
          </div>

          <div className="panel metric-box">
            <h3>Earnings from This Content</h3>
            <h1>$6,750</h1>
            <p>Revenue generated</p>
          </div>

          <div className="panel metric-box">
            <h3>Sales Progress</h3>
            <div className="progress-circle">
              <strong>245 / 500</strong>
              <p>Sales completed</p>
            </div>
          </div>

          <div className="panel metric-box">
            <h3>Engagement</h3>
            <h4><Eye size={14}/> Avg Watch Time: 9:45</h4>
            <p><Users size={14}/> Unique Users: 342</p>
          </div>

          <div className="panel metric-box">
            <h3>Recent Activity</h3>
            <ul>
              <li>New Review from @Arctic</li>
              <li>Sale from user @filmpro</li>
              <li>New View from user @warm</li>
            </ul>
          </div>
        </div>
      </div>
    </div> 
  );
}