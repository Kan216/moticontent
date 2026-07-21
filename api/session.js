import { createClient } from '@vercel/kv';
import crypto from 'crypto';

const kv = createClient({
  url: process.env.KV_REST_API_URL || process.env.UPSTASH_REDIS_REST_URL,
  token: process.env.KV_REST_API_TOKEN || process.env.UPSTASH_REDIS_REST_TOKEN,
});

function parseCookies(cookieHeader) {
  const list = {};
  if (!cookieHeader) return list;
  cookieHeader.split(';').forEach(cookie => {
    const parts = cookie.split('=');
    const key = parts.shift().trim();
    if (key) {
      list[key] = decodeURIComponent(parts.join('='));
    }
  });
  return list;
}

export default async function handler(req, res) {
  const { method } = req;
  const cookies = parseCookies(req.headers.cookie);

  if (method === 'GET') {
    const sessionId = cookies['session_id'];
    let hasCustomKey = false;
    
    if (sessionId) {
      try {
        const key = await kv.get(`session:${sessionId}`);
        if (key) {
          hasCustomKey = true;
        }
      } catch (err) {
        console.error('KV get session error:', err);
      }
    }

    const hasSystemKey = !!process.env.GEMINI_API_KEY;

    return res.status(200).json({
      hasKey: hasSystemKey || hasCustomKey,
      isCustom: hasCustomKey && !hasSystemKey,
    });
  }

  if (method === 'POST') {
    const { apiKey, action } = req.body || {};

    if (action === 'clear') {
      const sessionId = cookies['session_id'];
      if (sessionId) {
        try {
          await kv.del(`session:${sessionId}`);
        } catch (err) {
          console.error('KV del session error:', err);
        }
      }

      res.setHeader('Set-Cookie', 'session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0');
      return res.status(200).json({ success: true });
    }

    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 20) {
      return res.status(400).json({ error: 'API key မမှန်ကန်ပါ။ ပြန်လည်စစ်ဆေးပေးပါ။' });
    }

    const sessionId = crypto.randomUUID();
    const TTL_7_DAYS = 7 * 24 * 60 * 60; // in seconds

    try {
      await kv.set(`session:${sessionId}`, apiKey.trim(), {
        ex: TTL_7_DAYS,
      });
    } catch (err) {
      console.error('KV set session error:', err);
      return res.status(500).json({ error: 'Database settings missing on backend.' });
    }

    res.setHeader(
      'Set-Cookie',
      `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_7_DAYS}`
    );
    return res.status(200).json({ success: true });
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
