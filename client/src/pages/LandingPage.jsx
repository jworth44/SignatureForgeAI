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

const TEMPLATE_SHOWCASE = [
  { name: "Executive", copy: "Leadership-ready with premium spacing", tone: "template-thumb-executive" },
  { name: "Contractor", copy: "Service CTA and field-ready contact flow", tone: "template-thumb-contractor" },
  { name: "Minimal", copy: "Clean founder-friendly signature design", tone: "template-thumb-minimal" },
  { name: "Corporate", copy: "Structured, polished, and brand-led", tone: "template-thumb-corporate" },
  { name: "Mobile Compact", copy: "Built for narrow email clients", tone: "template-thumb-mobile-compact" }
];

export default function LandingPage() {
  return (
    <div className="page-stack">
      <section className="hero-card">
        <div className="hero-copy">
          <p className="eyebrow">Signature Pilot AI</p>
          <h1>Professional email signatures in minutes.</h1>
          <p className="hero-subheadline">
            Signature Pilot AI is an AI-powered email signature builder for Gmail, Outlook, Apple Mail, Yahoo, and any HTML email client, with live preview, export tools, and AI-guided suggestions.
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
              <p>Founder | Signature Pilot AI</p>
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

      <section className="panel">
        <div className="section-intro">
          <p className="eyebrow">Templates</p>
          <h2>Five polished starting points for different kinds of work.</h2>
          <p className="hero-subheadline">Start with a sharper base instead of editing from a blank email signature every time.</p>
        </div>
        <div className="template-grid">
          {TEMPLATE_SHOWCASE.map((template) => (
            <article key={template.name} className="template-card template-card-static">
              <div className={`template-thumb ${template.tone}`}>
                <span className="template-thumb-bar" />
                <span className="template-thumb-line template-thumb-line-strong" />
                <span className="template-thumb-line" />
                <span className="template-thumb-line template-thumb-line-short" />
              </div>
              <strong>{template.name}</strong>
              <span>{template.copy}</span>
            </article>
          ))}
        </div>
      </section>

      <section className="before-after-panel">
        <div className="section-intro">
          <p className="eyebrow">Before vs After</p>
          <h2>Turn a plain sign-off into a signature people trust.</h2>
        </div>
        <div className="before-after-grid">
          <article className="before-card">
            <small>Before</small>
            <p>Jordan Wells</p>
            <p>Founder</p>
            <p>555-123-4567</p>
            <p>hello@company.com</p>
          </article>
          <article className="after-card">
            <small>After</small>
            <div className="after-card-row">
              <span className="preview-avatar">SP</span>
              <div>
                <strong>Jordan Wells</strong>
                <p>Founder | Northlight Studio</p>
                <small>Book a quick call</small>
              </div>
            </div>
            <div className="after-card-meta">
              <span>Clickable links</span>
              <span>Brand color</span>
              <span>Mobile-safe layout</span>
            </div>
          </article>
        </div>
      </section>

      <section className="pricing-highlight">
        <div>
          <p className="eyebrow">Free vs Pro</p>
          <h2>Start with the essentials. Upgrade when you need more control.</h2>
        </div>
        <div className="pricing-mini-grid">
          <div className="pricing-mini-card">
            <strong>Free</strong>
            <p>Executive, Minimal, and Mobile Compact templates with branded copy-ready signatures.</p>
          </div>
          <div className="pricing-mini-card pricing-mini-card-accent">
            <strong>Pro</strong>
            <p>Contractor and Corporate templates, unbranded HTML export, advanced controls, and AI-powered polish.</p>
          </div>
        </div>
      </section>
    </div>
  );
}
