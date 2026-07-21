import { kv } from '@vercel/kv';

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
  let userId = cookies['user_id'];
  let isNewUser = false;

  if (method === 'GET') {
    if (!userId) {
      return res.status(200).json([]);
    }

    try {
      const favoritesKey = `favorites:${userId}`;
      const storedFavs = await kv.get(favoritesKey);
      let favorites = [];
      if (storedFavs) {
        favorites = typeof storedFavs === 'string' ? JSON.parse(storedFavs) : storedFavs;
      }
      return res.status(200).json(favorites);
    } catch (err) {
      console.error('KV get favorites error:', err);
      return res.status(500).json({ error: 'Database settings missing on backend.' });
    }
  }

  if (method === 'POST') {
    if (!userId) {
      userId = crypto.randomUUID();
      isNewUser = true;
    }

    const { card, action } = req.body || {};

    if (!card || !card.id || !action) {
      return res.status(400).json({ error: 'Invalid favorites action payload.' });
    }

    try {
      const favoritesKey = `favorites:${userId}`;
      const storedFavs = await kv.get(favoritesKey);
      let favorites = [];
      if (storedFavs) {
        favorites = typeof storedFavs === 'string' ? JSON.parse(storedFavs) : storedFavs;
      }

      if (action === 'add') {
        const exists = favorites.some(fav => fav.id === card.id);
        if (!exists) {
          favorites.push({
            id: card.id,
            headline: card.headline || '',
            body: card.body || '',
            tone: card.tone || 'clay',
            timestamp: Date.now()
          });
          await kv.set(favoritesKey, favorites);
        }
      } else if (action === 'remove') {
        favorites = favorites.filter(fav => fav.id !== card.id);
        await kv.set(favoritesKey, favorites);
      }

      if (isNewUser) {
        res.setHeader(
          'Set-Cookie',
          `user_id=${userId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${365 * 24 * 60 * 60}`
        );
      }

      return res.status(200).json(favorites);

    } catch (err) {
      console.error('KV write favorites error:', err);
      return res.status(500).json({ error: 'Database settings missing on backend.' });
    }
  }

  res.setHeader('Allow', ['GET', 'POST']);
  return res.status(405).end(`Method ${method} Not Allowed`);
}
