// ══════════════════════════════════════════
//  Palskilen Hub — main.js
// ══════════════════════════════════════════

const selected     = new Set();   // karty aplikacji (data-category="apps")
const selectedLangs = new Map();  // Map<versionId, {name, winget, langName, langIcon}>

const actionBar    = document.getElementById('actionBar');
const actionCount  = document.getElementById('actionCount');
const drawer       = document.getElementById('drawer');
const drawerOverlay= document.getElementById('drawerOverlay');
const drawerBody   = document.getElementById('drawerBody');

// ── Ładowanie danych ──────────────────────
async function loadApps() {
  try {
    const res = await fetch('apps.json');
    if (!res.ok) throw new Error('Nie można załadować apps.json');
    const data = await res.json();
    buildUI(data);
  } catch (err) {
    document.getElementById('programsContainer').innerHTML =
      `<div style="color:var(--accent-2);padding:20px;">⚠️ Błąd: ${err.message}</div>`;
  }
}

// ── Budowanie UI ──────────────────────────
function buildUI(data) {
  const subTabs  = document.getElementById('subTabs');
  const container= document.getElementById('programsContainer');
  subTabs.innerHTML  = '';
  container.innerHTML= '';

  data.categories.forEach((cat, i) => {
    const btn = document.createElement('button');
    btn.className   = 'sub-tab' + (i === 0 ? ' active' : '');
    btn.dataset.sub = cat.id;
    btn.textContent = cat.label;
    subTabs.appendChild(btn);

    const section = document.createElement('div');
    section.className = 'sub-section' + (i === 0 ? ' active' : '');
    section.id = cat.id;

    if (cat.id === 'languages') {
      buildLanguagesSection(cat, section);
    } else {
      buildAppsSection(cat, section);
    }

    container.appendChild(section);
  });

  initSubTabs();
  initSearch();
}

// ── Sekcja aplikacji (normalne karty) ─────
function buildAppsSection(cat, section) {
  cat.groups.forEach(group => {
    const groupEl = document.createElement('div');
    groupEl.className = 'group';
    groupEl.innerHTML = `<div class="group-label">${group.label}</div>`;

    const grid = document.createElement('div');
    grid.className = 'cards-grid';

    group.items.forEach(item => {
      const card = document.createElement('div');
      card.className = 'prog-card';
      card.dataset.name     = item.name;
      card.dataset.type     = item.type;
      card.dataset.icon     = item.icon;
      card.dataset.url      = item.url;
      card.dataset.category = cat.id;
      card.dataset.id       = item.id;
      card.innerHTML = `
        <div class="check-indicator"></div>
        <div class="prog-icon">${item.icon}</div>
        <div class="prog-info">
          <div class="prog-name">${item.name}</div>
          <div class="prog-type">${item.type}</div>
        </div>
      `;
      card.addEventListener('click', () => toggleCard(card));
      grid.appendChild(card);
    });

    groupEl.appendChild(grid);
    section.appendChild(groupEl);
  });
}

// ── Sekcja języków (rozwijane karty) ──────
function buildLanguagesSection(cat, section) {
  const wrapper = document.createElement('div');
  wrapper.className = 'langs-list';

  cat.langs.forEach(lang => {
    const card = document.createElement('div');
    card.className = 'lang-card';
    card.dataset.langId = lang.id;

    // Header — klikalne, cała szerokość
    const header = document.createElement('div');
    header.className = 'lang-header';
    header.innerHTML = `
      <div class="lang-header-left">
        <span class="lang-icon">${lang.icon}</span>
        <div class="lang-info">
          <div class="lang-name">${lang.name}</div>
          <div class="lang-desc">${lang.desc}</div>
        </div>
      </div>
      <div class="lang-header-right">
        <span class="lang-selected-count" id="lsc-${lang.id}"></span>
        <span class="lang-chevron">▼</span>
      </div>
    `;

    // Body — wersje
    const body = document.createElement('div');
    body.className = 'lang-body';

    if (!lang.versioned || lang.versioned === 'False' || lang.versioned === 'false') {
      // Pojedynczy checkbox
      const row = document.createElement('div');
      row.className = 'lang-single-row';
      const chk = buildVersionCheckbox(lang.single, lang);
      row.appendChild(chk);
      body.appendChild(row);
    } else {
      lang.groups.forEach(vg => {
        const vgEl = document.createElement('div');
        vgEl.className = 'lang-version-group';
        vgEl.innerHTML = `<div class="lang-version-group-label">${vg.label}</div>`;
        const versionsRow = document.createElement('div');
        versionsRow.className = 'lang-versions-row';
        vg.versions.forEach(ver => {
          versionsRow.appendChild(buildVersionCheckbox(ver, lang));
        });
        vgEl.appendChild(versionsRow);
        body.appendChild(vgEl);
      });
    }

    // Toggle rozwijania
    header.addEventListener('click', () => {
      const isOpen = card.classList.contains('open');
      card.classList.toggle('open', !isOpen);
    });

    card.appendChild(header);
    card.appendChild(body);
    wrapper.appendChild(card);
  });

  section.appendChild(wrapper);
}

