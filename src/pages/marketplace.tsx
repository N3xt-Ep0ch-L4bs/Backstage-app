import { useState } from "react";
import React from "react";
import { useNavigate } from "react-router-dom";
import { Search } from "lucide-react";
import ConnectWalletButton from "../components/ConnectButton";
import "./marketplace.css";
import pic1 from "../assets/pic1.png";
import pic2 from "../assets/pic2.png";
import pic3 from "../assets/pic3.png";
import pic4 from "../assets/pic4.png";
import pic5 from "../assets/pic5.png";
import pic6 from "../assets/pic6.png";

interface MediaItem {
  id: number;
  title: string;
  creator: string;
  type: string;
  thumbnail: string;
  access: string;
}

interface OpenState {
  category: boolean;
  price: boolean;
  creator: boolean;
  popularity: boolean;
}

const dummyData: MediaItem[] = [
  { id: 1, title: "The Symphony of Light: Making Of", creator: "by Lens Forge", type: "Pay-per-view", thumbnail: pic1, access: "Limited 50 passes left" },
  { id: 2, title: "Cosmic Dawn: VFX Breakdown", creator: "by Nova Studios", type: "Subscription", thumbnail: pic2, access: "Unlimited" },
  { id: 3, title: "Wilderness Whisperer: Director's Cut", creator: "by Echo Films", type: "Pay-per-view", thumbnail: pic3, access: "Limited 120 passes left" },
  { id: 4, title: "The Symphony of Light: Making Of", creator: "by Lens Forge", type: "Pay-per-view", thumbnail: pic4, access: "Limited 50 passes left" },
  { id: 5, title: "Cosmic Dawn: VFX Breakdown", creator: "by Nova Studios", type: "Subscription", thumbnail: pic5, access: "Unlimited" },
  { id: 6, title: "Wilderness Whisperer: Director's Cut", creator: "by Echo Films", type: "Pay-per-view", thumbnail: pic6, access: "Limited 120 passes left" },
];

const Marketplace: React.FC = () => {
  const [open, setOpen] = useState<OpenState>({
    category: true,
    price: false,
    creator: false,
    popularity: false,
  });

  const navigate = useNavigate();

  const toggle = (key: keyof OpenState) => setOpen((s) => ({ ...s, [key]: !s[key] }));

  const handleCardClick = (id: number) => navigate(`/content/${id}`);

  return (
    <>
      <div className="market-navbar">
        <div className="logo" onClick={() => navigate("/")}>
          <img src="" alt="logo" />
            <p>Backstage</p>
        </div>
        <nav className="nav-links">
          <a href="/marketplace">Marketplace</a>
          <a href="/dashboard">Dashboard</a>
          <a href="">My Content</a>
        </nav>
        <div>
          <ConnectWalletButton />
        </div>
      </div>

      <div className="marketplace-container">
        <aside className="sidebar">
          <div className="filter-section">
            <div className="dropdown">
              <button className="dropdown-header" onClick={() => toggle("category")} aria-expanded={open.category}>
                Category
              </button>
              {open.category && (
                <div className="dropdown-body">
                  <label><input type="checkbox" /> Music Videos</label>
                  <label><input type="checkbox" /> Documentary</label>
                  <label><input type="checkbox" /> Film Making</label>
                  <label><input type="checkbox" /> Gaming</label>
                  <label><input type="checkbox" /> VFX & Animation</label>
                </div>
              )}
            </div>

            {/* Price Dropdown */}
            <div className="dropdown">
              <button className="dropdown-header" onClick={() => toggle("price")} aria-expanded={open.price}>
                Price Range
              </button>
              {open.price && (
                <div className="dropdown-body">
                  <div className="price-range">
                    <input type="number" placeholder="0" />
                    <input type="number" placeholder="500" />
                  </div>
                </div>
              )}
            </div>

            {/* Creator Dropdown */}
            <div className="dropdown">
              <button className="dropdown-header" onClick={() => toggle("creator")} aria-expanded={open.creator}>
                Creator
              </button>
              {open.creator && (
                <div className="dropdown-body">
                  <input type="text" placeholder="Search creator" />
                </div>
              )}
            </div>

            {/* Popularity Dropdown */}
            <div className="dropdown">
              <button className="dropdown-header" onClick={() => toggle("popularity")} aria-expanded={open.popularity}>
                Popularity
              </button>
              {open.popularity && (
                <div className="dropdown-body">
                  <label><input type="checkbox" /> Most Viewed</label>
                  <label><input type="checkbox" /> Newest</label>
                  <label><input type="checkbox" /> Trending</label>
                </div>
              )}
            </div>

            <button className="apply-btn">APPLY FILTERS</button>
          </div>
        </aside>

        <main className="marketplace-main">
          <div className="top-bar">
            <h1>Marketplace</h1>
            <div className="search-box">
              <Search size={18} />
              <input type="text" placeholder="Search..." />
            </div>
          </div>

          <div className="grid-list">
            {dummyData.map((item) => (
              <div key={item.id} className="media-card" onClick={() => handleCardClick(item.id)}>
                <img src={item.thumbnail} alt={item.title} />
                <div className="card-info">
                  <h4>{item.title}</h4>
                  <p>{item.creator}</p>
                  <div className="card-type">{item.type}</div>
                  <div className="card-access">{item.access}</div>
                </div>
              </div>
            ))}
          </div>

          <div className="pagination">
            <button>{"<"}</button>
            <button className="active">1</button>
            <button>2</button>
            <button>3</button>
            <button>{">"}</button>
          </div>
        </main>
      </div>
    </>
  );
};

export default Marketplace;
