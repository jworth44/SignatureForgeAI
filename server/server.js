import dotenv from "dotenv";
import express from "express";
import cors from "cors";
import path from "node:path";
import { fileURLToPath } from "node:url";
import Stripe from "stripe";
import { buildSignatureSuggestions } from "./signatureForge.js";

const app = express();
const port = process.env.PORT || 3101;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, "..");
const distPath = path.resolve(projectRoot, "dist");

dotenv.config({ path: path.resolve(projectRoot, ".env") });

const stripe = process.env.STRIPE_SECRET_KEY ? new Stripe(process.env.STRIPE_SECRET_KEY) : null;
const proMonthlyPriceId = process.env.STRIPE_PRO_MONTHLY_PRICE_ID || process.env.STRIPE_MONTHLY_PRICE_ID || process.env.STRIPE_PRICE_ID || "";
const businessMonthlyPriceId = process.env.STRIPE_BUSINESS_MONTHLY_PRICE_ID || "";

app.use(cors());
app.use(express.json({ limit: "8mb" }));

app.get("/api/health", (_request, response) => {
  response.json({
    ok: true,
    app: "signature-pilot-ai",
    integrations: {
      openaiConfigured: Boolean(process.env.OPENAI_API_KEY),
      logoAiEnabled: Boolean(process.env.OPENAI_API_KEY),
      stripeConfigured: Boolean(stripe && proMonthlyPriceId),
      billingPlans: {
        proSelfServe: Boolean(stripe && proMonthlyPriceId),
        businessSelfServe: Boolean(stripe && businessMonthlyPriceId)
      }
    }
  });
});

app.post("/api/ai/signature-suggestions", async (request, response) => {
  try {
    const suggestions = await buildSignatureSuggestions(request.body || {});
    return response.json(suggestions);
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/billing/create-checkout-session", async (request, response) => {
  try {
    const plan = String(request.body?.plan || "pro").trim().toLowerCase();
    const isBusinessPlan = plan === "business";
    const selectedPriceId = isBusinessPlan ? businessMonthlyPriceId : proMonthlyPriceId;

    if (!stripe || !selectedPriceId) {
      const unavailableResponse = buildBillingUnavailableResponseForPlan(isBusinessPlan ? "business" : "pro");
      return response.status(503).json(unavailableResponse);
    }

    if (plan !== "pro" && plan !== "business") {
      return response.status(503).json(buildBillingUnavailableResponse());
    }

    const session = await stripe.checkout.sessions.create({
      mode: "subscription",
      payment_method_types: ["card"],
      line_items: [{ price: selectedPriceId, quantity: 1 }],
      success_url: `${getAppOrigin(request)}/upgrade?checkout=success`,
      cancel_url: `${getAppOrigin(request)}/upgrade?checkout=cancel`,
      metadata: {
        product: "signature-pilot-ai",
        plan: isBusinessPlan ? "business" : "pro"
      }
    });

    return response.status(201).json({
      configured: true,
      url: session.url
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/billing/portal", async (request, response) => {
  try {
    if (!stripe) {
      return response.status(503).json(buildBillingUnavailableResponse());
    }

    const customerId = String(request.body?.customerId || "").trim();
    if (!customerId) {
      return response.status(400).json({
        configured: true,
        message: "Billing portal needs a customer id."
      });
    }

    const session = await stripe.billingPortal.sessions.create({
      customer: customerId,
      return_url: `${getAppOrigin(request)}/upgrade`
    });

    return response.status(201).json({
      configured: true,
      url: session.url
    });
  } catch (error) {
    return response.status(400).json({ message: error.message });
  }
});

app.post("/api/stripe/webhook", express.raw({ type: "application/json" }), (_request, response) => {
  response.status(503).json({
    ...buildBillingUnavailableResponse(),
    message: "Stripe webhook handling is not configured yet."
  });
});

app.use(express.static(distPath));

app.get("*", (request, response, next) => {
  if (request.path.startsWith("/api")) {
    return next();
  }

  return response.sendFile(path.join(distPath, "index.html"));
});

export default app;

if (isDirectExecution()) {
  app.listen(port, () => {
    console.log(`Signature Pilot AI running on port ${port}`);
  });
}

function getAppOrigin(request) {
  const originHeader = request.headers.origin;
  if (originHeader) {
    return originHeader;
  }

  return `${request.protocol}://${request.get("host")}`;
}

function buildBillingUnavailableResponse() {
  return buildBillingUnavailableResponseForPlan("pro");
}

function buildBillingUnavailableResponseForPlan(plan) {
  const normalizedPlan = plan === "business" ? "business" : "pro";
  const missingStripeKeys = !stripe || !proMonthlyPriceId;
  const businessSelfServeLive = Boolean(stripe && businessMonthlyPriceId);

  return {
    configured: false,
    message:
      normalizedPlan === "business"
        ? "Business self-serve billing is not configured yet. Use Pro checkout today or contact us for team rollout planning."
        : "Pro checkout is not configured yet. Add Stripe keys to enable upgrades.",
    plan: normalizedPlan,
    missingStripeKeys,
    businessSelfServeLive
  };
}

function isDirectExecution() {
  return process.argv[1] === fileURLToPath(import.meta.url);
}
