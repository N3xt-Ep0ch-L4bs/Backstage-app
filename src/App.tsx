import React from "react";
import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import LandingPage from "./pages/landingpage";
import Marketplace from "./pages/marketplace";
import ContentDetails from "./components/contentdetails";

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/marketplace" element={<Marketplace />} />
        <Route path="/content/:id" element={<ContentDetails />} />
      </Routes>
    </Router>
  );
};

export default App;
