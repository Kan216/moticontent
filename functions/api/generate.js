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

const ALLOWED_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.5-pro',
  'gemini-1.5-flash',
  'gemini-1.5-pro'
];

function buildPrompt(extraNote) {
  const base = `
သင်ဟာ ဘဝမှာ ဆင်းရဲဒုက္ခ၊ လောကဓံအမျိုးမျိုးကို စိတ်ရှည်သည်းခံကျော်ဖြတ်ခဲ့ပြီး၊ အသက်အရွယ်ကြီးရင့်ကာ အတွေ့အကြုံ ရင့်ကျက်လှတဲ့ ပညာရှိ အဖိုးတစ်ဦး (သို့မဟုတ်) အသက်ကြီးဝါကြီးသူတစ်ဦးပါ။
သင့်ရှေ့မှာ ထိုင်နေတဲ့ ဘဝမှာ စိတ်ဓာတ်ကျပြီး လမ်းပျောက်နေတဲ့ လူငယ်တစ်ဦးကို နွေးထွေးစွာ သွန်သင်ဆုံးမနေတဲ့ ပုံစံမျိုးနဲ့ အောက်ပါအကြောင်းအရာများ ပါဝင်သည့် Motivational စာသား ၁၀ ခု ရေးပေးပါ။

စာသားများ၏ လေသံ (Tone):
- စကားပြောပုံစံသည် သွန်သင်ဆုံးမမှုဆန်သော်လည်း အမိန့်ပေးခြင်းမျိုး မဟုတ်ဘဲ နွေးထွေးသော၊ ရိုးရှင်းသော အဖိုးတန်အကြံပေးချက် ဖြစ်ပါစေ။
- စာရေးသူသည် ဘဝအတွေ့အကြုံအလွန်များသူဖြစ်ကြောင်း စာသားထဲတွင် သွယ်ဝိုက်သိသာပါစေ။
- လူငယ်ကို ရင်းရင်းနှီးနှီး "မင်း"၊ "ငါ့တူ" စသဖြင့် သုံးနှုန်းပြီး နားဝင်အောင် ပြောပေးပါ။

စည်းမျဉ်းများ:
- အားလုံးကို မြန်မာစာသက်သက်ဖြင့်သာ ရေးပါ (အင်္ဂလိပ်စာလုံး လုံးဝမပါရ)။
- ဇာတ်လမ်းပြောသလို (narrative) ပုံစံနဲ့ ရေးပါ၊ list သို့မဟုတ် ဆောင်ပုဒ်ပုံစံ မဟုတ်ပါစေနဲ့။
- စာသားတိုင်းက ဆင်းရဲပင်ပန်းသော်လည်း မတုန်လှုပ်ဘဲ တည်ငြိမ်စွာ ရပ်တည်တဲ့ (poor life but stand still) စိတ်ဓာတ်ကို အဓိကဖော်ဆောင်ပါစေ။
- စာသားများတွင် ပုံသေဖြစ်နေသော အားပေးစကား Clichés များ (ဥပမာ "မလျှော့ပါနဲ့" "ဆက်ကြိုးစားပါ" "အောင်မြင်ရမယ်" စသည်) ကို တတ်နိုင်သမျှ ရှောင်ကြဉ်ပြီး၊ ဘဝ၏အမှန်တရားကို တည်ငြိမ်စွာ လက်ခံရင်း ဆက်လက်လျှောက်လှမ်းပုံကို ပုံဖော်ပါ။
- headline တစ်ကြောင်းက ၃ ကနေ ၈ လုံးအထိ တိုတို ရှင်းရှင်း ခံစားစရာကောင်းအောင် ရေးပါ။
- body က ၂ ကနေ ၄ ကြောင်းလောက် ပဲ ရှည်ပါစေ၊ ရေရှည် ဟောပြောချက်လို မဖြစ်ဘဲ၊ တိုတိုနဲ့ နှလုံးထဲစိမ့်ဝင်တဲ့ပုံစံ ဖြစ်ပါစေ။
- ၁၀ ခုစလုံးက အကြောင်းအရာ၊ ခံစားချက် တစ်ခုနဲ့တစ်ခု လုံးဝမထပ်ပါစေနဲ့။ (ဥပမာ - တစ်ခုသည် စိတ်ရှည်ခြင်းအကြောင်းဖြစ်ပါက၊ အခြားတစ်ခုသည် ဝေဖန်ခံရမှုကို တုံ့ပြန်ပုံ၊ အခြားတစ်ခုသည် ဖြည်းဖြည်းချင်းတိုးတက်ခြင်း၊ သစ္စာရှိခြင်း စသည်ဖြင့် ခွဲခြားရေးပါ)။
`.trim();

  const noteBlock = extraNote
    ? `\n\nထပ်ဆောင်းလိုအပ်ချက် - အောက်ပါ ဦးတည်ချက်ကို ထည့်သွင်းစဉ်းစားပါ: "${extraNote}"`
    : '';

  return base + noteBlock;
}

