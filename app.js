// ============================================================================
// Motivation Generator — Production version (Phase 3)
// ============================================================================

const els = {
  settingsToggle: document.getElementById('settingsToggle'),
  settingsPanel: document.getElementById('settingsPanel'),
  apiKey: document.getElementById('apiKey'),
  modelName: document.getElementById('modelName'),
  themeNote: document.getElementById('themeNote'),
  generateBtn: document.getElementById('generateBtn'),
  statusLine: document.getElementById('statusLine'),
  grid: document.getElementById('grid'),
  emptyState: document.getElementById('emptyState'),
  cardTemplate: document.getElementById('cardTemplate'),
  clearKeyBtn: document.getElementById('clearKeyBtn'),

  // Tabs
  tabGenerate: document.getElementById('tabGenerate'),
  tabHistory: document.getElementById('tabHistory'),
  tabFavorites: document.getElementById('tabFavorites'),

  // Views
  viewGenerate: document.getElementById('viewGenerate'),
  viewHistory: document.getElementById('viewHistory'),
  viewFavorites: document.getElementById('viewFavorites'),

  // View Containers & Empty States
  historyContainer: document.getElementById('historyContainer'),
  historyEmptyState: document.getElementById('historyEmptyState'),
  favoritesGrid: document.getElementById('favoritesGrid'),
  favoritesEmptyState: document.getElementById('favoritesEmptyState'),
};

const TONES = ['clay', 'ochre', 'teal', 'rust', 'ink', 'paper'];

// Canvas Color Mapping for Downloads
const COLOR_MAP = {
  clay: { bg: '#A63D2F', text: '#F1E8D8', seal: 'rgba(241, 232, 216, 0.45)' },
  ochre: { bg: '#C08A28', text: '#1E1B16', seal: 'rgba(30, 27, 22, 0.45)' },
  teal: { bg: '#1F4B43', text: '#F1E8D8', seal: 'rgba(241, 232, 216, 0.45)' },
  rust: { bg: '#8C5A3C', text: '#F1E8D8', seal: 'rgba(241, 232, 216, 0.45)' },
  ink: { bg: '#1E1B16', text: '#F1E8D8', seal: 'rgba(241, 232, 216, 0.45)' },
  paper: { bg: '#E4D8C0', text: '#1E1B16', seal: 'rgba(30, 27, 22, 0.45)' },
};

let sessionState = {
  hasKey: false,
  isCustom: false,
};

let favoritesList = [];
let isGenerating = false;

// ----------------------------------------------------------------------------
// Settings panel toggle
// ----------------------------------------------------------------------------
els.settingsToggle.addEventListener('click', () => {
  const isOpen = !els.settingsPanel.hidden;
  els.settingsPanel.hidden = isOpen;
  els.settingsToggle.setAttribute('aria-expanded', String(!isOpen));
});

// ----------------------------------------------------------------------------
// Tabs Navigation
// ----------------------------------------------------------------------------
const tabs = [els.tabGenerate, els.tabHistory, els.tabFavorites];
const views = [els.viewGenerate, els.viewHistory, els.viewFavorites];

function switchTab(activeTab, targetView) {
  tabs.forEach(tab => {
    tab.classList.toggle('is-active', tab === activeTab);
    tab.setAttribute('aria-selected', tab === activeTab ? 'true' : 'false');
  });

  views.forEach(view => {
    view.classList.toggle('is-hidden', view !== targetView);
  });
}

els.tabGenerate.addEventListener('click', () => {
  switchTab(els.tabGenerate, els.viewGenerate);
});

els.tabHistory.addEventListener('click', async () => {
  switchTab(els.tabHistory, els.viewHistory);
  await loadHistory();
});

els.tabFavorites.addEventListener('click', async () => {
  switchTab(els.tabFavorites, els.viewFavorites);
  await loadFavorites();
});

// ----------------------------------------------------------------------------
// Session & Favorites Init
// ----------------------------------------------------------------------------
async function checkSession() {
  try {
    const res = await fetch('/api/session');
    if (res.ok) {
      sessionState = await res.json();
      updateSessionUI();
    }
  } catch (err) {
    console.error('Error fetching session status:', err);
  }
}

