import React, { useEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
import AiSuggestionPanel from "../components/AiSuggestionPanel";
import SignatureForm from "../components/SignatureForm";
import SignaturePreview from "../components/SignaturePreview";
import { generateSignatureArtifacts, getDefaultDraft } from "../utils/htmlSignatureGenerator";

const STORAGE_KEY = "signaturepilot.ai.draft";
const VERSION_STORAGE_KEY = "signaturepilot.ai.versions";
const MOBILE_LAYOUT_BREAKPOINT = 768;

const SAMPLE_PROFILES = {
  founder: {
    fullName: "Jordan Wells",
    jobTitle: "Founder & CEO",
    companyName: "Northlight Studio",
    phone: "+1 (555) 123-4567",
    email: "jordan@northlightstudio.com",
    website: "northlightstudio.com",
    location: "Winnipeg, MB",
    linkedinUrl: "https://linkedin.com/company/northlightstudio",
    brandColor: "#2663ff",
    layout: "minimal",
    ctaText: "See our latest work"
  },
  contractor: {
    fullName: "Mason Ortiz",
    jobTitle: "Licensed General Contractor",
    companyName: "Ortiz Build Co.",
    phone: "+1 (555) 241-8801",
    email: "mason@ortizbuildco.com",
    website: "ortizbuildco.com",
    location: "Dallas, TX",
    brandColor: "#d97706",
    layout: "classic",
    ctaText: "Request a project quote"
  },
  executive: {
    fullName: "Avery Chen",
    jobTitle: "VP, Strategic Partnerships",
    companyName: "Summit Ridge Capital",
    phone: "+1 (555) 880-4112",
    email: "avery@summitridgecapital.com",
    website: "summitridgecapital.com",
    location: "Chicago, IL",
    linkedinUrl: "https://linkedin.com/company/summitridgecapital",
    brandColor: "#0f172a",
    layout: "corporate",
    ctaText: "Schedule an introduction"
  }
};

const TEMPLATE_OPTIONS = [
  { value: "classic", label: "Professional Classic", description: "Balanced and polished for daily business email.", pro: false, tone: "blue", person: "Jordan Wells", title: "Founder | Northlight Studio", cta: "Book a quick call" },
  { value: "corporate", label: "Corporate", description: "Structured and brand-forward for teams and partnerships.", pro: true, tone: "charcoal", person: "Avery Chen", title: "VP, Strategic Partnerships", cta: "Schedule an introduction" },
  { value: "minimal", label: "Minimal", description: "Clean, modern, and founder-friendly.", pro: false, tone: "slate", person: "Jordan Wells", title: "Founder | Signature Pilot AI", cta: "See our latest work" },
  { value: "premium-split", label: "Premium", description: "A richer presentation with a stronger executive feel.", pro: true, tone: "violet", person: "Avery Chen", title: "Strategic Partnerships | Summit Ridge", cta: "Private client briefing" },
  { value: "mobile-compact", label: "Mobile Compact", description: "Built to stay readable in narrow mobile email apps.", pro: false, tone: "mobile", person: "Mason Ortiz", title: "Licensed General Contractor", cta: "Request a quote" }
];

const INDUSTRY_OPTIONS = [
  "Contractor / Trades",
  "Safety Consulting",
  "Real Estate",
  "Law / Legal",
  "Finance / Insurance",
  "Medical / Health",
  "Fitness / Coaching",
  "Tech / SaaS",
  "Retail / Ecommerce",
  "Creative / Design",
  "General Professional"
];

const GOAL_OPTIONS = ["Book calls", "Get quotes", "Show credibility", "Drive website visits"];
const TONE_OPTIONS = ["Professional", "Friendly", "Premium", "Contractor", "Minimal"];
const CONTROL_TABS = ["Content", "Style", "AI", "Export"];
const MOBILE_WORKSPACE_TABS = ["Templates", "Preview", "Edit", "Export"];

export default function BuilderPage() {
  const initialDraft = useMemo(() => loadInitialDraft(), []);
  const originalDraftRef = useRef(initialDraft);
  const [draft, setDraft] = useState(initialDraft);
  const [copyMessage, setCopyMessage] = useState("");
  const [copyState, setCopyState] = useState("idle");
  const [activeControlTab, setActiveControlTab] = useState("Content");
  const [mobileWorkspaceTab, setMobileWorkspaceTab] = useState("Preview");
  const [previewDevice, setPreviewDevice] = useState("desktop");
  const [previewZoom, setPreviewZoom] = useState("100");
  const [smartSetup, setSmartSetup] = useState({
    industry: "General Professional",
    goal: "Show credibility",
    tone: "Professional"
  });
  const [smartSetupPreview, setSmartSetupPreview] = useState(null);
  const [polishPreview, setPolishPreview] = useState(null);
  const [savedVersions, setSavedVersions] = useState(() => {
    try {
      const stored = window.localStorage.getItem(VERSION_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  }, [draft]);

  useEffect(() => {
    window.localStorage.setItem(VERSION_STORAGE_KEY, JSON.stringify(savedVersions));
  }, [savedVersions]);

  const artifacts = useMemo(() => generateSignatureArtifacts(draft), [draft]);
  const isFree = artifacts.effectiveDraft.tier === "free";
  const showAutoLayoutNotice = draft.layout === "mobile-compact" && draft.layoutAutoSelected;
  const healthScore = useMemo(() => evaluateSignatureHealth(artifacts.effectiveDraft), [artifacts.effectiveDraft]);
  const compatibilityChecklist = useMemo(() => buildCompatibilityChecklist(artifacts.effectiveDraft), [artifacts.effectiveDraft]);
  const templatePreviewMap = useMemo(
    () =>
      Object.fromEntries(
        TEMPLATE_OPTIONS.map((template) => {
          const previewDraft = buildTemplatePreviewDraft(template, draft);
          return [template.value, generateSignatureArtifacts(previewDraft)];
        })
      ),
    [draft]
  );

  useEffect(() => {
    function syncLayoutForScreenWidth() {
      const isNarrowScreen = window.innerWidth < MOBILE_LAYOUT_BREAKPOINT;
      if (!isNarrowScreen) {
        return;
      }

      setDraft((current) => {
        if (current.layoutManuallySelected || current.layout === "mobile-compact") {
          return current;
        }

        return {
          ...current,
          layout: "mobile-compact",
          layoutAutoSelected: true
        };
      });
    }

    syncLayoutForScreenWidth();
    window.addEventListener("resize", syncLayoutForScreenWidth);
    return () => window.removeEventListener("resize", syncLayoutForScreenWidth);
  }, []);

  useEffect(() => {
    if (copyState === "idle") {
      return undefined;
    }

    const timeoutId = window.setTimeout(() => {
      setCopyState("idle");
    }, 2400);

    return () => window.clearTimeout(timeoutId);
  }, [copyState]);

  function updateField(key, value) {
    setDraft((current) => ({ ...current, [key]: value }));
  }

  function saveCurrentVersion(reason = "Saved version") {
    setSavedVersions((current) => {
      const nextVersion = {
        id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        timestamp: new Date().toISOString(),
        summary: `${reason} | ${draft.fullName || "Unnamed"} | ${draft.jobTitle || "No title"}`,
        draft: { ...draft }
      };

      return [nextVersion, ...current].slice(0, 5);
    });
  }

  function applySampleProfile(profileKey) {
    const profile = SAMPLE_PROFILES[profileKey];
    if (!profile) {
      return;
    }

    setDraft((current) => ({
      ...current,
      ...profile,
      layout:
        current.tier === "free" && !["classic", "minimal", "mobile-compact"].includes(profile.layout)
          ? "classic"
          : profile.layout,
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
  }

  function handleLayoutChange(value) {
    setDraft((current) => ({
      ...current,
      layout: value,
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
    setMobileWorkspaceTab("Preview");
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
      setCopyState("success");
      setMobileWorkspaceTab("Preview");
    } catch {
      setCopyMessage("Copy failed. Try again or use another browser.");
      setCopyState("error");
    }
  }

  async function handleCopySignature() {
    try {
      if (window.ClipboardItem && navigator.clipboard?.write) {
        const clipboardItem = new window.ClipboardItem({
          "text/html": new Blob([artifacts.exportHtml], { type: "text/html" }),
          "text/plain": new Blob([artifacts.plainText], { type: "text/plain" })
        });
        await navigator.clipboard.write([clipboardItem]);
      } else {
        copyRenderedSignatureFallback(artifacts.exportHtml);
      }

      setCopyMessage("Signature copied. Paste it directly into Gmail, Outlook, Apple Mail, or Yahoo.");
      setCopyState("success");
      setMobileWorkspaceTab("Preview");
    } catch {
      try {
        copyRenderedSignatureFallback(artifacts.exportHtml);
        setCopyMessage("Signature copied using fallback mode.");
        setCopyState("success");
        setMobileWorkspaceTab("Preview");
      } catch {
        setCopyMessage("Copy failed. Try again or use another browser.");
        setCopyState("error");
      }
    }
  }

  function handleDownloadHtml() {
    const blob = new Blob([artifacts.exportHtmlDocument], { type: "text/html;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "signature-pilot-signature.html";
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

  function handleRevertToOriginal() {
    setDraft({ ...getDefaultDraft(), ...originalDraftRef.current });
    setCopyMessage("Reverted to the original signature.");
  }

  function restoreVersion(version) {
    setDraft({ ...getDefaultDraft(), ...version.draft });
    setCopyMessage("Previous signature restored.");
  }

  function deleteVersion(versionId) {
    setSavedVersions((current) => current.filter((version) => version.id !== versionId));
  }

  function handleTierChange(value) {
    setDraft((current) => ({
      ...current,
      tier: value,
      includeBranding: value === "free" ? true : current.includeBranding,
      layoutAutoSelected: false,
      logoSize: value === "free" && (current.logoSize === "custom" || current.logoSize === "extra-large") ? "large" : current.logoSize
    }));
  }

  function handleGenerateSmartSetup() {
    setSmartSetupPreview(buildSmartSetupRecommendation(draft, smartSetup));
  }

  function handleApplySmartSetup() {
    if (!smartSetupPreview) {
      return;
    }

    saveCurrentVersion("Before smart setup");
    setDraft((current) => ({
      ...current,
      jobTitle: smartSetupPreview.titleLine || current.jobTitle,
      ctaText: smartSetupPreview.ctaText || current.ctaText,
      disclaimer: smartSetupPreview.disclaimer || current.disclaimer,
      layout: resolveRecommendedLayout(current, smartSetupPreview.layout),
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
    setCopyMessage("Smart setup applied.");
    setMobileWorkspaceTab("Preview");
  }

  function handleGeneratePolish() {
    setPolishPreview(buildPolishRecommendation(draft));
  }

  function handleApplyPolish() {
    if (!polishPreview || isFree) {
      return;
    }

    saveCurrentVersion("Before one-click polish");
    setDraft((current) => ({
      ...current,
      jobTitle: polishPreview.jobTitle,
      companyName: polishPreview.companyName,
      ctaText: polishPreview.ctaText,
      disclaimer: polishPreview.disclaimer,
      layout: resolveRecommendedLayout(current, polishPreview.layout),
      layoutManuallySelected: true,
      layoutAutoSelected: false
    }));
    setCopyMessage("One-click polish applied.");
    setMobileWorkspaceTab("Preview");
  }

  const contentEditor = (
    <SignatureForm
      draft={draft}
      compatibilityChecklist={compatibilityChecklist}
      healthScore={healthScore}
      smartSetup={smartSetup}
      smartSetupPreview={smartSetupPreview}
      smartSetupOptions={{ industries: INDUSTRY_OPTIONS, goals: GOAL_OPTIONS, tones: TONE_OPTIONS }}
      onApplySampleProfile={applySampleProfile}
      onApplySmartSetup={handleApplySmartSetup}
      onFieldChange={updateField}
      onColorChange={(value) => updateField("brandColor", value)}
      onGenerateSmartSetup={handleGenerateSmartSetup}
      onTierChange={handleTierChange}
      onFileSelect={readFileAsDataUrl}
      onFileRemove={(field) => updateField(field, "")}
      onSmartSetupChange={(key, value) => setSmartSetup((current) => ({ ...current, [key]: value }))}
    />
  );

  const styleEditor = (
    <section className="workspace-panel-section">
      <div className="workspace-section-heading">
        <div>
          <p className="eyebrow">Style</p>
          <h3>Fine-tune the signature</h3>
        </div>
      </div>
      <div className="workspace-style-quick-grid">
        {TEMPLATE_OPTIONS.map((option) => {
          const locked = isFree && option.pro;
          const active = artifacts.effectiveDraft.layout === option.value;
          return (
            <button
              key={option.value}
              className={`button ${active ? "button-primary" : locked ? "button-locked" : "button-secondary"} workspace-style-chip`}
              disabled={locked}
              type="button"
              onClick={() => handleLayoutChange(option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
      <div className="field-grid">
        <label className="field">
          <span>Layout</span>
          <select aria-label="Preview layout" value={artifacts.effectiveDraft.layout} onChange={(event) => handleLayoutChange(event.target.value)}>
            {TEMPLATE_OPTIONS.map((option) => (
              <option key={option.value} disabled={isFree && option.pro} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <small className="locked-copy">
            {isFree
              ? "Free Mode includes Professional Classic, Minimal, and Mobile Compact. Corporate and Premium unlock with Pro."
              : "Use Mobile Compact if your signature looks squeezed in mobile email apps."}
          </small>
          {showAutoLayoutNotice ? <small className="support-copy">Mobile Compact selected for better mobile email compatibility.</small> : null}
        </label>

        <label className="field">
          <span>Brand colour</span>
          <input type="color" value={draft.brandColor} onChange={(event) => updateField("brandColor", event.target.value)} />
        </label>

        <label className="field">
          <span>Logo size</span>
          <select aria-label="Preview logo size" value={artifacts.effectiveDraft.logoSize} onChange={(event) => updateField("logoSize", event.target.value)}>
            <option value="small">Small</option>
            <option value="medium">Medium</option>
            <option value="large">Large</option>
            <option disabled={isFree} value="extra-large">Extra Large</option>
            <option disabled={isFree} value="custom">Custom</option>
          </select>
          <small className="locked-copy">
            {isFree ? "Free Mode supports Small, Medium, and Large. Extra Large and Custom are Pro features." : "Logo size updates the live preview and copied signature."}
          </small>
        </label>

        <label className="field">
          <span>Logo shape</span>
          <select disabled={isFree} value={artifacts.effectiveDraft.logoShape} onChange={(event) => updateField("logoShape", event.target.value)}>
            <option value="rounded">Rounded</option>
            <option value="square">Square</option>
            <option value="circle">Circle</option>
          </select>
          <small className="locked-copy">{isFree ? "Logo shape is a Pro customization feature." : "Shape styling updates the preview and export together."}</small>
        </label>

        {artifacts.effectiveDraft.logoSize === "custom" ? (
          <label className="field">
            <span>Custom logo width</span>
            <input
              aria-label="Preview custom logo width"
              max="180"
              min="40"
              type="number"
              value={artifacts.effectiveDraft.customLogoWidth}
              onChange={(event) => updateField("customLogoWidth", event.target.value)}
            />
            <small className="support-copy">Range: 40px to 180px.</small>
          </label>
        ) : null}

        <label className="field">
          <span>Divider</span>
          <select
            aria-label="Preview divider"
            disabled={isFree || artifacts.effectiveDraft.layout === "mobile-compact"}
            value={artifacts.effectiveDraft.showDivider ? "on" : "off"}
            onChange={(event) => updateField("showDivider", event.target.value === "on")}
          >
            <option value="off">Off</option>
            <option value="on">On</option>
          </select>
          <small className="locked-copy">
            {isFree || artifacts.effectiveDraft.layout === "mobile-compact"
              ? "Divider stays off in Free Mode and is not used in Mobile Compact."
              : "Optional Pro visual divider."}
          </small>
        </label>

        <label className="field">
          <span>Branding</span>
          <select
            aria-label="Preview branding"
            disabled={isFree}
            value={artifacts.includeBranding ? "include" : "remove"}
            onChange={(event) => updateField("includeBranding", event.target.value === "include")}
          >
            <option value="include">Include</option>
            <option value="remove">Remove</option>
          </select>
          <small className="locked-copy">{isFree ? "Signature Pilot AI branding included." : "Pro can export clean unbranded HTML."}</small>
        </label>
      </div>
      <div className="workspace-inline-actions">
        <button className="button button-secondary button-inline" type="button" onClick={handleRevertToOriginal}>
          Revert to Original
        </button>
        {copyMessage ? <p className="support-copy">{copyMessage}</p> : null}
      </div>
    </section>
  );

  const aiEditor = (
    <div className="workspace-ai-grid">
      <AiSuggestionPanel
        draft={draft}
        onAfterGenerate={() => setMobileWorkspaceTab("Preview")}
        onApplySuggestions={({ mode, suggestions }) => {
          setDraft((current) => applySuggestedFields(current, suggestions, mode));
          setCopyMessage(`${mode} applied.`);
          setMobileWorkspaceTab("Preview");
        }}
        onSaveVersion={saveCurrentVersion}
      />

      <section className="panel workspace-panel-section">
        <div className="panel-header">
          <div>
            <p className="eyebrow">One-click polish</p>
            <h2>Clean up the signature in one pass</h2>
          </div>
        </div>
        {isFree ? (
          <div className="locked-banner">
            One-click polish is a Pro feature. Upgrade to tighten wording, improve CTA copy, and recommend a cleaner layout.
          </div>
        ) : (
          <>
            <p className="support-copy">Review a cleaner, shorter version before applying anything to your live signature.</p>
            <div className="button-row">
              <button className="button button-secondary" type="button" onClick={handleGeneratePolish}>
                Preview One-click Polish
              </button>
              {polishPreview ? (
                <button className="button button-primary" type="button" onClick={handleApplyPolish}>
                  Apply One-click Polish
                </button>
              ) : null}
            </div>
            {polishPreview ? (
              <div className="suggestion-card">
                <div>
                  <span className="suggestion-label">Polished title</span>
                  <strong>{[polishPreview.jobTitle, polishPreview.companyName].filter(Boolean).join(" | ")}</strong>
                </div>
                <div>
                  <span className="suggestion-label">Polished CTA</span>
                  <p>{polishPreview.ctaText}</p>
                </div>
                <div>
                  <span className="suggestion-label">Polished disclaimer</span>
                  <p>{polishPreview.disclaimer}</p>
                </div>
                <div>
                  <span className="suggestion-label">Recommended layout</span>
                  <p>{lookupTemplateLabel(polishPreview.layout)}</p>
                </div>
                <p className="support-copy">{polishPreview.note}</p>
              </div>
            ) : null}
          </>
        )}
      </section>

      <section className="panel workspace-history-panel">
        <div className="panel-header">
          <div>
            <p className="eyebrow">Recovery</p>
            <h2>Recent Signature Versions</h2>
          </div>
          <button className="button button-secondary button-inline" type="button" onClick={() => saveCurrentVersion("Manual save")}>
            Save Current Version
          </button>
        </div>
        {savedVersions.length ? (
          <div className="version-list">
            {savedVersions.map((version) => (
              <article key={version.id} className="version-card">
                <div>
                  <strong>{version.summary}</strong>
                  <p className="support-copy">{new Date(version.timestamp).toLocaleString()}</p>
                </div>
                <div className="button-row">
                  <button className="button button-primary" type="button" onClick={() => restoreVersion(version)}>
                    Restore
                  </button>
                  <button className="button button-ghost" type="button" onClick={() => deleteVersion(version.id)}>
                    Delete version
                  </button>
                </div>
              </article>
            ))}
          </div>
        ) : (
          <p className="support-copy">Save current work or apply AI suggestions to build a recoverable version history.</p>
        )}
      </section>
    </div>
  );

  const exportEditor = (
    <section className="panel export-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">Export</p>
          <h2>Copy or download your signature</h2>
        </div>
      </div>
      <div className="workspace-export-grid">
        <div className="export-action-card">
          <button
            className={`button button-primary ${copyState === "success" ? "button-success" : ""} ${copyState === "error" ? "button-error" : ""}`}
            type="button"
            onClick={handleCopySignature}
          >
            {copyState === "success" ? "Copied!" : "Copy Signature"}
          </button>
          <p className="support-copy">Copy Signature: best for Gmail, Outlook, Apple Mail, Yahoo. Copies the finished visual signature.</p>
        </div>

        {!isFree ? (
          <div className="export-action-card">
            <button className="button button-secondary" type="button" onClick={() => handleCopy(artifacts.exportHtml, "Raw HTML")}>
              Copy Raw HTML
            </button>
            <p className="support-copy">Copy Raw HTML: Pro only. For platforms that specifically ask for HTML code.</p>
          </div>
        ) : null}

        {!isFree ? (
          <div className="export-action-card">
            <button className="button button-secondary" type="button" onClick={() => handleCopy(artifacts.plainText, "Plain text signature")}>
              Copy Plain Text Signature
            </button>
            <p className="support-copy">Copy Plain Text Signature: copies a text-only fallback.</p>
          </div>
        ) : null}

        <div className="export-action-card">
          <button className="button button-secondary" disabled={isFree} type="button" onClick={handleDownloadHtml}>
            Download HTML File
          </button>
          <p className="support-copy">Download HTML File: Pro export/download backup.</p>
        </div>

        <div className="export-action-card">
          <button className="button button-ghost" type="button" onClick={handleReset}>
            Reset
          </button>
          <p className="support-copy">Reset: clears the current draft and starts over.</p>
        </div>

        <div className="export-action-card">
          <Link className="button button-secondary" to="/install">
            Install help
          </Link>
          <p className="support-copy">Install help: step-by-step Gmail, Outlook, Apple Mail, Yahoo, and general HTML instructions.</p>
        </div>
      </div>
      <p className="support-copy">
        Use Copy Signature for Gmail, Outlook, Apple Mail, and Yahoo. Do not paste raw HTML into your email settings unless the platform specifically asks for HTML.
      </p>
      {isFree ? <p className="locked-copy">Free signatures include Signature Pilot AI branding. Editing/removing branding is a Pro feature.</p> : null}
      {copyState === "success" ? <p className="copy-feedback copy-feedback-success">Signature copied. Paste it into Gmail, Outlook, Apple Mail, or Yahoo.</p> : null}
      {copyState === "error" ? <p className="copy-feedback copy-feedback-error">Copy failed. Try again or use another browser.</p> : null}
      {isFree ? <p className="locked-copy">Free signatures are branded and limited. Upgrade to Pro to remove branding, unlock advanced layout controls, and export clean editable HTML.</p> : null}
      <p className="support-copy">
        Why can I still edit after pasting? Email clients such as Outlook and Gmail allow users to edit pasted signature content. Signature Pilot AI controls what is generated and exported, but cannot lock third-party editors. Pro unlocks clean, editable, unbranded output.
      </p>
      {copyMessage ? <p className="support-copy">{copyMessage}</p> : null}
    </section>
  );

  return (
    <div className="page-stack workspace-page">
      <section className="workspace-topbar panel">
        <div className="workspace-topbar-copy">
          <p className="eyebrow">Builder workspace</p>
          <h1>Build once, paste anywhere.</h1>
          <p className="hero-subheadline">A focused workspace for professional email signatures that stay clean in Gmail, Outlook, Apple Mail, and Yahoo.</p>
        </div>
        <div className="workspace-topbar-actions">
          <label className="tier-toggle workspace-mode-control">
            <span>Mode</span>
            <select value={draft.tier} onChange={(event) => handleTierChange(event.target.value)}>
              <option value="free">Free Mode</option>
              <option value="pro">Pro Mode</option>
            </select>
          </label>
          <Link className="button button-secondary" to="/install">
            Install Guide
          </Link>
          <Link className="button button-primary" to="/upgrade">
            Upgrade
          </Link>
        </div>
      </section>

      <div className="workspace-mobile-tabs">
        {MOBILE_WORKSPACE_TABS.map((tab) => (
          <button
            key={tab}
            className={`tab-button ${mobileWorkspaceTab === tab ? "tab-button-active" : ""}`}
            type="button"
            onClick={() => {
              setMobileWorkspaceTab(tab);
              if (tab === "Export") {
                setActiveControlTab("Export");
              } else if (tab === "Edit" && activeControlTab === "Export") {
                setActiveControlTab("Content");
              }
            }}
          >
            {tab}
          </button>
        ))}
      </div>

      <section className="workspace-shell">
        <aside className={`panel workspace-templates ${mobileWorkspaceTab === "Templates" ? "workspace-mobile-active" : ""}`}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Templates</p>
              <h2>Pick a signature style</h2>
            </div>
          </div>
          <div className="workspace-template-list">
            {TEMPLATE_OPTIONS.map((template) => {
              const locked = isFree && template.pro;
              const active = artifacts.effectiveDraft.layout === template.value;
              const templatePreview = templatePreviewMap[template.value];
              return (
                <article
                  key={template.value}
                  className={`template-card workspace-template-card ${active ? "template-card-active" : ""} ${locked ? "template-card-locked" : ""}`}
                >
                  <div className="workspace-template-card-head">
                    <div className="workspace-template-copy">
                      <div className="workspace-template-title-row">
                        <strong>{template.label}</strong>
                        <span className={`workspace-badge ${locked ? "workspace-badge-pro" : "workspace-badge-free"}`}>{template.pro ? "Pro" : "Free"}</span>
                      </div>
                      <span>{template.description}</span>
                    </div>
                  </div>
                  <div className={`workspace-template-signature-shell workspace-template-signature-shell-${template.tone}`}>
                    <div className="workspace-template-signature-frame">
                      <div className="workspace-template-signature-canvas">
                        <div
                          className="workspace-template-signature-surface"
                          dangerouslySetInnerHTML={{ __html: templatePreview.previewHtml }}
                        />
                      </div>
                    </div>
                    <div className="workspace-template-card-meta">
                      <span>{template.person}</span>
                      <span>{template.cta}</span>
                    </div>
                  </div>
                  <button
                    className={`button ${active ? "button-primary" : locked ? "button-locked" : "button-secondary"} workspace-template-action`}
                    disabled={locked}
                    type="button"
                    onClick={() => handleLayoutChange(template.value)}
                  >
                    {locked ? "Pro style" : active ? "Selected style" : "Use this style"}
                  </button>
                </article>
              );
            })}
          </div>
        </aside>

        <div className={`panel workspace-preview ${mobileWorkspaceTab === "Preview" ? "workspace-mobile-active" : ""}`}>
          <SignaturePreview
            draft={draft}
            effectiveDraft={artifacts.effectiveDraft}
            previewZoom={previewZoom}
            previewDevice={previewDevice}
            onPreviewZoomChange={setPreviewZoom}
            onPreviewDeviceChange={setPreviewDevice}
          />
        </div>

        <div className={`panel workspace-controls ${mobileWorkspaceTab === "Edit" || mobileWorkspaceTab === "Export" ? "workspace-mobile-active" : ""}`}>
          <div className="panel-header">
            <div>
              <p className="eyebrow">Controls</p>
              <h2>Edit, refine, and export</h2>
            </div>
          </div>

          <div className="workspace-control-tabs">
            {CONTROL_TABS.map((tab) => (
              <button
                key={tab}
                className={`tab-button ${activeControlTab === tab ? "tab-button-active" : ""}`}
                type="button"
                onClick={() => {
                  setActiveControlTab(tab);
                  setMobileWorkspaceTab(tab === "Export" ? "Export" : "Edit");
                }}
              >
                {tab}
              </button>
            ))}
          </div>

          <div className="workspace-control-body">
            <div className={`workspace-tab-panel ${activeControlTab === "Content" ? "workspace-tab-panel-active" : ""}`}>{contentEditor}</div>
            <div className={`workspace-tab-panel ${activeControlTab === "Style" ? "workspace-tab-panel-active" : ""}`}>{styleEditor}</div>
            <div className={`workspace-tab-panel ${activeControlTab === "AI" ? "workspace-tab-panel-active" : ""}`}>{aiEditor}</div>
            <div className={`workspace-tab-panel ${activeControlTab === "Export" ? "workspace-tab-panel-active" : ""}`}>{exportEditor}</div>
          </div>
        </div>
      </section>
    </div>
  );
}

function buildTemplatePreviewDraft(template, draft) {
  const fallback = getDefaultDraft();

  return {
    ...fallback,
    ...draft,
    tier: template.pro ? "pro" : draft.tier,
    layout: template.value,
    showDivider: template.value === "mobile-compact" ? false : draft.showDivider,
    includeBranding: template.pro ? false : draft.tier === "free" ? true : draft.includeBranding
  };
}

function resolveRecommendedLayout(draft, recommendedLayout) {
  if (draft.tier !== "pro" && ["corporate", "premium-split"].includes(recommendedLayout)) {
    return "classic";
  }

  return recommendedLayout;
}

function lookupTemplateLabel(layout) {
  return TEMPLATE_OPTIONS.find((template) => template.value === layout)?.label || "Professional Classic";
}

function buildSmartSetupRecommendation(draft, smartSetup) {
  const industryMap = {
    "Contractor / Trades": {
      layout: "classic",
      titleLine: draft.jobTitle || "Licensed General Contractor",
      ctaText: "Request a project quote",
      disclaimer: "Estimates and site recommendations are confirmed after a project review."
    },
    "Safety Consulting": {
      layout: "corporate",
      titleLine: draft.jobTitle || "HSE Director",
      ctaText: "Book a compliance call",
      disclaimer: "Safety recommendations are tailored after a documented assessment."
    },
    "Real Estate": {
      layout: "premium-split",
      titleLine: draft.jobTitle || "Real Estate Advisor",
      ctaText: "View current listings",
      disclaimer: "Availability and listing details may change without notice."
    },
    "Law / Legal": {
      layout: "corporate",
      titleLine: draft.jobTitle || "Legal Counsel",
      ctaText: "Schedule a confidential consultation",
      disclaimer: "This email does not create a solicitor-client relationship."
    },
    "Finance / Insurance": {
      layout: "corporate",
      titleLine: draft.jobTitle || "Senior Advisor",
      ctaText: "Review coverage options",
      disclaimer: "Coverage and financial products are subject to review and approval."
    },
    "Medical / Health": {
      layout: "minimal",
      titleLine: draft.jobTitle || "Patient Care Coordinator",
      ctaText: "Book an appointment",
      disclaimer: "Please do not send urgent medical concerns by email."
    },
    "Fitness / Coaching": {
      layout: "minimal",
      titleLine: draft.jobTitle || "Performance Coach",
      ctaText: "Start your program",
      disclaimer: "Results vary based on commitment, training history, and health status."
    },
    "Tech / SaaS": {
      layout: "minimal",
      titleLine: draft.jobTitle || "Founder & CEO",
      ctaText: "See the platform in action",
      disclaimer: "Timelines and roadmap details may evolve as the product grows."
    },
    "Retail / Ecommerce": {
      layout: "classic",
      titleLine: draft.jobTitle || "Brand Manager",
      ctaText: "Shop the latest collection",
      disclaimer: "Inventory and promotional availability may change without notice."
    },
    "Creative / Design": {
      layout: "premium-split",
      titleLine: draft.jobTitle || "Creative Director",
      ctaText: "Review our latest work",
      disclaimer: "Project timelines and availability depend on current production capacity."
    },
    "General Professional": {
      layout: "classic",
      titleLine: draft.jobTitle || "Director",
      ctaText: "Book a quick introduction",
      disclaimer: "Response timelines may vary based on current client commitments."
    }
  };

  const base = industryMap[smartSetup.industry] || industryMap["General Professional"];
  const toneAdjustments = {
    Friendly: "with a warm, approachable feel",
    Premium: "with polished premium wording",
    Contractor: "with direct service-first wording",
    Minimal: "with cleaner, lighter copy",
    Professional: "with clear professional wording"
  };

  const goalAdjustments = {
    "Book calls": "Optimized to make booking the next conversation easy.",
    "Get quotes": "Optimized to encourage quote or estimate requests.",
    "Show credibility": "Optimized to reinforce trust and professionalism.",
    "Drive website visits": "Optimized to send recipients to the website first."
  };

  return {
    ...base,
    layout: smartSetup.goal === "Drive website visits" && base.layout === "classic" ? "minimal" : base.layout,
    ctaText:
      smartSetup.goal === "Drive website visits"
        ? "Visit our website"
        : smartSetup.goal === "Book calls"
          ? "Schedule a quick call"
          : smartSetup.goal === "Get quotes"
            ? "Request a quote"
            : base.ctaText,
    note: `${toneAdjustments[smartSetup.tone]} ${goalAdjustments[smartSetup.goal]}`,
    templateLabel: lookupTemplateLabel(base.layout)
  };
}

function evaluateSignatureHealth(draft) {
  const tips = [];
  let score = 0;

  if (draft.fullName?.trim()) {
    score += 18;
  } else {
    tips.push("Add a clear full name so the signature feels credible immediately.");
  }

  if (draft.jobTitle?.trim() && draft.companyName?.trim()) {
    score += 18;
  } else {
    tips.push("Include both a title and company so the signature reads more professional.");
  }

  if (draft.phone?.trim() && draft.email?.trim()) {
    score += 18;
  } else {
    tips.push("Include both phone and email to make contact easier across devices.");
  }

  if (draft.website?.trim() || draft.ctaText?.trim()) {
    score += 14;
  } else {
    tips.push("Add a website or CTA so the signature guides the next action.");
  }

  if (draft.logoDataUrl) {
    score += 12;
  } else {
    tips.push("A logo helps the signature feel more polished and brand-aware.");
  }

  const titleLength = `${draft.jobTitle || ""} ${draft.companyName || ""}`.trim().length;
  if (titleLength <= 52) {
    score += 10;
  } else {
    tips.push("Shorten the title/company line to keep the signature cleaner on mobile.");
  }

  if (draft.layout === "mobile-compact" || titleLength < 42) {
    score += 10;
  } else {
    tips.push("Mobile Compact is recommended when the title/company line starts to wrap.");
  }

  return {
    score: Math.min(100, score),
    tips: tips.slice(0, 3)
  };
}

function buildCompatibilityChecklist(draft) {
  return [
    { label: "Gmail ready", passed: true },
    { label: "Outlook ready", passed: true },
    { label: "Apple Mail ready", passed: true },
    { label: "Mobile compact available", passed: true },
    { label: "No visible borders", passed: true },
    { label: "Clickable links", passed: Boolean(draft.phone || draft.email || draft.website) }
  ];
}

function buildPolishRecommendation(draft) {
  const cleanedTitle = shortenCopy(draft.jobTitle, 34);
  const cleanedCompany = shortenCopy(draft.companyName, 28);
  const compactTitleLength = `${cleanedTitle} ${cleanedCompany}`.trim().length;

  return {
    jobTitle: cleanedTitle,
    companyName: cleanedCompany,
    ctaText: polishCta(draft.ctaText),
    disclaimer: shortenCopy(draft.disclaimer, 82),
    layout: compactTitleLength > 44 ? "mobile-compact" : draft.layout === "classic" ? "minimal" : draft.layout,
    note: compactTitleLength > 44
      ? "This pass shortens the top line and recommends Mobile Compact for cleaner phone rendering."
      : "This pass tightens the title, CTA, and disclaimer while keeping the signature clean."
  };
}

function polishCta(value) {
  const raw = String(value || "").trim();
  if (!raw) {
    return "Book a quick call";
  }

  if (/schedule|book/i.test(raw)) {
    return "Book a quick call";
  }

  if (/quote|estimate/i.test(raw)) {
    return "Request a quote";
  }

  if (/website|visit|work/i.test(raw)) {
    return "See our latest work";
  }

  return shortenCopy(raw, 28);
}

function shortenCopy(value, limit) {
  const normalized = String(value || "")
    .replace(/\s+/g, " ")
    .trim();

  if (normalized.length <= limit) {
    return normalized;
  }

  return `${normalized.slice(0, Math.max(0, limit - 1)).trim()}…`;
}

function loadInitialDraft() {
  const fallback = getDefaultDraft();
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    return saved ? { ...fallback, ...JSON.parse(saved) } : fallback;
  } catch {
    return fallback;
  }
}

function copyRenderedSignatureFallback(html) {
  const selection = window.getSelection();
  const previousRanges = [];
  if (selection) {
    for (let index = 0; index < selection.rangeCount; index += 1) {
      previousRanges.push(selection.getRangeAt(index));
    }
  }

  const container = document.createElement("div");
  container.setAttribute("contenteditable", "true");
  container.setAttribute("aria-hidden", "true");
  container.style.position = "fixed";
  container.style.left = "-9999px";
  container.style.top = "0";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.innerHTML = html;
  document.body.appendChild(container);

  const range = document.createRange();
  range.selectNodeContents(container);
  selection?.removeAllRanges();
  selection?.addRange(range);
  document.execCommand("copy");
  selection?.removeAllRanges();
  previousRanges.forEach((previousRange) => selection?.addRange(previousRange));
  document.body.removeChild(container);
}

function applySuggestedFields(current, suggestions, mode = "Apply Suggestions") {
  switch (mode) {
    case "Apply Only Title":
      return {
        ...current,
        jobTitle: suggestions.suggestedTitleLine || current.jobTitle
      };
    case "Apply Only CTA":
      return {
        ...current,
        ctaText: suggestions.suggestedCta || current.ctaText
      };
    case "Apply Only Disclaimer":
      return {
        ...current,
        disclaimer: suggestions.suggestedDisclaimer || current.disclaimer
      };
    case "Apply Suggested Layout":
      return {
        ...current,
        layout: current.tier === "pro" ? suggestions.suggestedLayoutValue || current.layout : current.layout,
        layoutManuallySelected: true,
        layoutAutoSelected: false
      };
    default:
      return {
        ...current,
        jobTitle: suggestions.suggestedTitleLine || current.jobTitle,
        ctaText: suggestions.suggestedCta || current.ctaText,
        disclaimer: suggestions.suggestedDisclaimer || current.disclaimer,
        brandDirection: suggestions.suggestedColorDirection || current.brandDirection
      };
  }
}
