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

  const historyKey = `history:${userId}`;
  const storedHistory = await env.KV_STORE.get(historyKey);
  let history = [];

  if (storedHistory) {
    try {
      history = JSON.parse(storedHistory);
    } catch (_) {}
  }

  return new Response(JSON.stringify(history), {
    headers: { 'Content-Type': 'application/json' },
  });
}