// Lightweight server-side validator for content quality
function validateAndFilterContent(items) {
  if (!Array.isArray(items) || items.length !== 10) {
    throw new Error('Motivational စာသား ၁၀ ခု တိတိ မရရှိပါ။');
  }

  const burmeseRegex = /[\u1000-\u109F]/;
  const englishRegex = /[a-zA-Z]/;

  for (let i = 0; i < items.length; i++) {
    const item = items[i];
    if (!item.headline || !item.body) {
      throw new Error('ခေါင်းစဉ် သို့မဟုတ် အကြောင်းအရာစာသား မပြည့်စုံပါ။');
    }

    const hl = item.headline.trim();
    const bd = item.body.trim();

    // Must contain Burmese characters
    if (!burmeseRegex.test(hl) || !burmeseRegex.test(bd)) {
      throw new Error('မြန်မာစာလုံးများ ပါဝင်ခြင်းမရှိပါ။');
    }

    // Must not contain English words
    if (englishRegex.test(hl) || englishRegex.test(bd)) {
      throw new Error('အင်္ဂလိပ်စာလုံးများ ပါဝင်နေပါသည်။');
    }

    // Character length check
    if (hl.length < 3 || hl.length > 50) {
      throw new Error('ခေါင်းစဉ် တိုလွန်း သို့မဟုတ် ရှည်လွန်းနေသည်။');
    }
    if (bd.length < 20 || bd.length > 400) {
      throw new Error('ကိုယ်ထည်စာသား တိုလွန်း သို့မဟုတ် ရှည်လွန်းနေသည်။');
    }
  }
}

