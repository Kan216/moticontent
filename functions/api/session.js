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
  const sessionId = cookies['session_id'];

  let hasCustomKey = false;
  if (sessionId && env.KV_STORE) {
    const key = await env.KV_STORE.get(`session:${sessionId}`);
    if (key) {
      hasCustomKey = true;
    }
  }

  const hasSystemKey = !!env.GEMINI_API_KEY;

  return new Response(
    JSON.stringify({
      hasKey: hasSystemKey || hasCustomKey,
      isCustom: hasCustomKey && !hasSystemKey, // system key takes precedence
    }),
    {
      headers: { 'Content-Type': 'application/json' },
    }
  );
}

export async function onRequestPost(context) {
  const { request, env } = context;

  try {
    const body = await request.json();
    const { apiKey, action } = body;

    // Check if the user wants to clear the session
    if (action === 'clear') {
      const cookies = parseCookies(request.headers.get('Cookie'));
      const sessionId = cookies['session_id'];

      if (sessionId && env.KV_STORE) {
        await env.KV_STORE.delete(`session:${sessionId}`);
      }

      return new Response(
        JSON.stringify({ success: true }),
        {
          headers: {
            'Content-Type': 'application/json',
            'Set-Cookie': 'session_id=; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=0',
          },
        }
      );
    }

    // Otherwise, saving the API key
    if (!apiKey || typeof apiKey !== 'string' || apiKey.trim().length < 20) {
      return new Response(
        JSON.stringify({ error: 'API key မမှန်ကန်ပါ။ ပြန်လည်စစ်ဆေးပေးပါ။' }),
        {
          status: 400,
          headers: { 'Content-Type': 'application/json' },
        }
      );
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

    const sessionId = crypto.randomUUID();
    // Save to KV with 7 days TTL (in seconds)
    const TTL_7_DAYS = 7 * 24 * 60 * 60;
    await env.KV_STORE.put(`session:${sessionId}`, apiKey.trim(), {
      expirationTtl: TTL_7_DAYS,
    });

    return new Response(
      JSON.stringify({ success: true }),
      {
        headers: {
          'Content-Type': 'application/json',
          'Set-Cookie': `session_id=${sessionId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${TTL_7_DAYS}`,
        },
      }
    );
  } catch (err) {
    return new Response(
      JSON.stringify({ error: 'တောင်းဆိုချက်ကို မလုပ်ဆောင်နိုင်ပါ။ ' + err.message }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