function updateSessionUI() {
  if (sessionState.hasKey) {
    if (sessionState.isCustom) {
      els.apiKey.disabled = false;
      els.apiKey.value = '';
      els.apiKey.placeholder = '••••••••••••••••';
      if (els.clearKeyBtn) els.clearKeyBtn.style.display = 'inline-block';
    } else {
      els.apiKey.disabled = true;
      els.apiKey.value = '';
      els.apiKey.placeholder = 'စနစ်သုံး API Key သတ်မှတ်ထားပြီးဖြစ်သည် (ထည့်ရန်မလိုပါ)';
      if (els.clearKeyBtn) els.clearKeyBtn.style.display = 'none';
    }
  } else {
    els.apiKey.disabled = false;
    els.apiKey.placeholder = 'AIza...';
    if (els.clearKeyBtn) els.clearKeyBtn.style.display = 'none';
  }
}

if (els.clearKeyBtn) {
  els.clearKeyBtn.addEventListener('click', async () => {
    try {
      setStatus('API Key ကို ဖျက်နေပါတယ်...');
      const res = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'clear' }),
      });
      if (res.ok) {
        els.apiKey.value = '';
        await checkSession();
        setStatus('API Key ကို ဖျက်ပြီးပါပြီ။', 'success');
      } else {
        const errJson = await res.json();
        setStatus(errJson.error || 'အမှားတစ်ခု ဖြစ်ပွားခဲ့သည်။', 'error');
      }
    } catch (err) {
      setStatus('ချိတ်ဆက်မှု အမှားဖြစ်ပေါ်ခဲ့သည်။', 'error');
    }
  });
}

async function initFavorites() {
  try {
    const res = await fetch('/api/favorites');
    if (res.ok) {
      favoritesList = await res.json();
    }
  } catch (err) {
    console.error('Error loading favorites:', err);
  }
}

// ----------------------------------------------------------------------------
// Fetch & Load Data Functions
// ----------------------------------------------------------------------------
async function loadHistory() {
  try {
    els.historyContainer.innerHTML = 'ကူးယူထားသော ရာဇဝင်များကို ဖွင့်နေပါသည်...';
    const res = await fetch('/api/history');
    if (!res.ok) throw new Error('History load failed');
    const history = await res.json();

    els.historyContainer.innerHTML = '';
    const hasHistory = history && history.length > 0;
    els.historyEmptyState.classList.toggle('is-hidden', hasHistory);

    if (hasHistory) {
      history.forEach(batch => {
        const batchEl = document.createElement('section');
        batchEl.className = 'history-batch';

        const headerEl = document.createElement('div');
        headerEl.className = 'history-batch__header';

        const titleEl = document.createElement('h3');
        titleEl.className = 'history-batch__title';
        titleEl.textContent = batch.extraNote ? `ဦးတည်ချက် - "${batch.extraNote}"` : 'အထွေထွေ အားပေးစကားလုံးများ';

        const metaEl = document.createElement('span');
        metaEl.className = 'history-batch__meta';
        metaEl.textContent = formatTimestamp(batch.timestamp);

        headerEl.appendChild(titleEl);
        headerEl.appendChild(metaEl);
        batchEl.appendChild(headerEl);

        const gridEl = document.createElement('div');
        gridEl.className = 'grid';

        renderItems(batch.items, gridEl);
        batchEl.appendChild(gridEl);

        els.historyContainer.appendChild(batchEl);
      });
    }
  } catch (err) {
    els.historyContainer.innerHTML = `<p style="color: var(--clay);">ရာဇဝင်များအား ဖော်ပြ၍မရပါ။ (${err.message})</p>`;
  }
}

async function loadFavorites() {
  await initFavorites();
  const hasFavs = favoritesList && favoritesList.length > 0;
  els.favoritesEmptyState.classList.toggle('is-hidden', hasFavs);
  if (hasFavs) {
    renderItems(favoritesList, els.favoritesGrid, true);
  } else {
    els.favoritesGrid.innerHTML = '';
  }
}