function buildVersionCheckbox(ver, lang) {
  const label = document.createElement('label');
  label.className = 'lang-ver-checkbox';
  label.dataset.verId = ver.id;

  const input = document.createElement('input');
  input.type = 'checkbox';
  input.dataset.verId    = ver.id;
  input.dataset.verLabel = ver.label;
  input.dataset.winget   = ver.winget;
  input.dataset.langName = lang.name;
  input.dataset.langIcon = lang.icon;

  input.addEventListener('change', () => {
    if (input.checked) {
      selectedLangs.set(ver.id, {
        label:    ver.label,
        winget:   ver.winget,
        langName: lang.name,
        langIcon: lang.icon
      });
    } else {
      selectedLangs.delete(ver.id);
    }
    updateLangCount(lang.id);
    updateUI();
  });

  const checkBox = document.createElement('span');
  checkBox.className = 'lang-ver-check';

  const text = document.createElement('span');
  text.className = 'lang-ver-label';
  text.textContent = ver.label;

  label.appendChild(input);
  label.appendChild(checkBox);
  label.appendChild(text);
  return label;
}

function updateLangCount(langId) {
  const el = document.getElementById(`lsc-${langId}`);
  if (!el) return;
  // Policz zaznaczone wersje dla tego języka
  let count = 0;
  document.querySelectorAll(`[data-lang-id="${langId}"] input[type=checkbox]`).forEach(cb => {
    if (cb.checked) count++;
  });
  el.textContent = count > 0 ? `${count} wybrano` : '';
  // Podświetl nagłówek jeśli coś zaznaczono
  const card = document.querySelector(`.lang-card[data-lang-id="${langId}"]`);
  if (card) card.classList.toggle('has-selection', count > 0);
}

// ── Sub-taby ──────────────────────────────
function initSubTabs() {
  document.querySelectorAll('.sub-tab').forEach(tab => {
    tab.addEventListener('click', () => {
      document.querySelectorAll('.sub-tab').forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      document.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
      document.getElementById(tab.dataset.sub).classList.add('active');
      document.getElementById('searchInput').value = '';
      resetSearch();
    });
  });
}

// ── Główne taby (sidebar) ─────────────────
document.querySelectorAll('.nav-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.nav-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    document.querySelectorAll('.tab-section').forEach(s => s.classList.remove('active'));
    document.getElementById(btn.dataset.tab).classList.add('active');
  });
});

// ── Wyszukiwarka ──────────────────────────
function initSearch() {
  const searchInput = document.getElementById('searchInput');
  searchInput.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    if (!query) { resetSearch(); return; }

    document.querySelectorAll('.sub-section').forEach(s => s.classList.add('active'));

    document.querySelectorAll('.prog-card').forEach(card => {
      const match = card.dataset.name.toLowerCase().includes(query) ||
                    card.dataset.type.toLowerCase().includes(query);
      card.classList.toggle('hidden', !match);
    });

    document.querySelectorAll('.group').forEach(group => {
      const hasVisible = group.querySelectorAll('.prog-card:not(.hidden)').length > 0;
      group.style.display = hasVisible ? '' : 'none';
    });

    // Wyszukiwanie w językach
    document.querySelectorAll('.lang-card').forEach(card => {
      const name = card.querySelector('.lang-name').textContent.toLowerCase();
      const desc = card.querySelector('.lang-desc').textContent.toLowerCase();
      const match = name.includes(query) || desc.includes(query);
      card.style.display = match ? '' : 'none';
    });
  });
}

function resetSearch() {
  document.querySelectorAll('.prog-card').forEach(c => c.classList.remove('hidden'));
  document.querySelectorAll('.group').forEach(g => g.style.display = '');
  document.querySelectorAll('.lang-card').forEach(c => c.style.display = '');
  const activeSub = document.querySelector('.sub-tab.active');
  if (activeSub) {
    document.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
    document.getElementById(activeSub.dataset.sub).classList.add('active');
  }
}

