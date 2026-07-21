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

export async function onRequestGet(context) {
  const { request, env } = context;
  const cookies = parseCookies(request.headers.get('Cookie'));
  const userId = cookies['user_id'];

  if (!userId || !env.KV_STORE) {
    return new Response(JSON.stringify([]), {
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const favoritesKey = `favorites:${userId}`;
  const storedFavorites = await env.KV_STORE.get(favoritesKey);
  let favorites = [];

  if (storedFavorites) {
    try {
      favorites = JSON.parse(storedFavorites);
    } catch (_) {}
  }

  return new Response(JSON.stringify(favorites), {
    headers: { 'Content-Type': 'application/json' },
  });
}

export async function onRequestPost(context) {
  const { request, env } = context;
  const cookies = parseCookies(request.headers.get('Cookie'));

  let userId = cookies['user_id'];
  let isNewUser = false;
  if (!userId) {
    userId = crypto.randomUUID();
    isNewUser = true;
  }

  if (!env.KV_STORE) {
    return new Response(
      JSON.stringify({ error: 'Database settings missing on backend.' }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  try {
    const body = await request.json();
    const { cardId, action, card } = body;

    if (!cardId) {
      return new Response(
        JSON.stringify({ error: 'Card ID မရှိပါ။' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    const favoritesKey = `favorites:${userId}`;
    let favorites = [];
    const storedFavorites = await env.KV_STORE.get(favoritesKey);
    if (storedFavorites) {
      try {
        favorites = JSON.parse(storedFavorites);
      } catch (_) {}
    }

    if (action === 'add') {
      if (!card || !card.headline || !card.body) {
        return new Response(
          JSON.stringify({ error: 'သိမ်းဆည်းမည့် စာသားအပြည့်အစုံ မရှိပါ။' }),
          {
            status: 400,
            headers: { 'Content-Type': 'application/json' },
          }
        );
      }

      // Check if already favorited
      const exists = favorites.some(fav => fav.id === cardId);
      if (!exists) {
        favorites.unshift({
          id: cardId,
          headline: card.headline,
          body: card.body,
          tone: card.tone || 'paper',
          timestamp: Date.now(),
        });
      }
    } else if (action === 'remove') {
      favorites = favorites.filter(fav => fav.id !== cardId);
    } else {
      return new Response(
        JSON.stringify({ error: 'မမှန်ကန်သော လုပ်ဆောင်ချက် ဖြစ်သည်။' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    await env.KV_STORE.put(favoritesKey, JSON.stringify(favorites));

    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    if (isNewUser) {
      responseHeaders.append(
        'Set-Cookie',
        `user_id=${userId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${365 * 24 * 60 * 60}`
      );
    }

    return new Response(
      JSON.stringify(favorites),
      {
        headers: responseHeaders,
      }
    );

  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။ ' + err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