// Helper function to fetch with exponential backoff retries for transient errors (5xx/429)
async function fetchWithRetry(url, options, maxRetries = 3, initialDelay = 500) {
  let delay = initialDelay;
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      const res = await fetch(url, options);
      if ((res.status >= 500 || res.status === 429) && attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      return res;
    } catch (err) {
      if (attempt < maxRetries) {
        await new Promise(resolve => setTimeout(resolve, delay));
        delay *= 2;
        continue;
      }
      throw err;
    }
  }
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

  // 1. IP-based Rate Limiting (5 requests per minute)
  const ip = request.headers.get('CF-Connecting-IP') || '127.0.0.1';
  const nowMinutes = Math.floor(Date.now() / 60000);
  const rateLimitKey = `rate_limit:${ip}:${nowMinutes}`;

  let rateLimitCount = 0;
  if (env.KV_STORE) {
    const currentCount = await env.KV_STORE.get(rateLimitKey);
    if (currentCount) {
      rateLimitCount = parseInt(currentCount, 10);
    }
  }

  if (rateLimitCount >= 5) {
    return new Response(
      JSON.stringify({ error: 'ခေတ္တစောင့်ဆိုင်းပေးပါ။ တစ်မိနစ်လျှင် ၅ ကြိမ်ထက်ပို၍ မလုပ်ဆောင်နိုင်ပါ။' }),
      {
        status: 429,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }

  if (env.KV_STORE) {
    await env.KV_STORE.put(rateLimitKey, String(rateLimitCount + 1), { expirationTtl: 60 });
  }

  try {
    // 2. Parse request parameters
    const requestBody = await request.json();
    let { model, extraNote } = requestBody;

    // Validate and sanitize model
    if (!model || !ALLOWED_MODELS.includes(model)) {
      model = 'gemini-2.5-flash';
    }

    extraNote = typeof extraNote === 'string' ? extraNote.substring(0, 200).trim() : '';

    // 3. API Key lookup (Priority: Env variable > Cookie session)
    let apiKey = env.GEMINI_API_KEY;
    const sessionId = cookies['session_id'];
    if (!apiKey && sessionId && env.KV_STORE) {
      apiKey = await env.KV_STORE.get(`session:${sessionId}`);
    }

    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'API key မရှိပါ။ Setup တွင် API key အရင်ထည့်ပေးပါ။' }),
        {
          status: 401,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 4. Call Gemini API and Validate Content (with up to 2 Generation Attempts on validation failure)
    const geminiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent?key=${encodeURIComponent(apiKey)}`;
    let parsedItems = null;
    let lastError = null;

    for (let attempt = 1; attempt <= 2; attempt++) {
      try {
        const geminiBody = {
          contents: [{ parts: [{ text: buildPrompt(extraNote) }] }],
          generationConfig: {
            temperature: 0.95, // Tuned for optimal semantic consistency and structural format safety
            responseMimeType: 'application/json',
            responseSchema: {
              type: 'ARRAY',
              minItems: 10,
              maxItems: 10,
              items: {
                type: 'OBJECT',
                properties: {
                  headline: { type: 'STRING' },
                  body: { type: 'STRING' },
                },
                required: ['headline', 'body'],
              },
            },
          },
        };

        const res = await fetchWithRetry(geminiUrl, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(geminiBody),
        });

        if (!res.ok) {
          let detail = '';
          try {
            const errJson = await res.json();
            detail = errJson?.error?.message || '';
          } catch (_) {}
          
          console.error("RAW GEMINI API ERROR:", res.status, detail);
          
          let burmeseError = 'Gemini API သို့ ချိတ်ဆက်ရာတွင် အမှားတစ်ခု ဖြစ်ပေါ်ခဲ့ပါသည်။';
          if (res.status === 429) {
            burmeseError = 'Gemini API ကန့်သတ်ချက် ပြည့်သွားပါပြီ။ ခေတ္တစောင့်ပြီးမှ ပြန်ကြိုးစားပါ။';
          } else if (res.status === 400 && detail.includes('API key')) {
            burmeseError = 'ထည့်သွင်းထားသော API key မမှန်ကန်ပါ။ Setup တွင် ပြန်လည်စစ်ဆေးပေးပါ။';
          } else if (detail) {
            burmeseError = `အမှားဖော်ပြချက် - ${detail}`;
          }
          throw new Error(burmeseError);
        }

        const data = await res.json();

        // Check content safety finishReason
        const candidate = data?.candidates?.[0];
        const finishReason = candidate?.finishReason;
        if (finishReason && finishReason !== 'STOP') {
          let blockReason = 'စာသားထုတ်လုပ်မှု မအောင်မြင်ပါ။';
          if (finishReason === 'SAFETY') {
            blockReason = 'အကြောင်းအရာ လုံခြုံရေးဆိုင်ရာ ကန့်သတ်ချက်ကြောင့် စာသားထုတ်၍ မရပါ။ ကျေးဇူးပြု၍ အခြားအကြောင်းအရာတစ်ခုဖြင့် ပြန်လည်ကြိုးစားပါ။';
          } else if (finishReason === 'RECITATION') {
            blockReason = 'မူပိုင်ခွင့် ကန့်သတ်ချက်ကြောင့် စာသားထုတ်၍ မရပါ။';
          } else {
            blockReason = `AI မှ စာသားထုတ်လုပ်မှု ရပ်တန့်ခဲ့သည် (အကြောင်းရင်း - ${finishReason})`;
          }
          throw new Error(blockReason);
        }

        const text = candidate?.content?.parts?.[0]?.text;
        if (!text) {
          throw new Error('အချက်အလက် အလွတ်ဖြစ်နေပါသည်။ ပြန်လည်ကြိုးစားပေးပါ။');
        }

        let parsed = JSON.parse(text);

        // Run validation check (e.g. English leakage, lengths)
        validateAndFilterContent(parsed);

                parsedItems = parsed;
        lastError = null;
        console.log(JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "GENERATE_SUCCESS",
          model: model,
          ip: ip,
          attempts: attempt,
          hasExtraNote: !!extraNote
        }));
        break; // Successfully generated and validated!
      } catch (err) {
        lastError = err;
        console.warn(JSON.stringify({
          timestamp: new Date().toISOString(),
          event: "GENERATE_ATTEMPT_FAILED",
          attempt: attempt,
          error: err.message,
          model: model,
          ip: ip
        }));
      }
    }

    if (lastError) {
      console.error(JSON.stringify({
        timestamp: new Date().toISOString(),
        event: "GENERATE_FAILURE",
        error: lastError.message,
        model: model,
        ip: ip,
        hasExtraNote: !!extraNote
      }));
      return new Response(
        JSON.stringify({ error: `အရည်အသွေးစစ်ဆေးမှု မအောင်မြင်ပါ။ ${lastError.message}` }),
        {
          status: 500,
          headers: { 'Content-Type': 'application/json' },
        }
      );
    }

    // 5. Assign unique IDs to the generated cards
    const itemsWithIds = parsedItems.map(item => ({
      id: crypto.randomUUID(),
      headline: item.headline || '',
      body: item.body || ''
    }));

    // 6. Save batch to user's history in KV
    if (env.KV_STORE) {
      const historyKey = `history:${userId}`;
      let history = [];
      const storedHistory = await env.KV_STORE.get(historyKey);
      if (storedHistory) {
        try {
          history = JSON.parse(storedHistory);
        } catch (_) {}
      }

      const newBatch = {
        id: crypto.randomUUID(),
        timestamp: Date.now(),
        model: model,
        extraNote: extraNote,
        items: itemsWithIds
      };

      history.unshift(newBatch);
      history = history.slice(0, 10); // Keep last 10 batches

      await env.KV_STORE.put(historyKey, JSON.stringify(history));
    }

    // 7. Construct Response with User ID Cookie if new
    const responseHeaders = new Headers({ 'Content-Type': 'application/json' });
    if (isNewUser) {
      responseHeaders.append(
        'Set-Cookie',
        `user_id=${userId}; Path=/; HttpOnly; Secure; SameSite=Strict; Max-Age=${365 * 24 * 60 * 60}`
      );
    }

    return new Response(
      JSON.stringify(itemsWithIds),
      {
        headers: responseHeaders,
      }
    );

  } catch (err) {
    let detailMsg = err.message;
    if (detailMsg.includes('fetch')) {
      detailMsg = 'ကွန်ရက်ချိတ်ဆက်မှု အဆင်မပြေဖြစ်နေပါသည်။';
    }
    return new Response(
      JSON.stringify({ error: 'ဆာဗာပိုင်းဆိုင်ရာ အမှားတစ်ခု ဖြစ်ပွားခဲ့ပါသည်။ ' + detailMsg }),
      {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      }
    );
  }
}