// ── Zaznaczanie kart (aplikacje) ──────────
function toggleCard(card) {
  if (selected.has(card)) {
    selected.delete(card);
    card.classList.remove('selected');
  } else {
    selected.add(card);
    card.classList.add('selected');
  }
  updateUI();
}

function updateUI() {
  const total = selected.size + selectedLangs.size;
  actionCount.textContent = total;
  actionBar.classList.toggle('visible', total > 0);
  updateDrawer();
}

function updateDrawer() {
  const total = selected.size + selectedLangs.size;
  if (total === 0) {
    drawerBody.innerHTML = '<div class="drawer-empty">Brak wybranych programów</div>';
    return;
  }
  drawerBody.innerHTML = '';

  // Aplikacje
  selected.forEach(card => {
    const item = document.createElement('div');
    item.className = 'drawer-item';
    item.innerHTML = `
      <div class="drawer-item-icon">${card.dataset.icon}</div>
      <div class="drawer-item-info">
        <div class="drawer-item-name">${card.dataset.name}</div>
        <div class="drawer-item-type">${card.dataset.type}</div>
      </div>
      <button class="drawer-item-remove">×</button>
    `;
    item.querySelector('.drawer-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      toggleCard(card);
    });
    drawerBody.appendChild(item);
  });

  // Języki
  selectedLangs.forEach((ver, id) => {
    const item = document.createElement('div');
    item.className = 'drawer-item';
    item.innerHTML = `
      <div class="drawer-item-icon">${ver.langIcon}</div>
      <div class="drawer-item-info">
        <div class="drawer-item-name">${ver.label}</div>
        <div class="drawer-item-type">winget: ${ver.winget}</div>
      </div>
      <button class="drawer-item-remove" data-ver-id="${id}">×</button>
    `;
    item.querySelector('.drawer-item-remove').addEventListener('click', (e) => {
      e.stopPropagation();
      // Odznacz checkbox
      const cb = document.querySelector(`input[data-ver-id="${id}"]`);
      if (cb) { cb.checked = false; }
      selectedLangs.delete(id);
      // Odśwież licznik dla danego języka
      document.querySelectorAll('.lang-card').forEach(lc => {
        const langId = lc.dataset.langId;
        updateLangCount(langId);
      });
      updateUI();
    });
    drawerBody.appendChild(item);
  });
}

// ── Drawer ────────────────────────────────
function openDrawer()  { drawer.classList.add('open');    drawerOverlay.classList.add('open');    }
function closeDrawer() { drawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }

document.getElementById('btnList').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

document.getElementById('drawerClear').addEventListener('click', () => {
  selected.forEach(card => card.classList.remove('selected'));
  selected.clear();
  // Odznacz wszystkie checkboxy języków
  document.querySelectorAll('.lang-ver-checkbox input').forEach(cb => cb.checked = false);
  selectedLangs.clear();
  document.querySelectorAll('.lang-card').forEach(lc => updateLangCount(lc.dataset.langId));
  updateUI();
});

