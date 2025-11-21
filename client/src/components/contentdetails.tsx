import React from "react";
import { useParams } from "react-router-dom";
import Preview from "../assets/preview.png";
import PurchasePopup from "./purchasepopup";
import "./contentdetails.css";
import Secure from "../assets/secure.png";
import Fast from "../assets/fast.png";
import Safe from "../assets/safe.png";
import { Play, Check, Download, Lock, Star, Clock, Bell } from "lucide-react";

// ======================
// Type Definitions
// ======================

interface Creator {
  name: string;
  subscribers?: string;
  avatar?: string;
}

interface Price {
  sui: number;
  usd: number;
  paymenttype?: string;
}

interface ContentItem {
  id: number;
  title: string;
  creator: Creator;
  price: Price;
  description: string;
  includes: string[];
  activity: string[];
}

interface CarouselItem {
  id: number;
  title: string;
  creator: { name: string };
  price: { sui: number; usd: number };
  thumbnail: string;
}

interface PurchasePopupProps {
  content: ContentItem;
  onClose: () => void;
}

// Tell TS what the popup expects (in case purchasepopup.tsx is JS)
declare module "./purchasepopup" {
  const PurchasePopup: React.FC<PurchasePopupProps>;
  export default PurchasePopup;
}

// ======================
// Dummy Data (Typed)
// ======================

const dummyData: ContentItem[] = [
  {
    id: 1,
    title: "VFX Masterclass: Epic Battle Breakdown",
    creator: {
      name: "Luna Films",
      subscribers: "24k subscribers",
      avatar:
        "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?auto=format&fit=crop&w=150&q=80",
    },
    price: {
      sui: 150,
      usd: 225,
      paymenttype: "One-time payment",
    },
    description:
      "Dive deep into the making of “Echoes of Tomorrow”. Jane Doe’s latest sci-fi masterpiece...",
    includes: [
      "Full BTS Documentary (4K)",
      "Director’s Exclusive Commentary",
      "Downloadable Concept Art",
      "Early Access to Next Project",
      "Cast & Crew Interviews",
    ],
    activity: [
      "User347 purchased access",
      "User129 watched 45 minutes",
      "User002 completed course",
      "User984 downloaded package",
    ],
  },
  {
    id: 2,
    title: "Cosmic Dawn: VFX Breakdown",
    creator: {
      name: "Nova Studios",
      subscribers: "18k subscribers",
      avatar:
        "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=150&q=80",
    },
    price: {
      sui: 120,
      usd: 180,
      paymenttype: "One-time payment",
    },
    description: "A behind-the-scenes look at Cosmic Dawn VFX process...",
    includes: ["Full VFX Breakdown", "Project Files", "Early Access"],
    activity: ["User002 watched 30 minutes", "User384 purchased access"],
  },
];

const dumyData: CarouselItem[] = [
  {
    id: 1,
    title: "VFX Masterclass: Epic Battle Breakdown",
    creator: { name: "Luna Films" },
    price: { sui: 150, usd: 225 },
    thumbnail:
      "https://images.unsplash.com/photo-1581091215367-59ab6b365952?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 2,
    title: "Cosmic Dawn: VFX Breakdown",
    creator: { name: "Nova Studios" },
    price: { sui: 120, usd: 180 },
    thumbnail:
      "https://images.unsplash.com/photo-1517511620798-cec17d428bc0?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 3,
    title: "Wilderness Whisperer: Director's Cut",
    creator: { name: "Echo Films" },
    price: { sui: 100, usd: 150 },
    thumbnail:
      "https://images.unsplash.com/photo-1596495577886-d920f1b1042e?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 4,
    title: "Behind the Scenes: Galaxy Quest",
    creator: { name: "Luna Films" },
    price: { sui: 130, usd: 195 },
    thumbnail:
      "https://images.unsplash.com/photo-1581092588406-df9f9c7d85c2?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 5,
    title: "Animation Secrets: Dragon Flight",
    creator: { name: "Luna Films" },
    price: { sui: 160, usd: 240 },
    thumbnail:
      "https://images.unsplash.com/photo-1593642634367-d91a135587b5?auto=format&fit=crop&w=400&q=80",
  },
  {
    id: 6,
    title: "Nova Studios: Alien Worlds VFX",
    creator: { name: "Nova Studios" },
    price: { sui: 140, usd: 210 },
    thumbnail:
      "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=400&q=80",
  },
];