function formatTimestamp(ts) {
  const d = new Date(ts);
  return `${String(d.getDate()).padStart(2, '0')}-${String(d.getMonth() + 1).padStart(2, '0')}-${d.getFullYear()} ${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
}

// ----------------------------------------------------------------------------
// Backend API Generate Call
// ----------------------------------------------------------------------------
async function generateContents(model, extraNote) {
  const res = await fetch('/api/generate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ model, extraNote }),
  });

  if (!res.ok) {
    let detail = '';
    try {
      const errJson = await res.json();
      detail = errJson?.error || '';
    } catch (_) {}
    throw new Error(detail || `Error (${res.status})`);
  }

  return await res.json();
}

// ----------------------------------------------------------------------------
// Share/Download Canvas Image Helper
// ----------------------------------------------------------------------------
function wrapCanvasText(ctx, text, maxWidth) {
  const chars = Array.from(text);
  const lines = [];
  let currentLine = '';

  for (let i = 0; i < chars.length; i++) {
    const char = chars[i];
    const testLine = currentLine + char;
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && i > 0) {
      lines.push(currentLine);
      currentLine = char;
    } else {
      currentLine = testLine;
    }
  }
  if (currentLine) {
    lines.push(currentLine);
  }
  return lines;
}

function downloadCardAsImage(item, tone) {
  const colors = COLOR_MAP[tone] || COLOR_MAP.paper;

  // Create high-res 800x800 square canvas
  const canvas = document.createElement('canvas');
  canvas.width = 800;
  canvas.height = 800;
  const ctx = canvas.getContext('2d');

  // Fill Background
  ctx.fillStyle = colors.bg;
  ctx.fillRect(0, 0, 800, 800);

  // Elegant Inner Border
  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2;
  ctx.strokeRect(40, 40, 720, 720);

  // Draw Top Seal (Circular "မ" Seal, Rotated)
  ctx.save();
  ctx.translate(400, 130);
  ctx.rotate(-6 * Math.PI / 180);

  ctx.strokeStyle = colors.text;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, 0, 28, 0, Math.PI * 2);
  ctx.stroke();

  ctx.fillStyle = colors.text;
  ctx.font = "bold 26px 'Noto Serif Myanmar', serif";
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('မ', 0, 0);
  ctx.restore();

  // Draw Headline Text (Noto Serif Myanmar)
  ctx.font = "bold 34px 'Noto Serif Myanmar', serif";
  ctx.fillStyle = colors.text;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'top';

  const headlineLines = wrapCanvasText(ctx, item.headline, 620);
  let currentY = 240;
  headlineLines.forEach(line => {
    ctx.fillText(line, 400, currentY);
    currentY += 50;
  });

  // Draw Body Text (Noto Sans Myanmar)
  ctx.font = "500 22px 'Noto Sans Myanmar', sans-serif";
  const bodyLines = wrapCanvasText(ctx, item.body, 580);
  currentY += 45; // gap between headline and body

  bodyLines.forEach(line => {
    ctx.fillText(line, 400, currentY);
    currentY += 40;
  });

  // Draw Logo Watermark at bottom
  ctx.font = "normal 14px 'Noto Sans Myanmar', sans-serif";
  ctx.fillStyle = colors.seal;
  ctx.textAlign = 'center';
  ctx.fillText('နှလုံးသားစာမျက်နှာ', 400, 715);

  // Trigger browser download
  try {
    const dataUrl = canvas.toDataURL('image/png');
    const link = document.createElement('a');
    link.download = `motic-${item.id.substring(0, 8)}.png`;
    link.href = dataUrl;
    link.click();
  } catch (err) {
    console.error('Failed to export canvas to PNG:', err);
  }
}

// ----------------------------------------------------------------------------
// Rendering
// ----------------------------------------------------------------------------
function pickTones(count) {
  const tones = [];
  let last = null;
  for (let i = 0; i < count; i++) {
    const pool = TONES.filter((t) => t !== last);
    const next = pool[Math.floor(Math.random() * pool.length)];
    tones.push(next);
    last = next;
  }
  return tones;
}

function renderItems(items, containerEl, isFavoritesView = false) {
  containerEl.innerHTML = '';
  const tones = pickTones(items.length);

  items.forEach((item, i) => {
    const node = els.cardTemplate.content.cloneNode(true);
    const card = node.querySelector('.card');
    card.dataset.tone = item.tone || tones[i];
    card.querySelector('.card__seal').dataset.n = String(i + 1).padStart(2, '0');
    card.querySelector('.card__headline').textContent = item.headline || '';
    card.querySelector('.card__body').textContent = item.body || '';

    // Favorites Toggle binding
    const favBtn = card.querySelector('.card__fav-btn');
    const isFav = favoritesList.some(fav => fav.id === item.id);
    if (isFav) {
      favBtn.classList.add('is-favorited');
    }

    favBtn.addEventListener('click', async (e) => {
      e.stopPropagation();
      const currentFav = favBtn.classList.contains('is-favorited');
      const action = currentFav ? 'remove' : 'add';

      if (action === 'add') {
        favBtn.classList.add('is-favorited');
      } else {
        favBtn.classList.remove('is-favorited');
      }

      try {
        const res = await fetch('/api/favorites', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            cardId: item.id,
            action,
            card: {
              headline: item.headline,
              body: item.body,
              tone: card.dataset.tone
            }
          })
        });

        if (res.ok) {
          favoritesList = await res.json();
          if (isFavoritesView && action === 'remove') {
            card.remove();
            if (favoritesList.length === 0) {
              els.favoritesEmptyState.classList.remove('is-hidden');
            }
          }
        } else {
          if (action === 'add') favBtn.classList.remove('is-favorited');
          else favBtn.classList.add('is-favorited');
        }
      } catch (err) {
        console.error(err);
        if (action === 'add') favBtn.classList.remove('is-favorited');
        else favBtn.classList.add('is-favorited');
      }
    });

    // Download binding
    const dlBtn = card.querySelector('.card__dl-btn');
    dlBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      downloadCardAsImage(item, card.dataset.tone);
    });

    containerEl.appendChild(node);
  });
}

// ----------------------------------------------------------------------------
// Status helper
// ----------------------------------------------------------------------------
function setStatus(message, tone) {
  els.statusLine.textContent = message || '';
  if (tone) {
    els.statusLine.dataset.tone = tone;
  } else {
    delete els.statusLine.dataset.tone;
  }
}

// ----------------------------------------------------------------------------
// Generate button
// ----------------------------------------------------------------------------
els.generateBtn.addEventListener('click', async () => {
  if (isGenerating) return; // Debounce double clicks

  const enteredKey = els.apiKey.value.trim();
  const model = els.modelName.value.trim() || 'gemini-2.5-flash';
  const extraNote = els.themeNote.value.trim();

  if (!sessionState.hasKey && !enteredKey) {
    setStatus('API key ထည့်ပေးပါဦး — ပြင်ဆင်ရန် ခလုတ်ကိုနှိပ်ပါ။', 'error');
    els.settingsPanel.hidden = false;
    els.settingsToggle.setAttribute('aria-expanded', 'true');
    els.apiKey.focus();
    return;
  }

  isGenerating = true;
  els.generateBtn.disabled = true;
  els.generateBtn.classList.add('is-loading');
  setStatus('စာသား ၁၀ ခု ထုတ်နေပါတယ်...');

  try {
    if (enteredKey) {
      setStatus('API Key ကို လုံခြုံစွာ သိမ်းဆည်းနေပါသည်...');
      const sessionRes = await fetch('/api/session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ apiKey: enteredKey }),
      });

      if (!sessionRes.ok) {
        const errJson = await sessionRes.json();
        throw new Error(errJson.error || 'API Key သိမ်းဆည်းမှု မအောင်မြင်ပါ။');
      }

      await checkSession();
    }

    setStatus('စာသား ၁၀ ခု ထုတ်နေပါတယ်...');
    const items = await generateContents(model, extraNote);
    
    await initFavorites();
    renderItems(items, els.grid);
    els.emptyState.classList.add('is-hidden');
    setStatus(`ပြီးပါပြီ — ${items.length} ခု ထွက်လာပါပြီ။`);
  } catch (err) {
    console.error(err);
    setStatus(err.message || 'တစ်ခုခု မှားသွားပါတယ်။', 'error');
  } finally {
    isGenerating = false;
    els.generateBtn.disabled = false;
    els.generateBtn.classList.remove('is-loading');
  }
});

// Initial startup
checkSession();
initFavorites();
