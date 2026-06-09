// ══════════════════════════════════════════
//  Palskilen Hub — main.js
//  Ładuje apps.json i buduje UI dynamicznie
// ══════════════════════════════════════════

const selected = new Set();
const actionBar = document.getElementById('actionBar');
const actionCount = document.getElementById('actionCount');
const drawer = document.getElementById('drawer');
const drawerOverlay = document.getElementById('drawerOverlay');
const drawerBody = document.getElementById('drawerBody');

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
  const subTabs = document.getElementById('subTabs');
  const container = document.getElementById('programsContainer');
  subTabs.innerHTML = '';
  container.innerHTML = '';

  data.categories.forEach((cat, i) => {
    // Tab button
    const btn = document.createElement('button');
    btn.className = 'sub-tab' + (i === 0 ? ' active' : '');
    btn.dataset.sub = cat.id;
    btn.textContent = cat.label;
    subTabs.appendChild(btn);

    // Sub-section
    const section = document.createElement('div');
    section.className = 'sub-section' + (i === 0 ? ' active' : '');
    section.id = cat.id;

    cat.groups.forEach(group => {
      const groupEl = document.createElement('div');
      groupEl.className = 'group';
      groupEl.innerHTML = `<div class="group-label">${group.label}</div>`;

      const grid = document.createElement('div');
      grid.className = 'cards-grid';

      group.items.forEach(item => {
        const card = document.createElement('div');
        card.className = 'prog-card';
        card.dataset.name = item.name;
        card.dataset.type = item.type;
        card.dataset.icon = item.icon;
        card.dataset.url = item.url;
        card.dataset.category = cat.id;
        card.dataset.id = item.id;
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

    container.appendChild(section);
  });

  // Inicjalizacja sub-tabów
  initSubTabs();
  // Inicjalizacja wyszukiwarki
  initSearch();
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

    // Pokaż wszystkie sekcje żeby przeszukać
    document.querySelectorAll('.sub-section').forEach(s => s.classList.add('active'));

    document.querySelectorAll('.prog-card').forEach(card => {
      const match = card.dataset.name.toLowerCase().includes(query) ||
                    card.dataset.type.toLowerCase().includes(query);
      card.classList.toggle('hidden', !match);
    });

    // Chowaj puste grupy
    document.querySelectorAll('.group').forEach(group => {
      const hasVisible = group.querySelectorAll('.prog-card:not(.hidden)').length > 0;
      group.style.display = hasVisible ? '' : 'none';
    });
  });
}

function resetSearch() {
  document.querySelectorAll('.prog-card').forEach(c => c.classList.remove('hidden'));
  document.querySelectorAll('.group').forEach(g => g.style.display = '');
  const activeSub = document.querySelector('.sub-tab.active');
  if (activeSub) {
    document.querySelectorAll('.sub-section').forEach(s => s.classList.remove('active'));
    document.getElementById(activeSub.dataset.sub).classList.add('active');
  }
}

// ── Zaznaczanie kart ──────────────────────
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
  actionCount.textContent = selected.size;
  actionBar.classList.toggle('visible', selected.size > 0);
  updateDrawer();
}

function updateDrawer() {
  if (selected.size === 0) {
    drawerBody.innerHTML = '<div class="drawer-empty">Brak wybranych programów</div>';
    return;
  }
  drawerBody.innerHTML = '';
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
}

// ── Drawer ────────────────────────────────
function openDrawer() { drawer.classList.add('open'); drawerOverlay.classList.add('open'); }
function closeDrawer() { drawer.classList.remove('open'); drawerOverlay.classList.remove('open'); }

document.getElementById('btnList').addEventListener('click', openDrawer);
document.getElementById('drawerClose').addEventListener('click', closeDrawer);
drawerOverlay.addEventListener('click', closeDrawer);

document.getElementById('drawerClear').addEventListener('click', () => {
  selected.forEach(card => card.classList.remove('selected'));
  selected.clear();
  updateUI();
});

