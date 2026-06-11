// ══════════════════════════════════════════
//  Palskilen Hub — vault.js
//  AES-256-GCM + PBKDF2 (310k iter)
//  Wszystko działa lokalnie w przeglądarce.
//  Zaszyfrowany blob w vault-data.js to jedyne
//  co jest widoczne w plikach — bez hasła = nic.
// ══════════════════════════════════════════

// ── TUTAJ WKLEJ SWÓJ ZASZYFROWANY BLOB ───
// Uruchom vault-encrypt.html, zaszyfruj dane,
// skopiuj wynik i wklej go poniżej jako string.
// Pusty string = tryb demo (widoczna instrukcja).
const VAULT_BLOB = '{"v":1,"s":"XZl1kzpqQC2HsRU/NqsG7w==","i":"8HW/Ti0+uKKczs5v","c":"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"}';
// Przykład jak powinien wyglądać blob (twój będzie inny):
// const VAULT_BLOB = '{"v":1,"s":"abc123...","i":"def456...","c":"xyz789..."}';

// ─────────────────────────────────────────

const vaultState = {
  unlocked: false,
  data: null
};

// ── Krypto ───────────────────────────────
function b64toArr(s) {
  return Uint8Array.from(atob(s), c => c.charCodeAt(0));
}

async function deriveKey(password, salt) {
  const enc = new TextEncoder();
  const keyMat = await crypto.subtle.importKey(
    'raw', enc.encode(password), { name: 'PBKDF2' }, false, ['deriveKey']
  );
  return crypto.subtle.deriveKey(
    { name: 'PBKDF2', salt, iterations: 310000, hash: 'SHA-256' },
    keyMat,
    { name: 'AES-GCM', length: 256 },
    false,
    ['decrypt']
  );
}

async function decryptBlob(blob, password) {
  const d = JSON.parse(blob);
  if (d.v !== 1) throw new Error('Nieznany format blobów');
  const salt = b64toArr(d.s);
  const iv   = b64toArr(d.i);
  const ct   = b64toArr(d.c);
  const key  = await deriveKey(password, salt);
  const pt   = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  return JSON.parse(new TextDecoder().decode(pt));
}

// ── Inicjalizacja zakładki Sejf ───────────
function initVault() {
  renderVaultLocked();
}

// ── Widok zablokowany ─────────────────────
function renderVaultLocked() {
  const sec = document.getElementById('sejf');
  sec.innerHTML = `
    <div class="vault-lock-screen">
      <div class="vault-lock-icon">🔐</div>
      <h1 class="vault-lock-title">Sejf</h1>
      <p class="vault-lock-sub">Wpisz hasło master, aby odblokować</p>
      <div class="vault-input-wrap" id="vaultInputWrap">
        <input
          type="password"
          id="vaultPassword"
          class="vault-password-input"
          placeholder="Hasło master..."
          autocomplete="off"
          spellcheck="false"
        />
        <button class="vault-unlock-btn" id="vaultUnlockBtn">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
          Odblokuj
        </button>
      </div>
      <p class="vault-error" id="vaultError"></p>
      ${!VAULT_BLOB ? '<p class="vault-no-blob">⚠️ Brak danych — otwórz <strong>vault-encrypt.html</strong>, zaszyfruj swoje dane i wklej blob do <strong>vault.js</strong></p>' : ''}
    </div>
  `;

  const input = document.getElementById('vaultPassword');
  const btn   = document.getElementById('vaultUnlockBtn');

  btn.addEventListener('click', tryUnlock);
  input.addEventListener('keydown', e => { if (e.key === 'Enter') tryUnlock(); });
  input.focus();
}

