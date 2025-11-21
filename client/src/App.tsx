import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingpage";
import Marketplace from "./pages/marketplace";
import MyContent from "./components/mycontent";
import PurchasePopup from "./components/purchasepopup";
import MyLibrary from "./components/mylibrary";
import CreatorDashboard from "./components/creatorsdashboard";
import ContentDetails from "./components/contentdetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/content/:id" element={<ContentDetails />} />
        <Route path="/dashboard" element={<CreatorDashboard />} />
        <Route path="/mycontent" element={<MyContent />} />
        <Route path="/purchasepopup" element={<PurchasePopup />} />
        <Route path="/mylibrary" element={<MyLibrary />} />
      </Routes>
    </Router>
  );
};

export default App;
