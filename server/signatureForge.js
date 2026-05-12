const TONE_MAP = {
  Professional: {
    titlePrefix: "Strategic",
    cta: "Schedule a short introduction call",
    disclaimer: "This message may contain confidential business information.",
    colorDirection: "Electric blue with clean charcoal contrast",
    layout: "classic"
  },
  Friendly: {
    titlePrefix: "Friendly",
    cta: "Say hello and book a quick chat",
    disclaimer: "Replies are welcome and usually answered within one business day.",
    colorDirection: "Soft blue with approachable lavender accents",
    layout: "modern"
  },
  Premium: {
    titlePrefix: "Executive",
    cta: "Book a premium consultation",
    disclaimer: "Confidentiality applies to all project discussions and estimates.",
    colorDirection: "Deep charcoal with electric blue and soft purple accents",
    layout: "premium-split"
  },
  Contractor: {
    titlePrefix: "Licensed",
    cta: "Request a quote for your next project",
    disclaimer: "Quotes and timelines are confirmed after scope review.",
    colorDirection: "Bold blue with grounded charcoal utility tones",
    layout: "compact"
  },
  Minimal: {
    titlePrefix: "Clear",
    cta: "Visit the site for details",
    disclaimer: "Please keep this email for your records.",
    colorDirection: "Light neutral base with restrained blue highlights",
    layout: "compact"
  }
};

const GOAL_SUFFIX_MAP = {
  "Book calls": "for calls",
  "Get quotes": "for project quotes",
  "Show credibility": "for trusted communication",
  "Drive website visits": "for site traffic"
};

export async function buildSignatureSuggestions(input) {
  const normalized = normalizeInput(input);
  if (process.env.OPENAI_API_KEY) {
    try {
      const aiPayload = await requestOpenAiSuggestions(normalized);
      if (aiPayload) {
        return {
          ...aiPayload,
          suggestedLayoutValue: normalizeSignatureLayoutValue(aiPayload.suggestedLayoutValue || aiPayload.suggestedLayout),
          source: "openai",
          message: "Generated with OpenAI."
        };
      }
    } catch {
      return {
        ...buildFallbackSuggestions(normalized),
        source: "fallback",
        message: "OpenAI is unavailable right now. Using built-in suggestions instead."
      };
    }
  }

  return {
    ...buildFallbackSuggestions(normalized),
    source: "fallback",
    message: "OpenAI is not configured. Using built-in suggestions instead."
  };
}

export function normalizeSignatureLayoutValue(value) {
  const normalized = String(value || "").toLowerCase().trim();
  if (["classic", "modern", "compact", "premium-split"].includes(normalized)) {
    return normalized;
  }
  if (normalized.includes("premium")) {
    return "premium-split";
  }
  if (normalized.includes("modern")) {
    return "modern";
  }
  if (normalized.includes("compact")) {
    return "compact";
  }
  return "classic";
}

function buildFallbackSuggestions(input) {
  const tonePreset = TONE_MAP[input.tone] || TONE_MAP.Professional;
  const company = input.companyName || input.businessType || "Your Company";
  const person = input.fullName || "Your Name";
  const goalSuffix = GOAL_SUFFIX_MAP[input.goal] || "for professional outreach";

  return {
    suggestedTitleLine: `${tonePreset.titlePrefix} ${input.businessType} Advisor at ${company}`,
    suggestedCta: `${tonePreset.cta} ${goalSuffix}.`,
    suggestedDisclaimer: tonePreset.disclaimer,
    suggestedColorDirection: tonePreset.colorDirection,
    suggestedLayout: readableLayoutName(tonePreset.layout),
    suggestedLayoutValue: tonePreset.layout,
    promptEcho: `${person} | ${input.businessType} | ${input.tone} | ${input.goal}`
  };
}

async function requestOpenAiSuggestions(input) {
  const response = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: process.env.OPENAI_SIGNATURE_MODEL || "gpt-4o-mini",
      temperature: 0.7,
      response_format: { type: "json_object" },
      messages: [
        {
          role: "system",
          content:
            "You generate concise JSON for email signature suggestions. Return keys: suggestedTitleLine, suggestedCta, suggestedDisclaimer, suggestedColorDirection, suggestedLayout, suggestedLayoutValue."
        },
        {
          role: "user",
          content: `Business type: ${input.businessType}\nTone: ${input.tone}\nGoal: ${input.goal}\nCompany: ${input.companyName}\nPerson: ${input.fullName}`
        }
      ]
    })
  });

  if (!response.ok) {
    throw new Error("OpenAI request failed.");
  }

  const payload = await response.json();
  const rawContent = payload?.choices?.[0]?.message?.content;
  if (!rawContent) {
    return null;
  }

  return JSON.parse(rawContent);
}

function normalizeInput(input) {
  return {
    businessType: String(input.businessType || "Professional services").trim(),
    tone: String(input.tone || "Professional").trim(),
    goal: String(input.goal || "Show credibility").trim(),
    companyName: String(input.companyName || "").trim(),
    fullName: String(input.fullName || "").trim()
  };
}

function readableLayoutName(value) {
  const normalized = normalizeSignatureLayoutValue(value);
  switch (normalized) {
    case "modern":
      return "Modern";
    case "compact":
      return "Compact";
    case "premium-split":
      return "Premium Split Line";
    default:
      return "Classic";
  }
}
