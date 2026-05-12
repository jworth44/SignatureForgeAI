import React, { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import SignatureForm from "../components/SignatureForm";
import SignaturePreview from "../components/SignaturePreview";
import { generateSignatureArtifacts, getDefaultDraft } from "../utils/htmlSignatureGenerator";

const STORAGE_KEY = "signatureforge.ai.draft";

export default function BuilderPage() {
  const [draft, setDraft] = useState(() => {
    const fallback = getDefaultDraft();
    try {
      const saved = window.localStorage.getItem(STORAGE_KEY);
      return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
    } catch {
      return fallback;
    }
  });
  const [copyMessage, setCopyMessage] = useState("");

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const isFree = draft.tier === "free";

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function applySuggestions(payload) {
    setDraft((current) => ({
      ...current,
      jobTitle: payload.suggestedTitleLine || current.jobTitle,
      ctaText: payload.suggestedCta || current.ctaText,
      disclaimer: payload.suggestedDisclaimer || current.disclaimer,
      brandDirection: payload.suggestedColorDirection || current.brandDirection,
      layout: current.tier === "pro" ? payload.suggestedLayoutValue || current.layout : current.layout
    }));
  }

  async function readFileAsDataUrl(targetField, file) {
    if (!file) {
      setDraft((current) => ({ ...current, [targetField]: "" }));
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      setDraft((current) => ({ ...current, [targetField]: String(reader.result || "") }));
    };
    reader.readAsDataURL(file);
  }

  async function handleCopy(text, label) {
    try {
      await navigator.clipboard.writeText(text);
      setCopyMessage(`${label} copied.`);
    } catch {
      setCopyMessage(`Unable to copy ${label.toLowerCase()}.`);
    }
  }

  function handleDownloadHtml() {
    const blob = new Blob([artifacts.exportHtmlDocument], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "signatureforge-signature.html";
    link.click();
    URL.revokeObjectURL(url);
    setCopyMessage("HTML file downloaded.");
  }

  function handleReset() {
    const fallback = getDefaultDraft();
    setDraft(fallback);
    window.localStorage.removeItem(STORAGE_KEY);
    setCopyMessage("Draft reset.");
  }

  return (
    <div className="page-stack">
      <section className="builder-hero">
        <div>
          <p className="eyebrow">Builder workspace</p>
          <h1>Build once, paste anywhere.</h1>
          <p className="hero-subheadline">
            Create a clean signature with professional spacing, clickable links, fixed image sizing, and zero visible table borders.
          </p>
        </div>
        <div className="builder-hero-links">
          <Link className="button button-secondary" to="/install">
            View Install Guide
          </Link>
          <Link className="button button-primary" to="/upgrade">
            Compare Pro plans
          </Link>
        </div>
      </section>

      <section className="builder-layout">
        <div className="builder-left-column">
          <SignatureForm
            draft={draft}
            effectiveLayout={artifacts.effectiveDraft.layout}
            onFieldChange={updateField}
            onColorChange={(value) => updateField("brandColor", value)}
            onLayoutChange={(value) => updateField("layout", value)}
            onTierChange={(value) =>
              setDraft((current) => ({
                ...current,
                tier: value,
                includeBranding: value === "free" ? true : current.includeBranding
              }))
            }
            onDividerToggle={(value) => updateField("showDivider", value)}
            onLogoSizeChange={(value) => updateField("logoSize", value)}
            onBrandingToggle={(value) => updateField("includeBranding", value)}
            onFileSelect={readFileAsDataUrl}
            onFileRemove={(field) => updateField(field, "")}
          />

          <AiSuggestionPanel draft={draft} onApplySuggestions={applySuggestions} />
        </div>

        <div className="builder-right-column">
          <SignaturePreview draft={draft} />

          <section className="panel export-panel">
            <div className="panel-header">
              <div>
                <p className="eyebrow">HTML export</p>
                <h2>Use it in your email client</h2>
              </div>
            </div>
            <div className="button-row">
              <button className="button button-primary" type="button" onClick={() => handleCopy(artifacts.exportHtml, "Signature HTML")}>
                Copy Signature HTML
              </button>
              <button className="button button-secondary" disabled={isFree} type="button" onClick={() => handleCopy(artifacts.plainText, "Plain text signature")}>
                Copy Plain Text Signature
              </button>
              <button className="button button-secondary" disabled={isFree} type="button" onClick={handleDownloadHtml}>
                Download HTML File
              </button>
              <button className="button button-ghost" type="button" onClick={handleReset}>
                Reset
              </button>
            </div>
            {isFree ? <p className="locked-copy">Free users can copy and paste the finished branded signature only. Upgrade to Pro for clean HTML export and extra controls.</p> : null}
            {copyMessage ? <p className="support-copy">{copyMessage}</p> : null}
          </section>
        </div>
      </section>
    </div>
  );
}
