import { createClient } from '@vercel/kv';

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

  if (method === 'GET') {
    const cookies = parseCookies(req.headers.cookie);
    const userId = cookies['user_id'];

    if (!userId) {
      return res.status(200).json([]);
    }

    try {
      const historyKey = `history:${userId}`;
      const storedHistory = await kv.get(historyKey);
      let history = [];
      if (storedHistory) {
        history = typeof storedHistory === 'string' ? JSON.parse(storedHistory) : storedHistory;
      }
      return res.status(200).json(history);
    } catch (err) {
      console.error('KV get history error:', err);
      return res.status(500).json({ error: 'Database settings missing on backend.' });
    }
  }

  if (method === 'POST') {
    const { action } = req.body || {};
    if (action !== 'clear') {
      return res.status(400).json({ error: 'Invalid action.' });
    }

    const cookies = parseCookies(req.headers.cookie);
    const userId = cookies['user_id'];

    if (!userId) {
      return res.status(200).json({ success: true });
    }

    try {
      const historyKey = `history:${userId}`;
      await kv.del(historyKey);
      return res.status(200).json({ success: true });
    } catch (err) {
      console.error('KV delete history error:', err);
      return res.status(500).json({ error: 'Database settings missing on backend.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
