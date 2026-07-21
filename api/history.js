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
  if (req.method !== 'GET') {
    res.setHeader('Allow', ['GET']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

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