// ── Generator .bat ────────────────────────
function generateBat() {
  const total = selected.size + selectedLangs.size;
  if (total === 0) return;

  const apps    = Array.from(selected).map(card => ({
    name:     card.dataset.name,
    url:      card.dataset.url,
    icon:     card.dataset.icon,
    category: card.dataset.category
  })).filter(i => i.category === 'apps');

  const langs   = Array.from(selectedLangs.values());
  const systems = Array.from(selected).map(card => ({
    name: card.dataset.name,
    url:  card.dataset.url,
    icon: card.dataset.icon,
    category: card.dataset.category
  })).filter(i => i.category === 'systems');

  const line = (text = '') => text + '\r\n';
  const sep  = () => line('echo ==========================================');

  let bat = '';
  bat += line('@echo off');
  bat += line('chcp 65001 >nul');
  bat += line('title Palskilen Hub - Downloader');
  bat += line('color 0C');
  bat += line('cls');
  bat += sep();
  bat += line('echo   Palskilen Hub - Auto Downloader');
  bat += sep();
  bat += line('echo.');
  bat += line(`echo Wybrane lacznie: ${total}`);
  if (apps.length)    bat += line(`echo   - Aplikacje:  ${apps.length}`);
  if (langs.length)   bat += line(`echo   - Jezyki:     ${langs.length}`);
  if (systems.length) bat += line(`echo   - Systemy:    ${systems.length}`);
  bat += line('echo.');
  bat += line('echo [!] Wymagane polaczenie z internetem');
  bat += line('echo [!] Aplikacje -> Desktop\\PalskilenHub\\Aplikacje');
  bat += line('echo [!] Jezyki    -> instalacja przez winget (wymagany winget)');
  bat += line('echo.');
  bat += line('pause');
  bat += line('cls');
  bat += line('');

  // ── 1. Aplikacje (curl download) ──
  if (apps.length) {
    bat += line('set "APPS_DIR=%USERPROFILE%\\Desktop\\PalskilenHub\\Aplikacje"');
    bat += line('if not exist "%APPS_DIR%" mkdir "%APPS_DIR%"');
    bat += line('');
    bat += sep();
    bat += line('echo   [1/3] Pobieranie Aplikacji');
    bat += sep();
    bat += line('echo.');
    apps.forEach((item, i) => {
      const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
      const rawExt   = item.url.split('.').pop().split('?')[0];
      const ext      = /^(exe|msi|zip|7z|pkg)$/i.test(rawExt) ? rawExt : 'exe';
      bat += line(`echo [${i + 1}/${apps.length}] ${item.name}...`);
      bat += line(`curl -L --progress-bar -o "%APPS_DIR%\\${safeName}.${ext}" "${item.url}"`);
      bat += line('if %errorlevel% neq 0 (');
      bat += line(`  echo [X] Blad: ${item.name}`);
      bat += line(') else (');
      bat += line(`  echo [OK] ${item.name}`);
      bat += line(')');
      bat += line('echo.');
    });
    bat += line('echo Aplikacje pobrane!');
    bat += line('pause');
    bat += line('cls');
    bat += line('');
  }

  // ── 2. Języki (winget install) ──
  if (langs.length) {
    bat += sep();
    bat += line('echo   [2/3] Instalacja Jezykow przez winget');
    bat += sep();
    bat += line('echo.');
    bat += line('echo Sprawdzanie winget...');
    bat += line('winget --version >nul 2>&1');
    bat += line('if %errorlevel% neq 0 (');
    bat += line('  echo [X] winget nie znaleziony!');
    bat += line('  echo [!] Zainstaluj App Installer ze sklepu Microsoft Store');
    bat += line('  echo [!] https://www.microsoft.com/store/productId/9NBLGGH4NNS1');
    bat += line('  pause');
    bat += line('  goto :skip_langs');
    bat += line(')');
    bat += line('echo [OK] winget dostepny');
    bat += line('echo.');
    langs.forEach((ver, i) => {
      bat += line(`echo [${i + 1}/${langs.length}] Instaluję: ${ver.label}...`);
      bat += line(`winget install --id "${ver.winget}" --accept-package-agreements --accept-source-agreements -e`);
      bat += line('if %errorlevel% neq 0 (');
      bat += line(`  echo [X] Blad przy instalacji: ${ver.label}`);
      bat += line(') else (');
      bat += line(`  echo [OK] Zainstalowano: ${ver.label}`);
      bat += line(')');
      bat += line('echo.');
    });
    bat += line('echo Jezyki zainstalowane!');
    bat += line(':skip_langs');
    bat += line('pause');
    bat += line('cls');
    bat += line('');
  }

  // ── 3. Systemy ISO (curl download) ──
  if (systems.length) {
    bat += line('set "SYS_DIR=%USERPROFILE%\\Desktop\\PalskilenHub\\Systemy"');
    bat += line('if not exist "%SYS_DIR%" mkdir "%SYS_DIR%"');
    bat += line('');
    bat += sep();
    bat += line('echo   [3/3] Pobieranie Systemow (ISO) - duze pliki!');
    bat += sep();
    bat += line('echo.');
    systems.forEach((item, i) => {
      const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
      bat += line(`echo [${i + 1}/${systems.length}] ${item.name}...`);
      bat += line(`curl -L --progress-bar -o "%SYS_DIR%\\${safeName}.iso" "${item.url}"`);
      bat += line('if %errorlevel% neq 0 (');
      bat += line(`  echo [X] Blad: ${item.name}`);
      bat += line(') else (');
      bat += line(`  echo [OK] ${item.name}`);
      bat += line(')');
      bat += line('echo.');
    });
    bat += line('echo Systemy pobrane!');
    bat += line('pause');
    bat += line('cls');
    bat += line('');
  }

  bat += sep();
  bat += line('echo   WSZYSTKO GOTOWE!');
  bat += sep();
  bat += line('echo.');
  bat += line('echo Dzieki za uzywanie Palskilen Hub!');
  bat += line('pause');
  bat += line('exit');

  const blob = new Blob([bat], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href     = url;
  a.download = 'palskilen_downloader.bat';
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}

document.getElementById('btnDownload').addEventListener('click', generateBat);
document.getElementById('drawerDownload').addEventListener('click', generateBat);

// ── Start ─────────────────────────────────
loadApps();