import React from "react";
import { Link } from "react-router-dom";

const PLANS = [
  {
    name: "Free",
    price: "$0",
    copy: "Perfect for solo builders who want a clean signature fast.",
    features: ["3 basic templates", "Manual editing", "Copy HTML", "Basic brand color", "Basic logo upload"]
  },
      {
        name: "Pro",
        price: "$12/month",
        copy: "Unlock premium layouts and AI-powered signature copy.",
    features: [
      "Premium templates",
      "AI copy suggestions",
      "Advanced layout controls",
      "Multiple signatures",
      "Remove SignatureForge branding",
      "Enhanced logo and brand blending placeholder"
    ],
    featured: true
  },
  {
    name: "Business",
    price: "$49/month",
    copy: "For teams that need shared styling and company-wide rollout support.",
    features: ["Everything in Pro", "Team/company mode placeholder", "Shared signature standards", "Priority onboarding support"]
  }
];

export default function PricingPage() {
  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Pricing</p>
        <h1>Choose the tier that fits your signature workflow.</h1>
        <p className="hero-subheadline">The free tier is ready to ship signatures today. Pro is designed for brand polish, AI copy support, and premium layouts inside Signature Pilot AI.</p>
      </section>

      <section className="pricing-grid">
        {PLANS.map((plan) => (
          <article key={plan.name} className={`pricing-card ${plan.featured ? "pricing-card-featured" : ""}`}>
            <div>
              <p className="pricing-name">{plan.name}</p>
              <h2>{plan.price}</h2>
              <p>{plan.copy}</p>
            </div>
            <ul className="feature-list">
              {plan.features.map((feature) => (
                <li key={feature}>{feature}</li>
              ))}
            </ul>
            <Link className={`button ${plan.featured ? "button-primary" : "button-secondary"}`} to={plan.name === "Free" ? "/builder" : "/upgrade"}>
              {plan.name === "Free" ? "Start Free" : "Upgrade to Pro"}
            </Link>
          </article>
        ))}
      </section>
    </div>
  );
}
