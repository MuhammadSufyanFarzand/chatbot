# DiginixIT Chatbot Package (Grok AI)

This folder contains all files required to integrate the DiginixIT AI Chatbot into your existing website deployment.

---

## Package Contents

| File | Purpose |
|---|---|
| `chatbot.js` | **Frontend Widget**: Standalone drop-in script. Handles floating launcher (bot icon), popup modal, auto-scrolling, markdown formatting, and quick suggestion chips. Zero external dependencies. |
| `knowledge-base.js` | **Full Dataset & System Prompt**: Contains the complete hardcoded knowledge base (Dr. Nadeem Nazir, Web Engineering, UI/UX, Technical SEO, Law & Compliance, Corporate Finance, studio addresses, and contacts). |
| `server-route.js` | **Backend Handler (Express / Node.js)**: Proxies user inquiries securely to the xAI Grok API (`api.x.ai/v1/chat/completions`) using your private `GROK_API_KEY`. |
| `cloudflare-worker.js` | **Cloudflare Worker**: Turnkey serverless function for deployments using Cloudflare Pages / Workers. |
| `demo.html` | **Instant Test Page**: Double-click or open in a browser to test the floating widget and chat modal locally. |
| `.env.example` | **Environment Config**: Shows how to supply `GROK_API_KEY`. |

---

## Quick Setup (2 Steps)

### Step 1: Add to Frontend
In your website's HTML template or pages (before `</body>`), add:

```html
<script src="/chatbot.js" defer></script>
```

*Note: If your API route is hosted on a different URL or port, set it before the script tag:*
```html
<script>
  window.DIGINIX_CHAT_ENDPOINT = '/api/chat'; // default is '/api/chat'
</script>
<script src="/chatbot.js" defer></script>
```

---

### Step 2: Mount the API Route (Backend)

#### Option A: Node.js / Express Server
In your existing server file (e.g. `server.js` or `app.js`):

```javascript
import express from 'express';
import { chatHandler } from './chatbot-package/server-route.js';

const app = express();
app.use(express.json());

// Mount the chat endpoint
app.post('/api/chat', chatHandler);
```

#### Option B: Cloudflare Workers
Deploy `cloudflare-worker.js` and bind the secret:
```bash
npx wrangler secret put GROK_API_KEY
```

---

## Grok API Key Configuration

Add your xAI Grok key to your server `.env` or hosting provider environment variables:

```env
GROK_API_KEY=xai-your_actual_key_here
GROK_MODEL=grok-beta
```

- **Live AI Mode**: If `GROK_API_KEY` is present, inquiries are answered live by xAI Grok using the DiginixIT system prompt.
- **Fail-Safe Offline Mode**: If `GROK_API_KEY` is missing or the network drops, the backend falls back to the built-in verified knowledge base for Dr. Nadeem Nazir and DiginixIT without throwing errors.