// ======================
// Main Component
// ======================

const ContentDetails: React.FC = () => {
  const { id } = useParams<{ id: string }>();

  const content = dummyData.find((item) => item.id === Number(id));

  const [showPopup, setShowPopup] = React.useState<boolean>(false);

  if (!content) return <p>Content not found!</p>;

  return (
    <>
      <div className="details-page">
        {/* LEFT SIDE */}
        <div className="details-left">
          <div className="video-container">
            <img src={Preview} alt="Preview" />
            <button className="play-btn">
              <Play size={40} />
            </button>
          </div>

          <h2 className="details-title">{content.title}</h2>

          <div className="creator-row">
            <img src={content.creator.avatar} className="creator-avatar" />
            <div>
              <h4>{content.creator.name}</h4>
              <p>{content.creator.subscribers}</p>
            </div>
            <button className="follow-btn">+ Follow</button>
            <p>
              <Bell />
            </p>
          </div>

          <div className="section">
            <h3>Description</h3>
            <p>{content.description}</p>
          </div>

          <div className="section">
            <h3>What You Get</h3>
            <ul className="what-you-get">
              {content.includes.map((item, index) => (
                <li key={index}>
                  <Check size={18} /> {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="section">
            <h3>Activity Log</h3>
            <ul className="activity-log">
              {content.activity.map((item, i) => (
                <li key={i}>
                  <Clock size={16} /> {item}
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* RIGHT SIDE */}
        <div className="details-right">
          <div className="price-card">
            <h1>{content.price.sui} Sui</h1>
            <p className="usd">{content.price.usd} USD</p>
            <button className="payment-type">
              {content.price.paymenttype}
            </button>

            <div className="features">
              <p>
                <Check size={16} /> Stream in Full HD anytime
              </p>
              <p>
                <Download size={16} /> Download project files (2.4 GB)
              </p>
              <p>
                <Check size={16} /> Lifetime access – never expires
              </p>
              <p>
                <Check size={16} /> 30-day satisfaction guarantee
              </p>
            </div>

            <button className="buy-btn" onClick={() => setShowPopup(true)}>
              Buy Access for {content.price.sui} Sui
            </button>

            <div className="secured">
              <img src={Secure} />
              <img src={Fast} />
              <img src={Safe} />
            </div>
          </div>

          <div className="creator-box">
            <img src={content.creator.avatar} className="creator-profile" />
            <h3>{content.creator.name}</h3>
            <p>
              LX Film Educator · 110+ VFX deep-dive videos · 1.8M+ utility
              downloads worldwide
            </p>
            <button className="view-profile-btn">View Full Profile</button>
          </div>

          <div className="stats-box">
            <h4>Content Stats</h4>
            <p>
              <Star size={16} /> 4.8 / 5 rating
            </p>
            <p>
              <Download size={16} /> 12K Downloads
            </p>
            <p>
              <Clock size={16} /> Last Updated: Jan 5, 2025
            </p>
          </div>

          <div className="technical-box">
            <h4>Technical Details</h4>
            <p>Video: 4K HDR</p>
            <p>Files: ZIP bundle (2.4 GB)</p>
            <p>Creator: {content.creator.name}</p>
          </div>
        </div>
      </div>

      {/* MORE FROM CREATOR */}
      <div className="more-from-creator">
        <h3>More from {content.creator.name}</h3>
        <div className="carousel">
          {dumyData
            .filter(
              (item) =>
                item.creator.name === content.creator.name &&
                item.id !== content.id
            )
            .map((item) => (
              <div key={item.id} className="carousel-card">
                <img src={item.thumbnail} alt={item.title} />
                <h4>{item.title}</h4>
                <p className="price">
                  {item.price.sui} Sui / {item.price.usd} USD
                </p>
              </div>
            ))}
        </div>
      </div>

      {/* POPUP */}
      {showPopup && (
        <PurchasePopup
          content={content}
          onClose={() => setShowPopup(false)}
        />
      )}
    </>
  );
};

export default ContentDetails;
