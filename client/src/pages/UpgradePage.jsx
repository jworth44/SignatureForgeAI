import React, { useState } from "react";

const PAID_PLANS = [
  {
    plan: "pro",
    title: "Pro Individual",
    price: "From $9/month",
    copy: "Available now for solo professionals who want unbranded signatures, raw HTML export, premium templates, and stronger compatibility controls.",
    action: "checkout"
  },
  {
    plan: "business",
    title: "Business",
    price: "$49/month base",
    copy: "Reserved for the recurring team plan: centralized brand control, shared templates, employee management, and future workspace sync.",
    action: "interest"
  }
];

export default function UpgradePage() {
  const [status, setStatus] = useState("");
  const [loadingPlan, setLoadingPlan] = useState("");

  async function handleUpgrade(plan) {
    setLoadingPlan(plan);
    setStatus("");
    try {
      const response = await fetch("/api/billing/create-checkout-session", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ plan })
      });
      const payload = await response.json();
      if (payload.url) {
        window.location.assign(payload.url);
        return;
      }
      setStatus(payload.message || "Billing not configured yet. Add Stripe keys to enable upgrades.");
    } catch {
      setStatus("Billing not configured yet. Add Stripe keys to enable upgrades.");
    } finally {
      setLoadingPlan("");
    }
  }

  function handleBusinessInterest() {
    setStatus("Business rollout is being staged next. Use Pro today, and reach out when you want centralized team management planning.");
  }

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Upgrade</p>
        <h1>Upgrade when you need cleaner exports, stronger control, or team rollout support.</h1>
        <p className="hero-subheadline">No commitment. Cancel anytime. Signatures stay yours.</p>
      </section>

      <section className="pricing-grid">
        {PAID_PLANS.map((plan) => (
          <article key={plan.plan} className={`pricing-card ${plan.plan === "pro" ? "pricing-card-featured" : ""}`}>
            <div>
              <p className="pricing-name">{plan.title}</p>
              <h2>{plan.price}</h2>
              <p>{plan.copy}</p>
            </div>
            <button
              className={`button ${plan.plan === "pro" ? "button-primary" : "button-secondary"}`}
              disabled={loadingPlan === plan.plan}
              type="button"
              onClick={() => (plan.action === "checkout" ? handleUpgrade(plan.plan) : handleBusinessInterest())}
            >
              {loadingPlan === plan.plan ? "Opening..." : plan.action === "checkout" ? "Upgrade to Pro" : "Business waitlist"}
            </button>
          </article>
        ))}
      </section>

      <section className="panel">
        <div className="section-intro">
          <p className="eyebrow">What upgrades now</p>
          <h2>Keep the core builder free. Pay for cleaner control and recurring team value.</h2>
        </div>
        <div className="comparison-grid">
          <div className="comparison-card">
            <strong>Free users keep</strong>
            <ul className="feature-list">
              <li>Logo upload</li>
              <li>Core templates</li>
              <li>Copy Signature export</li>
              <li>Universal compatibility-safe workflow</li>
            </ul>
          </div>
          <div className="comparison-card comparison-card-accent">
            <strong>Paid plans unlock</strong>
            <ul className="feature-list">
              <li>Branding removal</li>
              <li>Premium families and variants</li>
              <li>Raw HTML and file export</li>
              <li>Advanced styling and team rollout support</li>
            </ul>
          </div>
        </div>
      </section>

      {status ? <section className="panel inline-banner">{status}</section> : null}
    </div>
  );
}
