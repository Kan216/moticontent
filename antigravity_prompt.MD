# Continuation prompt — paste this into Antigravity

You're continuing work on **မလျှော့နဲ့ (Motivation Generator)**, a static
web app that calls the Gemini API client-side to generate 10 short
Burmese motivational narratives per click, rendered as color-block +
typography cards (no images, no illustrations).

The current prototype (`index.html`, `style.css`, `app.js`) works but is
browser-only: the user's Gemini API key sits in a plain input field and
is sent straight to Google from the client, nothing is saved, and
there's no deployment setup. Take it from prototype to a production-
ready app. Work through the phases below in order — each should be a
working, deployable state before you move to the next.

## Phase 1 — Security: stop exposing the API key client-side
This is the most important gap. Right now any user's Gemini key is
visible in the browser and sent directly to Google from `fetch()`,
which is fine for a local prototype but not for anything public.
- Add a minimal backend (serverless function — Cloudflare Worker,
  Vercel Edge Function, or similar) that proxies the Gemini call.
- Decide the key model: either (a) the app holds one API key server-
  side as an env var and users don't need their own, or (b) users still
  bring their own key but it's submitted once, stored server-side per
  session (encrypted at rest if persisted at all), and never round-
  trips to the client on every request.
- Add basic rate limiting per user/IP on the proxy endpoint so one
  person can't burn through a shared key.
- Validate and sanitize the `model` field server-side — right now it's
  a free-text input forwarded straight into a URL.

## Phase 2 — Persistence & history
- Store each generated batch (10 items) so users can look back at past
  sessions, not just the latest one.
- Add a "save" or "favorite" action per card, since these are meant to
  be revisited, not just glanced at once.
- Pick a backend for this (Cloudflare KV/D1, Supabase, Firebase — your
  call) and keep it consistent with whatever you chose for the proxy
  in Phase 1.

## Phase 3 — Reliability & UX polish
- Handle Gemini API failures gracefully: timeouts, malformed JSON,
  content-safety blocks, rate-limit errors — each needs a distinct,
  clear message in Burmese, not just the raw error string.
- Add retry-with-backoff for transient failures.
- Add a per-card "share" or "download as image" action (e.g. render the
  card to canvas/PNG) since these are the kind of quote cards people
  screenshot and repost.
- Debounce/guard the generate button so rapid double-clicks don't fire
  duplicate API calls.
- Re-check mobile layout and keyboard focus states now that real
  content lengths (not placeholders) are flowing through the cards.

## Phase 4 — Content quality
- Tune the prompt in `app.js` based on real output review — check for
  repetition across batches, tone drift, and whether the "elder
  narrating to a younger listener" voice holds up at scale.
- Consider a lightweight content filter/review step before rendering,
  in case Gemini ever returns something off-tone.
- Decide if `temperature` and the palette-cycling logic need tuning
  once you're looking at dozens of real batches instead of a handful.

## Phase 5 — Deploy
- Ship to a static/edge host (Cloudflare Pages, Vercel, Netlify — pick
  based on where Phase 1's backend lives, so frontend and function
  deploy together).
- Add environment-based config so local dev, staging, and production
  don't share the same API key or database.
- Basic monitoring: log proxy errors and Gemini failure rates somewhere
  you'll actually see them.

## Constraints to keep in mind throughout
- Keep the design language: color-block + typography only, no complex
  graphics or illustrations — that's a deliberate brief, not a
  prototype shortcut.
- Keep everything Burmese-first; don't let English creep into user-
  facing copy, error states included.
- Don't reintroduce localStorage for anything sensitive (API keys) —
  route that through the backend from Phase 1 onward.

Work phase by phase, and check in after each one before moving to the
next rather than doing all five in one pass.