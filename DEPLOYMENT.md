# SignatureForge AI Deployment

## Deploy to Vercel

1. Push this repository to GitHub, GitLab, or Bitbucket.
2. In Vercel, import the repository as a new project.
3. Keep the default install command: `npm install`
4. Keep the default build command: `npm run build`
5. Set the output directory to `dist` if Vercel does not detect it automatically.
6. Deploy.

`vercel.json` already rewrites `/api/*` to the Vercel function entry and routes all other paths to the SPA entry.

## Required env vars

The app can deploy without paid integrations configured.

Optional variables:
- `OPENAI_API_KEY`
- `OPENAI_SIGNATURE_MODEL`
- `STRIPE_SECRET_KEY`
- `STRIPE_PRICE_ID`
- `STRIPE_MONTHLY_PRICE_ID`

Local-only variable:
- `PORT`

Use `.env.example` as the starting template.

## Run locally

1. Install dependencies: `npm install`
2. Copy `.env.example` to `.env` if you want to add optional keys.
3. Start both servers: `npm run dev`

You can also run the pieces separately:
- `npm run dev:server`
- `npm run dev:client`

## Run smoke tests

1. Make sure dependencies are installed.
2. Run `npm run test:smoke`

The Playwright config boots the local API and Vite dev server automatically on isolated test ports.

## Production notes

- Frontend API calls use relative `/api/*` paths, so there are no hardcoded localhost URLs in production.
- The app is safe to run without OpenAI or Stripe configured.
- OpenAI requests fall back to deterministic built-in suggestions.
- Stripe upgrade and portal routes return safe JSON fallback messages instead of crashing.
- The client-side router is configured for SPA rewrites through `vercel.json`.

## Stripe optional setup

To enable billing:
- set `STRIPE_SECRET_KEY`
- set `STRIPE_PRICE_ID` or `STRIPE_MONTHLY_PRICE_ID`

Without those values:
- upgrade buttons stay safe
- billing routes return a production-safe “Billing not configured yet” message

## OpenAI optional setup

To enable AI-generated suggestions:
- set `OPENAI_API_KEY`
- optionally set `OPENAI_SIGNATURE_MODEL`

Without those values:
- the AI panel still works
- the backend returns built-in fallback suggestions with a clear message that OpenAI is not configured
