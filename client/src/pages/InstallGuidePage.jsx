import React, { useState } from "react";

const GUIDES = {
  Gmail: [
    "Open Gmail and click Settings.",
    "Choose See all settings.",
    "Scroll to Signature and click Create new.",
    "Paste your copied signature HTML into the editor.",
    "Assign it to new emails and replies if needed.",
    "Scroll down and click Save changes."
  ],
  "Outlook / Hotmail": [
    "Open Outlook and click Settings.",
    "Choose Mail, then Compose and reply.",
    "Find Email signature.",
    "Paste your copied signature into the signature box.",
    "Set your default signature preferences.",
    "Click Save."
  ],
  "Apple Mail": [
    "Open Mail and go to Mail, then Settings.",
    "Open the Signatures tab.",
    "Select the email account you want to edit.",
    "Click the plus button to add a signature.",
    "Paste the copied signature into the signature area.",
    "Close Settings to save."
  ],
  Yahoo: [
    "Open Yahoo Mail and click Settings.",
    "Choose More Settings.",
    "Open Writing email.",
    "Turn Signature on for the target account.",
    "Paste your copied signature into the editor.",
    "Yahoo saves automatically once the content is entered."
  ],
  "General HTML": [
    "Copy the generated signature HTML from the builder.",
    "Open your email client or CRM signature settings.",
    "Switch to any HTML or rich text editing mode if available.",
    "Paste the signature content.",
    "Send yourself a test email to confirm links, spacing, and image sizing.",
    "If the client strips formatting, try the downloaded HTML file or paste into a richer editor first."
  ]
};

const TABS = Object.keys(GUIDES);

export default function InstallGuidePage() {
  const [activeTab, setActiveTab] = useState(TABS[0]);

  return (
    <div className="page-stack">
      <section className="section-intro">
        <p className="eyebrow">Install Guide</p>
        <h1>Paste your signature into the email client you already use.</h1>
        <p className="hero-subheadline">These steps are practical, short, and built around the export buttons in the SignatureForge AI builder.</p>
      </section>

      <section className="panel install-panel">
        <div className="tab-row" role="tablist" aria-label="Install guides">
          {TABS.map((tab) => (
            <button
              key={tab}
              aria-selected={activeTab === tab}
              className={`tab-button ${activeTab === tab ? "tab-button-active" : ""}`}
              role="tab"
              type="button"
              onClick={() => setActiveTab(tab)}
            >
              {tab}
            </button>
          ))}
        </div>

        <ol className="install-steps">
          {GUIDES[activeTab].map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
      </section>
    </div>
  );
}
