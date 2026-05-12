import React, { useState } from "react";

const TONE_OPTIONS = ["Professional", "Friendly", "Premium", "Contractor", "Minimal"];
const GOAL_OPTIONS = ["Book calls", "Get quotes", "Show credibility", "Drive website visits"];

export default function AiSuggestionPanel({ draft, onApplySuggestions }) {
  const isFree = draft.tier === "free";
  const [businessType, setBusinessType] = useState("Consulting");
  const [tone, setTone] = useState("Professional");
  const [goal, setGoal] = useState("Show credibility");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [suggestions, setSuggestions] = useState(null);

  async function handleGenerate() {
    setLoading(true);
    setError("");
    try {
      const response = await fetch("/api/ai/signature-suggestions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          businessType,
          tone,
          goal,
          companyName: draft.companyName,
          fullName: draft.fullName
        })
      });
      const payload = await response.json();
      if (!response.ok) {
        throw new Error(payload.message || "Unable to generate suggestions.");
      }
      setSuggestions(payload);
      onApplySuggestions(payload);
    } catch (requestError) {
      setError(requestError.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <section className="panel ai-panel">
      <div className="panel-header">
        <div>
          <p className="eyebrow">AI assistant panel</p>
          <h2>Generate signature suggestions</h2>
        </div>
      </div>

      <div className="field-grid field-grid-tight">
        <label className="field">
          <span>Business type / industry</span>
          <input disabled={isFree} value={businessType} onChange={(event) => setBusinessType(event.target.value)} />
        </label>

        <label className="field">
          <span>Desired tone</span>
          <select disabled={isFree} value={tone} onChange={(event) => setTone(event.target.value)}>
            {TONE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>

        <label className="field">
          <span>Goal</span>
          <select disabled={isFree} value={goal} onChange={(event) => setGoal(event.target.value)}>
            {GOAL_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option}
              </option>
            ))}
          </select>
        </label>
      </div>

      <button className="button button-primary" disabled={loading || isFree} type="button" onClick={handleGenerate}>
        {loading ? "Generating..." : "Generate Signature Suggestions"}
      </button>

      {isFree ? <p className="locked-copy">Advanced AI suggestions are available in Pro Mode.</p> : null}

      {error ? <p className="error-copy">{error}</p> : null}

      {suggestions ? (
        <div className="suggestion-card">
          <div>
            <span className="suggestion-label">Suggested title line</span>
            <strong>{suggestions.suggestedTitleLine}</strong>
          </div>
          <div>
            <span className="suggestion-label">Suggested CTA</span>
            <p>{suggestions.suggestedCta}</p>
          </div>
          <div>
            <span className="suggestion-label">Suggested disclaimer</span>
            <p>{suggestions.suggestedDisclaimer}</p>
          </div>
          <div>
            <span className="suggestion-label">Suggested colour direction</span>
            <p>{suggestions.suggestedColorDirection}</p>
          </div>
          <div>
            <span className="suggestion-label">Suggested layout</span>
            <p>{suggestions.suggestedLayout}</p>
          </div>
          <p className="support-copy">
            Source: {suggestions.source === "openai" ? "OpenAI API" : "Built-in fallback logic"}
          </p>
        </div>
      ) : null}
    </section>
  );
}
