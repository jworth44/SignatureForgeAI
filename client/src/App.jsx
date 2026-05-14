import React from "react";
import { Navigate, Route, Routes } from "react-router-dom";
import AppShell from "./components/AppShell";
import LandingPage from "./pages/LandingPage";
import BuilderPage from "./pages/BuilderPage";
import PricingPage from "./pages/PricingPage";
import InstallGuidePage from "./pages/InstallGuidePage";
import UpgradePage from "./pages/UpgradePage";

export default function App() {
  return (
    <AppShell>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/builder" element={<BuilderPage />} />
        <Route path="/pricing" element={<PricingPage />} />
        <Route path="/install-guide" element={<InstallGuidePage />} />
        <Route path="/install" element={<InstallGuidePage />} />
        <Route path="/upgrade" element={<UpgradePage />} />
        <Route path="*" element={<Navigate replace to="/" />} />
      </Routes>
    </AppShell>
  );
}