// ── Generator .bat ────────────────────────
function generateBat() {
  if (selected.size === 0) return;

  const items = Array.from(selected).map(card => ({
    name: card.dataset.name,
    url: card.dataset.url,
    icon: card.dataset.icon,
    category: card.dataset.category
  }));

  const apps      = items.filter(i => i.category === 'apps');
  const languages = items.filter(i => i.category === 'languages');
  const systems   = items.filter(i => i.category === 'systems');

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
  bat += line(`echo Wybrane: ${items.length} program${items.length === 1 ? '' : 'ow'}`);
  if (apps.length)      bat += line(`echo   - Aplikacje:  ${apps.length}`);
  if (languages.length) bat += line(`echo   - Jezyki:     ${languages.length}`);
  if (systems.length)   bat += line(`echo   - Systemy:    ${systems.length}`);
  bat += line('echo.');
  bat += line('echo [!] Wymagane polaczenie z internetem');
  bat += line('echo [!] Pliki trafią do Desktop\\PalskilenHub');
  bat += line('echo.');
  bat += line('pause');
  bat += line('cls');
  bat += line('');
  bat += line('set "BASE_DIR=%USERPROFILE%\\Desktop\\PalskilenHub"');
  bat += line('set "APPS_DIR=%BASE_DIR%\\Aplikacje"');
  bat += line('set "LANG_DIR=%BASE_DIR%\\Jezyki"');
  bat += line('set "SYS_DIR=%BASE_DIR%\\Systemy"');
  bat += line('if not exist "%BASE_DIR%" mkdir "%BASE_DIR%"');
  if (apps.length)      bat += line('if not exist "%APPS_DIR%" mkdir "%APPS_DIR%"');
  if (languages.length) bat += line('if not exist "%LANG_DIR%" mkdir "%LANG_DIR%"');
  if (systems.length)   bat += line('if not exist "%SYS_DIR%" mkdir "%SYS_DIR%"');
  bat += line('');

  function downloadSection(arr, dir, label) {
    if (!arr.length) return '';
    let s = '';
    s += sep();
    s += line(`echo   Pobieranie: ${label}`);
    s += sep();
    s += line('echo.');
    arr.forEach((item, i) => {
      const safeName = item.name.replace(/[^a-zA-Z0-9]/g, '_');
      const rawExt   = item.url.split('.').pop().split('?')[0];
      const ext      = /^(exe|msi|iso|zip|7z|pkg)$/i.test(rawExt) ? rawExt : 'exe';
      const filename = `${safeName}.${ext}`;
      s += line(`echo [${i + 1}/${arr.length}] ${item.name}...`);
      s += line(`curl -L --progress-bar -o "${dir}\\${filename}" "${item.url}"`);
      s += line('if %errorlevel% neq 0 (');
      s += line(`  echo [X] Blad: ${item.name}`);
      s += line(') else (');
      s += line(`  echo [OK] ${item.name}`);
      s += line(')');
      s += line('echo.');
    });
    s += line(`echo Gotowe: ${label}`);
    s += line('echo.');
    s += line('pause');
    s += line('cls');
    s += line('');
    return s;
  }

  bat += downloadSection(apps,      '%APPS_DIR%', 'Aplikacje');
  bat += downloadSection(languages, '%LANG_DIR%', 'Jezyki i Runtimes');
  bat += downloadSection(systems,   '%SYS_DIR%',  'Systemy (ISO)');

  bat += sep();
  bat += line('echo   WSZYSTKO POBRANE!');
  bat += sep();
  bat += line('echo.');
  bat += line('echo Pliki zapisane w:');
  bat += line('echo   %BASE_DIR%');
  bat += line('echo.');
  bat += line('echo Dzieki za uzywanie Palskilen Hub!');
  bat += line('pause');
  bat += line('exit');

  const blob = new Blob([bat], { type: 'text/plain' });
  const url  = URL.createObjectURL(blob);
  const a    = document.createElement('a');
  a.href = url;
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