// ── Próba odblokowania ────────────────────
async function tryUnlock() {
  const input  = document.getElementById('vaultPassword');
  const errEl  = document.getElementById('vaultError');
  const btn    = document.getElementById('vaultUnlockBtn');
  const wrap   = document.getElementById('vaultInputWrap');
  const pass   = input.value;

  if (!pass) {
    shakeError(wrap, errEl, 'Wpisz hasło');
    return;
  }

  if (!VAULT_BLOB) {
    shakeError(wrap, errEl, 'Brak zaszyfrowanych danych (patrz vault.js)');
    return;
  }

  btn.disabled  = true;
  btn.innerHTML = '<span class="vault-spinner"></span> Odszyfrowanie...';
  errEl.textContent = '';

  try {
    const data = await decryptBlob(VAULT_BLOB, pass);
    vaultState.unlocked = true;
    vaultState.data = data;
    renderVaultUnlocked();
  } catch {
    btn.disabled  = false;
    btn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg> Odblokuj`;
    input.value = '';
    shakeError(wrap, errEl, '❌ Złe hasło');
    input.focus();
  }
}

function shakeError(wrap, errEl, msg) {
  errEl.textContent = msg;
  wrap.classList.add('shake');
  setTimeout(() => wrap.classList.remove('shake'), 600);
}

// ── Widok odblokowany — kafelki kategorii ─
function renderVaultUnlocked() {
  const sec  = document.getElementById('sejf');
  const data = vaultState.data;

  // Zbuduj kafelki z kategorii w vault data
  const tilesHTML = data.categories.map(cat => `
    <div class="vault-tile" data-cat="${escHtml(cat.id)}" onclick="openVaultCategory('${escHtml(cat.id)}')">
      <div class="vault-tile-icon">${escHtml(cat.icon)}</div>
      <div class="vault-tile-name">${escHtml(cat.name)}</div>
      <div class="vault-tile-count">${cat.entries.length} ${cat.entries.length === 1 ? 'wpis' : cat.entries.length < 5 ? 'wpisy' : 'wpisów'}</div>
    </div>
  `).join('');

  sec.innerHTML = `
    <div class="vault-header-bar">
      <div class="section-header" style="margin-bottom:0">
        <h1>🔓 Sejf</h1>
        <p>Kliknij kategorię, aby zobaczyć wpisy</p>
      </div>
      <button class="vault-lock-btn-sm" onclick="lockVault()">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
        Zablokuj
      </button>
    </div>
    <div class="vault-tiles-grid" id="vaultTilesGrid">
      ${tilesHTML}
    </div>
    <div class="vault-category-view" id="vaultCategoryView" style="display:none"></div>
  `;
}

// ── Widok kategorii (lista wpisów) ────────
function openVaultCategory(catId) {
  const data   = vaultState.data;
  const cat    = data.categories.find(c => c.id === catId);
  if (!cat) return;

  const view = document.getElementById('vaultCategoryView');
  const grid = document.getElementById('vaultTilesGrid');

  const entriesHTML = cat.entries.map(entry => {
    const fieldsHTML = entry.fields.map(f => `
      <div class="vault-field">
        <span class="vault-field-label">${escHtml(f.label)}</span>
        <span class="vault-field-value" onclick="copyVaultField(this)">${escHtml(f.value)}<span class="vault-copy-hint">kliknij aby skopiować</span></span>
      </div>
    `).join('');

    return `
      <div class="vault-entry-card">
        <div class="vault-entry-header">
          <div class="vault-entry-icon">${escHtml(entry.icon || cat.icon)}</div>
          <div class="vault-entry-title">${escHtml(entry.title)}</div>
        </div>
        <div class="vault-entry-fields">
          ${fieldsHTML}
        </div>
      </div>
    `;
  }).join('');

  view.innerHTML = `
    <button class="vault-back-btn" onclick="closeVaultCategory()">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="15 18 9 12 15 6"/></svg>
      Wróć do sejfu
    </button>
    <div class="vault-cat-header">
      <span class="vault-cat-icon">${escHtml(cat.icon)}</span>
      <h2 class="vault-cat-title">${escHtml(cat.name)}</h2>
    </div>
    <div class="vault-entries-list">
      ${entriesHTML}
    </div>
  `;

  grid.style.display = 'none';
  view.style.display  = 'block';
}

function closeVaultCategory() {
  document.getElementById('vaultCategoryView').style.display = 'none';
  document.getElementById('vaultTilesGrid').style.display    = '';
}

// ── Kopiowanie pola ───────────────────────
function copyVaultField(el) {
  const text = el.childNodes[0].textContent.trim();
  navigator.clipboard.writeText(text).then(() => {
    el.classList.add('copied');
    setTimeout(() => el.classList.remove('copied'), 1800);
  });
}

// ── Blokowanie sejfu ──────────────────────
function lockVault() {
  vaultState.unlocked = false;
  vaultState.data     = null;
  renderVaultLocked();
}

// ── Helper ───────────────────────────────
function escHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}
