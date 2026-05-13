import React from "react";
import { NavLink } from "react-router-dom";
import brandLogo from "../assets/signature-pilot-ai-logo.png";

const NAV_ITEMS = [
  { to: "/", label: "Home", end: true },
  { to: "/builder", label: "Builder" },
  { to: "/pricing", label: "Pricing" },
  { to: "/install", label: "Install Guide" },
  { to: "/upgrade", label: "Upgrade" }
];

export default function AppShell({ children }) {
  return (
    <div className="site-shell">
      <header className="topbar">
        <NavLink className="brand-lockup" to="/">
          <img className="brand-logo-image" src={brandLogo} alt="Signature Pilot AI" />
        </NavLink>

        <nav className="topbar-nav" aria-label="Primary">
          {NAV_ITEMS.map((item) => (
            <NavLink key={item.to} className="topbar-link" end={item.end} to={item.to}>
              {item.label}
            </NavLink>
          ))}
        </nav>

        <div className="topbar-actions">
          <NavLink className="button button-secondary" to="/upgrade">
            Upgrade to Pro
          </NavLink>
          <NavLink className="button button-primary" to="/builder">
            Start Free
          </NavLink>
        </div>
      </header>

      <main className="site-main">{children}</main>
    </div>
  );
}
