# မလျှော့နဲ့ — Motivation Content Generator

A secure, production-ready static web application built on **Vercel** and **Vercel KV** (Redis). It generates 10 short Burmese motivational narratives as color-block typography cards, and supports session history, custom favorites, and high-resolution image downloads.

---

## Features

- **Burmese-First & Cliché-Free:** High-quality motivational cards featuring an elderly, life-seasoned Burmese narrative tone.
- **Serverless API Proxy:** Gemini API keys are completely shielded backend-side, preventing client-side leakage.
- **Persistent User History:** Remembers the last 10 generated batches per user.
- **Save/Favorites:** Users can star cards to save them indefinitely.
- **Anonymous Identification:** Relies on secure `HttpOnly` cookie IDs rather than login forms, preserving privacy.
- **Image Downloads:** Click a card to instantly render and download it as an `800x800` high-resolution square PNG card (branded as "နှလုံးသားစာမျက်နှာ"), optimized for social sharing.
- **Rate Limiting:** Protects backend keys from abuse by capping requests at 5 requests per minute per IP.
- **Transient Retries:** Gracefully retries temporary backend errors with exponential backoff.

---

## File Structure

```
├── api/
│   ├── generate.js  # Main generation proxy, retry logic, prompt, and validation
│   ├── session.js   # Session storage for custom user-supplied API keys
│   ├── history.js   # User-specific chronological batch history endpoint
│   └── favorites.js # User-specific starred cards endpoint
├── index.html           # Main UI template (fully Burmese localization)
├── style.css            # Custom CSS styles, responsive layouts, and animations
├── app.js               # Tab controls, API triggers, and Canvas drawing logic
├── package.json         # Scripts and project dependencies
└── .gitignore           # Ignores build artifacts and node_modules
```

---

## Local Development

You can run the Vercel runtime locally on your machine using the Vercel CLI.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Login to Vercel (first time only):**
   ```bash
   npx vercel login
   ```

3. **Link and Start Local Dev Server:**
   ```bash
   npm run dev
   ```
   This will start the local server (usually at `http://localhost:3000`).

---

## Production Deployment on Vercel

### 1. Import Repository
1. Log in to your **[Vercel Dashboard](https://vercel.com)**.
2. Click **Add New** > **Project**.
3. Import your GitHub repository: `Kan216/moticontent`.
4. Click **Deploy** (the initial build will succeed, but needs KV connected to fully work).

### 2. Connect Vercel KV (Storage)
1. In your project dashboard on Vercel, click the **Storage** tab at the top.
2. Under **Storage Databases**, click **KV** (Redis) > **Create**.
3. Enter a database name (e.g., `motic-kv`), accept the terms, and click **Create**.
4. Once created, Vercel will automatically link this KV instance to your project and inject all the necessary environment variables (`KV_URL`, `KV_REST_API_TOKEN`, etc.).

### 3. Set Gemini API Key (Optional)
If you want to configure a system-wide shared API key so users do not need to enter their own:
1. Go to your project **Settings** > **Environment Variables**.
2. Add a new variable:
   - **Key**: `GEMINI_API_KEY`
   - **Value**: Your production Google Gemini API key.
3. Click **Save**.

### 4. Redeploy
Go to the **Deployments** tab and click **Redeploy** to apply the database bindings and environment variables. Your application will be live!
