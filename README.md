# မလျှော့နဲ့ — Motivation Content Generator

A secure, production-ready static web application built on **Cloudflare Pages** and **Cloudflare KV**. It generates 10 short Burmese motivational narratives as color-block typography cards, and supports session history, custom favorites, and high-resolution image downloads.

---

## Features

- **Burmese-First & Cliché-Free:** High-quality motivational cards featuring an elderly, life-seasoned Burmese narrative tone.
- **Serverless API Proxy:** Gemini API keys are completely shielded backend-side, preventing client-side leakage.
- **Persistent User History:** Remembers the last 10 generated batches per user.
- **Save/Favorites:** Users can star cards to save them indefinitely.
- **Anonymous Identification:** Relies on secure `HttpOnly` cookie IDs rather than login forms, preserving privacy.
- **Image Downloads:** Click a card to instantly render and download it as an `800x800` high-resolution square PNG card, optimized for social sharing.
- **Rate Limiting:** Protects backend keys from abuse by capping requests at 5 requests per minute per IP.
- **Transient Retries:** Gracefully retries temporary backend errors with exponential backoff.

---

## File Structure

```
├── functions/
│   └── api/
│       ├── generate.js  # Main generation proxy, retry logic, prompt, and validation
│       ├── session.js   # Session storage for custom user-supplied API keys
│       ├── history.js   # User-specific chronological batch history endpoint
│       └── favorites.js # User-specific starred cards endpoint
├── index.html           # Main UI template (fully Burmese localization)
├── style.css            # Custom CSS styles, responsive layouts, and animations
├── app.js               # Tab controls, API triggers, and Canvas drawing logic
├── wrangler.json        # Cloudflare Wrangler dev setup and namespace binding config
├── package.json         # Scripts and project dependencies
└── .dev.vars.example    # Local environment variables template
```

---

## Local Development

Wrangler simulates the Cloudflare Pages edge runtime and local KV storage on your machine.

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Configure Environment:**
   - Copy `.dev.vars.example` to a new file named `.dev.vars`.
   - Add your Gemini API key:
     ```env
     GEMINI_API_KEY="AIzaSy..."
     ```
   *(Note: Storing keys in `.dev.vars` is optional. If left blank, you can enter custom keys in the "Setup" menu inside the application, which will be securely stored via HttpOnly session cookies).*

3. **Start Local Server:**
   ```bash
   npm run dev
   ```
   Open `http://127.0.0.1:8788` in your browser.

---

## Production Deployment on Cloudflare Pages

This application runs fully serverless. Follow these steps to set up your production deployment:

### 1. Create a Cloudflare KV Namespace
1. Go to your **Cloudflare Dashboard** > **KV** > **Namespaces**.
2. Click **Create a Namespace** and name it (e.g., `motic-kv`).
3. Note down the namespace ID.

### 2. Set Up Cloudflare Pages Project
1. In the Cloudflare Dashboard, go to **Workers & Pages** > **Create application** > **Pages** > **Connect to Git**.
2. Choose your repository.
3. In **Build settings**:
   - **Framework preset**: None
   - **Build command**: *Leave empty* (we serve static files directly)
   - **Build output directory**: `.` (root directory)
4. Click **Save and Deploy**.

### 3. Bind KV and Set Environment Variables
1. Once deployed, open your Pages project settings: **Settings** > **Functions**.
2. Under **KV namespace bindings**, click **Add binding**:
   - **Variable name**: `KV_STORE`
   - **KV namespace**: Select the namespace you created in Step 1.
3. Scroll to **Environment variables** > **Add variable**:
   - **Variable name**: `GEMINI_API_KEY`
   - **Value**: Your production Gemini API key from AI Studio.
4. Redeploy the project for the settings to take effect.

---

## Monitoring and Logs

The proxy backend logs events to standard stdout/stderr in structured JSON format. You can view these logs in real-time in the Cloudflare dashboard under **Pages project** > **Functions** > **Real-time Logs**.

### Log Format Examples
- **Success Event:**
  ```json
  {"timestamp":"2026-07-21T05:02:18.000Z","event":"GENERATE_SUCCESS","model":"gemini-2.5-flash","ip":"192.0.2.1","attempts":1,"hasExtraNote":false}
  ```
- **Attempt Warning:**
  ```json
  {"timestamp":"2026-07-21T05:02:18.000Z","event":"GENERATE_ATTEMPT_FAILED","attempt":1,"error":"အင်္ဂလိပ်စာလုံးများ ပါဝင်နေပါသည်။","model":"gemini-2.5-flash","ip":"192.0.2.1"}
  ```
- **Error Event:**
  ```json
  {"timestamp":"2026-07-21T05:02:18.000Z","event":"GENERATE_FAILURE","error":"အရည်အသွေးစစ်ဆေးမှု မအောင်မြင်ပါ။ မြန်မာစာလုံးများ ပါဝင်ခြင်းမရှိပါ။","model":"gemini-2.5-flash","ip":"192.0.2.1","hasExtraNote":false}
  ```
