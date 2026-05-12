import React, { useMemo } from "react";
import { generateSignatureArtifacts, getLayoutMeta } from "../utils/htmlSignatureGenerator";

export default function SignaturePreview({ draft }) {
  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const layoutMeta = getLayoutMeta(artifacts.effectiveDraft.layout);

  return (
    <section className="panel preview-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Live preview</p>
          <h2>Email-safe signature</h2>
        </div>
        <span className={`tier-pill ${draft.tier === "pro" ? "tier-pill-pro" : ""}`}>
          {draft.tier === "pro" ? "Pro mode" : "Free mode"}
        </span>
      </div>

      <div className="preview-meta">
        <span>{layoutMeta.name}</span>
        <span>{artifacts.effectiveDraft.showDivider ? "Divider on" : "Divider off"}</span>
        <span>No visible borders</span>
        <span>{artifacts.includeBranding ? "SignatureForge AI branding included" : "Branding removed"}</span>
      </div>

      <div className="signature-preview-surface" dangerouslySetInnerHTML={{ __html: artifacts.previewHtml }} />

      {draft.tier === "free" ? <div className="inline-banner">SignatureForge AI branding included in Free Mode.</div> : null}
    </section>
  );
}
