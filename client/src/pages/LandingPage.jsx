import React from "react";
import { Link } from "react-router-dom";

const FEATURES = [
  "AI Signature Builder",
  "Logo + Brand Upload",
  "Gmail / Outlook Ready",
  "Clickable Contact Links",
  "Mobile-Friendly Layouts",
  "Pro Customization"
];

export default function LandingPage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">SignatureForge AI</p>
          <h1>Create a professional email signature in minutes.</h1>
          <p className="hero-subheadline">
            Build a polished, clickable email signature for Gmail, Outlook, Apple Mail, Yahoo, and any HTML email client with live preview, export tools, and AI-guided suggestions.
          </p>
          <div className="hero-actions">
            <Link className="button button-primary" to="/builder">
              Start Free
            </Link>
            <Link className="button button-secondary" to="/upgrade">
              Upgrade to Pro
            </Link>
          </div>
        </div>

        <div className="hero-preview-card">
          <div className="hero-preview-bar" />
          <div className="hero-preview-body">
            <span className="preview-avatar">SF</span>
            <div>
              <strong>Jordan Wells</strong>
              <p>Founder | SignatureForge AI</p>
              <small>Smart signatures. Built in minutes.</small>
            </div>
          </div>
        </div>
      </section>

      <section className="feature-grid">
        {FEATURES.map((feature) => (
          <article key={feature} className="feature-card">
            <p className="feature-icon">{feature.slice(0, 2).toUpperCase()}</p>
            <h2>{feature}</h2>
            <p>Built to keep signatures sharp, clickable, and easy to install across major email clients.</p>
          </article>
        ))}
      </section>

      <section className="pricing-highlight">
        <div>
          <p className="eyebrow">Free vs Pro</p>
          <h2>Start with the essentials. Upgrade when you need more control.</h2>
        </div>
        <div className="pricing-mini-grid">
          <div className="pricing-mini-card">
            <strong>Free</strong>
            <p>3 basic templates, HTML copy, basic brand color, basic logo upload.</p>
          </div>
          <div className="pricing-mini-card pricing-mini-card-accent">
            <strong>Pro</strong>
            <p>Premium templates, AI suggestions, advanced layout controls, branding removal, and team-ready structure.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
