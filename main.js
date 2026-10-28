'use strict';

// ---------------------------------------------------------------------------
// Sabitler ve başlangıç verileri
// ---------------------------------------------------------------------------
const STORAGE_KEYS = {
  animals: 'kampus_hayvanlari_v2',
  score: 'kampus_score',
  trophies: 'kampus_trophies',
  theme: 'kampus-theme'
};

const FEED_POINTS = 10;
const VALID_TYPES = ['cat', 'dog', 'station'];

// Görsel yüklenemediğinde (çevrimdışı vb.) gösterilecek yedek resim
const PLACEHOLDER_IMG = 'data:image/svg+xml;utf8,' + encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 200 200">' +
  '<rect width="200" height="200" fill="#e5e7eb"/>' +
  '<g fill="#9ca3af"><ellipse cx="100" cy="125" rx="32" ry="26"/>' +
  '<ellipse cx="58" cy="90" rx="13" ry="17"/><ellipse cx="86" cy="68" rx="13" ry="17"/>' +
  '<ellipse cx="114" cy="68" rx="13" ry="17"/><ellipse cx="142" cy="90" rx="13" ry="17"/></g></svg>'
);

const TROPHIES = [
  { id: 'ilk_merhamet', title: 'İlk Merhamet', desc: '10 iyilik puanı kazan.', icon: 'fa-medal', tone: '' },
  { id: 'kampus_kahramani', title: 'Kampüs Kahramanı', desc: '50 puana ulaş.', icon: 'fa-medal', tone: '' },
  { id: 'koruyucu_melek', title: 'Koruyucu Melek', desc: 'Bir canın sorumluluğunu üstlen.', icon: 'fa-shield-halved', tone: 'purple' }
];

const initialData = [
  { id: 1, type: 'cat', name: 'Tarçın', age: '3 Yaşında', location: 'Kütüphane Önü', health: 'Sağlıklı', vaccine: 'Tam (Kuduz, Karma)', neutered: 'Kısırlaştırıldı', image: 'https://images.unsplash.com/photo-1514888286974-6c03e2ca1dba?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 2, type: 'cat', name: 'Gece', age: '1.5 Yaşında', location: 'Mühendislik Fakültesi', health: 'Göz damlası kullanıyor', vaccine: 'Karma Eksik', neutered: 'Kısırlaştırılmadı', image: 'https://images.unsplash.com/photo-1543852786-1cf6624b9987?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 3, type: 'cat', name: 'Pamuk', age: '5 Yaşında', location: 'Yemekhane', health: 'Çok Sağlıklı ve Kilolu', vaccine: 'Tam', neutered: 'Kısırlaştırıldı', image: 'https://images.unsplash.com/photo-1495360010541-f48722b34f7d?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 4, type: 'cat', name: 'Duman', age: '1 Yaşında', location: 'Spor Salonu', health: 'Sol arka patisinde incinme var', vaccine: 'Aşıları Tam', neutered: 'Kısırlaştırıldı', image: 'https://images.unsplash.com/photo-1511044568932-338cba0ad803?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 5, type: 'cat', name: 'Karamel', age: '4 Aylık', location: 'Rektörlük', health: 'Sağlıklı', vaccine: 'Bilinmiyor', neutered: 'Kısırlaştırılmadı', image: 'https://images.unsplash.com/photo-1513360371669-4adf3dd7dff8?w=600&auto=format&fit=crop', isAdoptable: true, contact: '0532 000 0000' },
  { id: 6, type: 'dog', name: 'Karabaş', age: '4 Yaşında', location: 'Güvenlik Kulübesi', health: 'Sağlıklı', vaccine: 'Tam', neutered: 'Kısırlaştırıldı', image: 'https://images.unsplash.com/photo-1534361960057-19889db9621e?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 7, type: 'dog', name: 'Dost', age: 'Bilinmiyor', location: 'Yurtlar Bölgesi', health: 'Hafif topallıyor', vaccine: 'Karma yapıldı', neutered: 'Kısırlaştırılmadı', image: 'https://images.unsplash.com/photo-1517849845537-4d257902454a?w=600&auto=format&fit=crop', isAdoptable: true, contact: 'IG: @dostsahiplendirme' },
  { id: 8, type: 'dog', name: 'Şanslı', age: '6 Yaşında', location: 'Merkezi Çimler', health: 'Obezite diyeti', vaccine: 'Tüm Aşıları Tam', neutered: 'Kısırlaştırıldı', image: 'https://images.unsplash.com/photo-1543466835-00a7907e9de1?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 9, type: 'dog', name: 'Cesur', age: '2 Yaşında', location: 'Otopark', health: 'Sağlıklı', vaccine: 'Kuduz Aşısı Gerekli', neutered: 'Kısırlaştırılmadı', image: 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' },
  { id: 10, type: 'dog', name: 'Gölge', age: '11 Aylık', location: 'Ormanlık Alan', health: 'Deri tedavisi görüyor', vaccine: 'Öncelikli değil', neutered: 'Bilinmiyor', image: 'https://images.unsplash.com/photo-1537151608828-ea2b11777ee8?w=600&auto=format&fit=crop', isAdoptable: false, contact: '' }
];

// ---------------------------------------------------------------------------
// PWA
// ---------------------------------------------------------------------------
if ('serviceWorker' in navigator && location.protocol.startsWith('http')) {
  const hadController = !!navigator.serviceWorker.controller;
  let reloading = false;

  // Yeni service worker devreye girince sayfayı yeni sürümle yenile
  navigator.serviceWorker.addEventListener('controllerchange', () => {
    if (!hadController || reloading) return; // ilk kurulumda yenileme yapma
    const addModal = document.getElementById('add-modal');
    if (addModal && !addModal.hidden) {
      // Kullanıcı form dolduruyorsa verisini kaybetmesin
      showToast('Yeni sürüm hazır. Kaydı bitirince uygulamayı yeniden açın.', '', 6000);
      return;
    }
    reloading = true;
    showToast('Yeni sürüm yükleniyor...', 'success', 1500);
    setTimeout(() => location.reload(), 900);
  });

  window.addEventListener('load', () => {
    navigator.serviceWorker.register('./sw.js', { updateViaCache: 'none' })
      .then(reg => {
        console.log('PWA sistemi devrede. Kapsam:', reg.scope);
        const checkForUpdate = () => reg.update().catch(() => {});
        // Uygulama arka plandan öne gelince ve düzenli aralıklarla yeni sürümü ara
        document.addEventListener('visibilitychange', () => {
          if (!document.hidden) checkForUpdate();
        });
        setInterval(checkForUpdate, 30 * 60 * 1000);
      })
      .catch(err => console.warn('PWA yüklenemedi:', err));
  });
}

// ---------------------------------------------------------------------------
// Durum
// ---------------------------------------------------------------------------
let animals = [];
let currentType = 'cat';
let editingAnimalId = null;
let currentViewedAnimal = null;
let currentScore = 0;
let unlockedTrophies = [];

const $ = id => document.getElementById(id);

document.addEventListener('DOMContentLoaded', () => {
  initApp();
  setupEventListeners();
});

// ---------------------------------------------------------------------------
// Yardımcılar
// ---------------------------------------------------------------------------
function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

function icon(classes) {
  const i = document.createElement('i');
  i.className = classes;
  i.setAttribute('aria-hidden', 'true');
  return i;
}

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw === null ? fallback : JSON.parse(raw);
  } catch (e) {
    console.warn('Kayıtlı veri okunamadı:', key, e);
    return fallback;
  }
}

function vibrate(pattern) {
  if ('vibrate' in navigator) navigator.vibrate(pattern);
}

function normalizeText(value) {
  return String(value || '').toLocaleLowerCase('tr-TR').trim();
}

function showToast(message, type = '', duration = 3200) {
  const container = $('toast-container');
  const toast = el('div', 'toast ' + type, message);
  container.appendChild(toast);
  setTimeout(() => {
    toast.classList.add('out');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

async function copyText(text) {
  try {
    if (navigator.clipboard && window.isSecureContext) {
      await navigator.clipboard.writeText(text);
      return true;
    }
  } catch (e) { /* aşağıdaki yedek yönteme geç */ }
  try {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.cssText = 'position:fixed;top:-1000px;opacity:0;';
    document.body.appendChild(ta);
    ta.select();
    const ok = document.execCommand('copy');
    ta.remove();
    return ok;
  } catch (e) {
    return false;
  }
}

function isUnneutered(animal) {
  return normalizeText(animal.neutered).includes('kısırlaştırılmadı');
}

// Dışarıdan gelen (senkronizasyon / eski kayıt) veriyi güvenli hale getirir
function sanitizeAnimal(raw, index) {
  if (!raw || typeof raw !== 'object') return null;
  if (!VALID_TYPES.includes(raw.type)) return null;
  const name = String(raw.name || '').trim();
  if (!name) return null;

  const str = v => (typeof v === 'string' ? v : '');
  const image = typeof raw.image === 'string' && /^(https?:|data:image\/|blob:)/i.test(raw.image) ? raw.image : '';

  const animal = {
    id: Number.isFinite(Number(raw.id)) ? Number(raw.id) : Date.now() + index,
    type: raw.type,
    name,
    location: str(raw.location).trim(),
    image
  };
  if (Number.isFinite(raw.lastFed)) animal.lastFed = raw.lastFed;

  if (animal.type === 'station') {
    animal.stationState = str(raw.stationState) || 'Dolu ✅';
  } else {
    animal.age = str(raw.age);
    animal.health = str(raw.health);
    animal.vaccine = str(raw.vaccine);
    animal.neutered = str(raw.neutered) || 'Bilinmiyor';
    animal.isAdoptable = raw.isAdoptable === true;
    animal.contact = str(raw.contact);
    animal.isSOS = raw.isSOS === true;
    animal.traits = Array.isArray(raw.traits) ? raw.traits.filter(t => typeof t === 'string') : [];
    if (typeof raw.guardian === 'string' && raw.guardian.trim()) animal.guardian = raw.guardian.trim();
  }
  return animal;
}

function sanitizeList(list) {
  const seen = new Set();
  return list.map(sanitizeAnimal).filter(a => {
    if (!a || seen.has(a.id)) return false;
    seen.add(a.id);
    return true;
  });
}

// ---------------------------------------------------------------------------
// Başlatma / kalıcılık
// ---------------------------------------------------------------------------
function initApp() {
  syncThemeIcon();

  const savedScore = parseInt(localStorage.getItem(STORAGE_KEYS.score), 10);
  currentScore = Number.isFinite(savedScore) ? savedScore : 0;
  renderScore(false);

  const savedTrophies = readJSON(STORAGE_KEYS.trophies, []);
  unlockedTrophies = Array.isArray(savedTrophies) ? savedTrophies : [];

  const stored = readJSON(STORAGE_KEYS.animals, null);
  if (Array.isArray(stored)) {
    animals = sanitizeList(stored);
  } else {
    animals = sanitizeList(JSON.parse(JSON.stringify(initialData)));
    saveData(false);
  }

  setTab(currentType);
}

function saveData(withFeedback = true) {
  try {
    localStorage.setItem(STORAGE_KEYS.animals, JSON.stringify(animals));
    if (withFeedback) vibrate(50);
    checkTrophies();
    return true;
  } catch (e) {
    showToast('Kayıt başarısız! Depolama alanı dolmuş olabilir. (' + e.name + ')', 'error', 5000);
    return false;
  }
}

// ---------------------------------------------------------------------------
// Puan ve kupalar
// ---------------------------------------------------------------------------
function renderScore(animate = true) {
  const scoreEl = $('user-score');
  scoreEl.textContent = '';
  scoreEl.append(icon('fa-solid fa-gem'), ` ${currentScore} Puan`);
  if (animate) {
    scoreEl.classList.add('bump');
    setTimeout(() => scoreEl.classList.remove('bump'), 300);
  }
}

function updateScore(points) {
  currentScore += points;
  localStorage.setItem(STORAGE_KEYS.score, String(currentScore));
  renderScore(true);
  checkTrophies();
}

function checkTrophies() {
  const unlockedNow = [];
  const unlock = id => {
    if (!unlockedTrophies.includes(id)) {
      unlockedTrophies.push(id);
      unlockedNow.push(TROPHIES.find(t => t.id === id).title);
    }
  };

  if (currentScore >= 10) unlock('ilk_merhamet');
  if (currentScore >= 50) unlock('kampus_kahramani');
  if (animals.some(a => a.guardian)) unlock('koruyucu_melek');

  if (unlockedNow.length) {
    try { localStorage.setItem(STORAGE_KEYS.trophies, JSON.stringify(unlockedTrophies)); } catch (e) { /* önemsiz */ }
    vibrate([200, 100, 200]);
    showToast('🏆 Yeni kupa: ' + unlockedNow.join(', '), 'trophy', 4500);
    if (currentType === 'system') renderAnimals();
  }
}

// ---------------------------------------------------------------------------
// Zaman
// ---------------------------------------------------------------------------
function timeAgo(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const units = [
    [31536000, 'yıl'], [2592000, 'ay'], [86400, 'gün'], [3600, 'saat'], [60, 'dakika']
  ];
  for (const [size, label] of units) {
    const n = Math.floor(seconds / size);
    if (n >= 1) return `${n} ${label} önce`;
  }
  return 'Şimdi';
}

// ---------------------------------------------------------------------------
// Listeleme
// ---------------------------------------------------------------------------
function matchesTab(animal) {
  if (currentType === 'adopt') return animal.isAdoptable === true;
  return animal.type === currentType;
}

function renderAnimals() {
  const grid = $('animal-grid');

  if (currentType === 'system') {
    renderSystem(grid);
    return;
  }

  const searchText = normalizeText($('search-input').value);
  let list = animals.filter(matchesTab);

  if (searchText) {
    list = list.filter(a =>
      normalizeText(a.name).includes(searchText) ||
      normalizeText(a.location).includes(searchText)
    );
  }

  // Acil durumdakiler her zaman en üstte
  list.sort((a, b) => Number(!!b.isSOS) - Number(!!a.isSOS));

  grid.textContent = '';

  if (list.length === 0) {
    const empty = el('div', 'empty-state');
    empty.append(icon('fa-solid fa-paw'));
    empty.append(el('p', '', searchText ? 'Aramanızla eşleşen kayıt bulunamadı.' : 'Bu kategoride henüz kayıt yok.'));
    grid.appendChild(empty);
    return;
  }

  list.forEach(animal => grid.appendChild(createCard(animal)));
}

function createBadge(text, iconClass, tone) {
  const badge = el('div', 'badge badge-' + tone);
  badge.append(icon(iconClass), ' ' + text);
  return badge;
}

function createCard(animal) {
  const isStation = animal.type === 'station';
  const card = el('article', animal.isSOS ? 'cat-card sos-card' : 'cat-card');
  card.tabIndex = 0;
  card.setAttribute('role', 'button');
  card.setAttribute('aria-label', `${animal.name}, ${animal.location || 'konum belirtilmemiş'}`);

  const wrapper = el('div', 'cat-img-wrapper');
  const badges = el('div', 'card-badges');

  if (isStation) {
    const state = animal.stationState || '';
    const tone = state.includes('Dolu') ? 'success' : (state.includes('Boş') ? 'danger' : 'warning');
    badges.appendChild(createBadge(state || 'Durum Bilinmiyor', 'fa-solid fa-circle-info', tone));
  } else {
    if (animal.isAdoptable) badges.appendChild(createBadge('Yuva Arıyor', 'fa-solid fa-house-chimney-heart', 'success'));
    if (isUnneutered(animal)) badges.appendChild(createBadge('Kısır Değil', 'fa-solid fa-triangle-exclamation', 'danger'));
  }

  const img = document.createElement('img');
  img.src = animal.image || PLACEHOLDER_IMG;
  img.alt = animal.name;
  img.loading = 'lazy';
  img.addEventListener('error', () => {
    if (img.src !== PLACEHOLDER_IMG) img.src = PLACEHOLDER_IMG;
  });

  wrapper.append(badges, img);
  if (animal.isSOS && !isStation) {
    wrapper.appendChild(el('div', 'sos-badge', '🚨 ACİL DURUM'));
  }

  const info = el('div', 'cat-info');
  info.appendChild(el('h3', '', animal.name));
  const loc = el('p');
  loc.append(icon('fa-solid fa-location-dot'), el('span', '', animal.location));
  info.appendChild(loc);

  card.append(wrapper, info);
  const open = () => openDetailModal(animal);
  card.addEventListener('click', open);
  card.addEventListener('keydown', e => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      open();
    }
  });
  return card;
}

function renderSystem(grid) {
  const cats = animals.filter(a => a.type === 'cat').length;
  const dogs = animals.filter(a => a.type === 'dog').length;
  const stations = animals.filter(a => a.type === 'station').length;
  const sosCount = animals.filter(a => a.isSOS).length;
  const adoptCount = animals.filter(a => a.isAdoptable).length;

  const tiles = [
    [cats, 'Kedi', '#f97316'],
    [dogs, 'Köpek', '#3b82f6'],
    [stations, 'İstasyon', '#ca8a04'],
    [sosCount, 'Acil Durum (SOS)', '#ef4444'],
    [adoptCount, 'Yuva Arayan', '#10b981'],
    [currentScore, 'Toplam Puanınız', '#8b5cf6']
  ];

  grid.textContent = '';
  const wrap = el('div', 'system-wrap');

  // Kupalar
  const trophyPanel = el('section', 'panel');
  const trophyTitle = el('h2');
  trophyTitle.append(icon('fa-solid fa-trophy'), ' Başarımlar (Kupalar)');
  const trophyList = el('div', 'trophy-list');
  TROPHIES.forEach(t => {
    const unlocked = unlockedTrophies.includes(t.id);
    const row = el('div', `trophy ${unlocked ? 'unlocked' : ''} ${unlocked ? t.tone : ''}`.trim());
    const text = el('div');
    text.append(el('b', '', t.title), el('small', '', t.desc));
    row.append(icon('fa-solid ' + t.icon), text);
    trophyList.appendChild(row);
  });
  trophyPanel.append(trophyTitle, trophyList);

  // İstatistikler
  const statPanel = el('section', 'panel');
  const statTitle = el('h2');
  statTitle.append(icon('fa-solid fa-chart-pie'), ' Kampüs İstatistikleri');
  const statGrid = el('div', 'stat-grid');
  tiles.forEach(([value, label, color]) => {
    const tile = el('div', 'stat-tile');
    tile.style.background = color;
    tile.append(el('strong', '', String(value)), el('span', '', label));
    statGrid.appendChild(tile);
  });
  statPanel.append(statTitle, statGrid);

  // Senkronizasyon
  const syncPanel = el('section', 'panel');
  const syncTitle = el('h2');
  syncTitle.append(icon('fa-solid fa-cloud-arrow-up'), ' Cihaz Senkronizasyonu');
  const syncText = el('p', '', 'Verilerinizi başka bir cihaza taşımak için kodu kopyalayın; yeni cihazda kodu yapıştırıp yükleyin.');
  const textarea = el('textarea', 'sync-textarea');
  textarea.id = 'sync-data-textarea';
  textarea.rows = 4;
  textarea.placeholder = 'Senkronizasyon kodu buraya gelecek...';
  textarea.setAttribute('aria-label', 'Senkronizasyon kodu');
  const actions = el('div', 'sync-actions');
  const exportBtn = el('button', 'submit-btn btn-purple');
  exportBtn.type = 'button';
  exportBtn.append(icon('fa-solid fa-copy'), ' Kodu Kopyala');
  const importBtn = el('button', 'submit-btn btn-red');
  importBtn.type = 'button';
  importBtn.append(icon('fa-solid fa-download'), ' Kodu Yükle');
  actions.append(exportBtn, importBtn);
  syncPanel.append(syncTitle, syncText, textarea, actions);

  wrap.append(trophyPanel, statPanel, syncPanel);
  grid.appendChild(wrap);

  exportBtn.addEventListener('click', async () => {
    const data = JSON.stringify(animals);
    textarea.value = data;
    const ok = await copyText(data);
    if (ok) {
      showToast('Veriler panoya kopyalandı.', 'success');
    } else {
      textarea.select();
      showToast('Otomatik kopyalama yapılamadı. Metni elle kopyalayın.', 'error');
    }
  });

  importBtn.addEventListener('click', () => {
    const text = textarea.value.trim();
    if (!text) {
      showToast('Lütfen önce kod metnini yapıştırın.', 'error');
      return;
    }
    let parsed;
    try {
      parsed = JSON.parse(text);
    } catch (e) {
      showToast('Kod bozuk veya eksik kopyalanmış.', 'error');
      return;
    }
    if (!Array.isArray(parsed)) {
      showToast('Hatalı veri yapısı (liste bekleniyordu).', 'error');
      return;
    }
    const clean = sanitizeList(parsed);
    if (clean.length === 0) {
      showToast('Kodda geçerli kayıt bulunamadı.', 'error');
      return;
    }
    if (!confirm(`Dikkat: Cihazınızdaki mevcut liste silinecek ve koddaki ${clean.length} kayıt yüklenecek. Devam edilsin mi?`)) return;

    const backup = animals;
    animals = clean;
    if (saveData()) {
      showToast(`${clean.length} kayıt yüklendi.`, 'success');
      renderAnimals();
    } else {
      animals = backup;
    }
  });
}

// ---------------------------------------------------------------------------
// Sekmeler / tema
// ---------------------------------------------------------------------------
function setTab(type) {
  currentType = type;
  document.documentElement.dataset.tab = type;

  document.querySelectorAll('.tab-btn').forEach(btn => {
    const active = btn.dataset.type === type;
    btn.classList.toggle('active', active);
    btn.setAttribute('aria-selected', String(active));
    if (active) {
      // Sadece sekme çubuğunu yatay kaydır; sayfanın dikey kaymasına neden olma
      const bar = btn.parentElement;
      bar.scrollLeft = btn.offsetLeft - (bar.clientWidth - btn.offsetWidth) / 2;
    }
  });

  const isSystem = type === 'system';
  $('search-container').hidden = isSystem;
  $('fab-add').hidden = isSystem;
  renderAnimals();
}

function syncThemeIcon() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const btn = $('theme-toggle');
  btn.textContent = '';
  btn.appendChild(icon(dark ? 'fa-solid fa-sun' : 'fa-solid fa-moon'));
  btn.setAttribute('aria-label', dark ? 'Açık temaya geç' : 'Koyu temaya geç');
}

function toggleTheme() {
  const dark = document.documentElement.getAttribute('data-theme') === 'dark';
  const next = dark ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  try { localStorage.setItem(STORAGE_KEYS.theme, next); } catch (e) { /* önemsiz */ }
  syncThemeIcon();
}

// ---------------------------------------------------------------------------
// Modallar
// ---------------------------------------------------------------------------
function updateBodyLock() {
  document.body.classList.toggle('modal-open', !!document.querySelector('.modal-overlay:not([hidden])'));
}

function openModal(modal) {
  clearTimeout(modal._closeTimer);
  modal.hidden = false;
  updateBodyLock();
  requestAnimationFrame(() => requestAnimationFrame(() => modal.classList.add('active')));
}

function closeModal(modal) {
  modal.classList.remove('active');
  clearTimeout(modal._closeTimer);
  modal._closeTimer = setTimeout(() => {
    modal.hidden = true;
    updateBodyLock();
  }, 300);
}

function topOpenModal() {
  const order = ['image-zoom-modal', 'add-modal', 'animal-modal'].map($);
  return order.find(m => !m.hidden && m.classList.contains('active'));
}

// ---------------------------------------------------------------------------
// Form yardımcıları
// ---------------------------------------------------------------------------
function updateFormForType() {
  const isStation = $('a-type').value === 'station';
  $('animal-only-fields').hidden = isStation;
  $('station-only-fields').hidden = !isStation;
  const editing = editingAnimalId !== null;
  $('add-modal-title').textContent = isStation
    ? (editing ? 'İstasyonu Güncelle' : 'Yeni İstasyon Ekle')
    : (editing ? 'Bilgileri Güncelle' : 'Yeni Hayvan Ekle');
}

function updateContactVisibility() {
  const adopt = $('a-adopt').checked;
  $('a-contact-container').hidden = !adopt;
  if (!adopt) $('a-contact').value = '';
}

function clearFormErrors() {
  document.querySelectorAll('#add-form .invalid').forEach(i => i.classList.remove('invalid'));
}

function resetForm() {
  $('add-form').reset();
  clearFormErrors();
  $('selected-file-name').textContent = '';
}

function openAddForm(animal) {
  resetForm();
  editingAnimalId = animal ? animal.id : null;

  const required = !animal;
  $('a-image-label').textContent = required ? 'Fotoğraf (zorunlu)' : 'Fotoğraf';
  $('a-image-help').textContent = required
    ? 'Galeriden bir fotoğraf seçin veya şimdi çekin.'
    : 'Yeni fotoğraf seçmezseniz mevcut fotoğraf korunur.';
  $('delete-animal-btn').hidden = !animal;

  if (animal) {
    $('a-type').value = animal.type;
    $('a-name').value = animal.name;
    $('a-location').value = animal.location || '';

    if (animal.type === 'station') {
      $('a-station-state').value = animal.stationState || 'Dolu ✅';
    } else {
      $('a-age').value = animal.age || '';
      $('a-health').value = animal.health || '';
      $('a-vaccine').value = animal.vaccine || '';
      $('a-neutered').value = ['Kısırlaştırıldı', 'Kısırlaştırılmadı', 'Bilinmiyor'].includes(animal.neutered)
        ? animal.neutered
        : (isUnneutered(animal) ? 'Kısırlaştırılmadı' : 'Bilinmiyor');
      $('a-adopt').checked = !!animal.isAdoptable;
      $('a-contact').value = animal.contact || '';
      $('a-sos').checked = !!animal.isSOS;
      document.querySelectorAll('input[name="trait"]').forEach(cb => {
        cb.checked = Array.isArray(animal.traits) && animal.traits.includes(cb.value);
      });
    }
  } else if (currentType === 'dog' || currentType === 'station') {
    // Yeni kayıt, bulunulan sekmenin türüyle başlasın
    $('a-type').value = currentType;
  }

  updateFormForType();
  updateContactVisibility();
  openModal($('add-modal'));
}

function readFormData() {
  const type = $('a-type').value;
  const data = {
    type,
    name: $('a-name').value.trim(),
    location: $('a-location').value.trim()
  };
  if (type === 'station') {
    data.stationState = $('a-station-state').value;
  } else {
    data.age = $('a-age').value.trim();
    data.health = $('a-health').value.trim();
    data.vaccine = $('a-vaccine').value.trim();
    data.neutered = $('a-neutered').value;
    data.isAdoptable = $('a-adopt').checked;
    data.contact = data.isAdoptable ? $('a-contact').value.trim() : '';
    data.isSOS = $('a-sos').checked;
    data.traits = Array.from(document.querySelectorAll('input[name="trait"]:checked')).map(cb => cb.value);
  }
  return data;
}

function validateForm(data, hasPhoto) {
  clearFormErrors();
  const fail = (inputId, message) => {
    $(inputId).classList.add('invalid');
    $(inputId).focus();
    showToast(message, 'error');
    return false;
  };
  if (!data.name) return fail('a-name', 'Lütfen bir isim girin.');
  if (!hasPhoto) {
    showToast('Lütfen bir fotoğraf seçin.', 'error');
    return false;
  }
  if (!data.location) return fail('a-location', 'Lütfen konum bilgisini girin.');
  if (data.type !== 'station' && data.isAdoptable && !data.contact) {
    return fail('a-contact', 'Sahiplendirme için bir iletişim bilgisi girin.');
  }
  return true;
}

// Seçilen fotoğrafı küçültüp sıkıştırır (localStorage kotası için)
function processImage(file) {
  return new Promise((resolve, reject) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      try {
        const MAX_SIDE = 800;
        const scale = Math.min(1, MAX_SIDE / Math.max(img.width, img.height, 1));
        const canvas = document.createElement('canvas');
        canvas.width = Math.max(1, Math.round(img.width * scale));
        canvas.height = Math.max(1, Math.round(img.height * scale));
        const ctx = canvas.getContext('2d');
        ctx.fillStyle = '#ffffff'; // saydam PNG'ler JPEG'de siyah çıkmasın
        ctx.fillRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL('image/jpeg', 0.7));
      } catch (e) {
        reject(e);
      } finally {
        URL.revokeObjectURL(url);
      }
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('decode'));
    };
    img.src = url;
  });
}

function setSubmitting(isSubmitting) {
  const btn = $('save-btn');
  btn.disabled = isSubmitting;
  btn.textContent = '';
  if (isSubmitting) {
    btn.append(icon('fa-solid fa-spinner fa-spin'), ' Kaydediliyor...');
  } else {
    btn.append(icon('fa-solid fa-floppy-disk'), ' Kaydet');
  }
}

async function handleSubmit(e) {
  e.preventDefault();

  const file = $('a-image-file').files[0] || $('a-camera-file').files[0];
  const existing = editingAnimalId !== null ? animals.find(a => a.id === editingAnimalId) : null;
  const data = readFormData();

  if (!validateForm(data, !!file || !!existing)) return;

  setSubmitting(true);
  try {
    let image = existing ? existing.image : '';
    if (file) {
      try {
        image = await processImage(file);
      } catch (err) {
        const proceed = confirm('Fotoğraf okunamadı (bozuk veya desteklenmeyen biçim olabilir). Varsayılan görselle devam edilsin mi?');
        if (!proceed) return;
        image = existing ? existing.image : '';
      }
    }

    // Tür değişirse eski türe ait alanlar temizlensin
    const base = existing ? { id: existing.id, lastFed: existing.lastFed } : { id: Date.now() };
    if (existing && existing.type === data.type && existing.guardian) base.guardian = existing.guardian;
    const updated = sanitizeAnimal({ ...base, ...data, image }, 0);
    if (updated.lastFed === undefined) delete updated.lastFed;

    const backup = animals;
    animals = existing
      ? animals.map(a => (a.id === existing.id ? updated : a))
      : [...animals, updated];

    if (!saveData()) {
      animals = backup;
      return;
    }

    closeModal($('add-modal'));
    showToast(existing ? 'Bilgiler güncellendi.' : 'Yeni kayıt eklendi.', 'success');

    // Kayıt aktif sekmede görünmüyorsa ilgili sekmeye geç
    if (!matchesTab(updated)) setTab(updated.type); else renderAnimals();
  } finally {
    setSubmitting(false);
  }
}

// ---------------------------------------------------------------------------
// Olay dinleyicileri
// ---------------------------------------------------------------------------
function setupEventListeners() {
  const detailModal = $('animal-modal');
  const addModal = $('add-modal');
  const zoomModal = $('image-zoom-modal');

  document.querySelectorAll('.tab-btn').forEach(btn => {
    btn.addEventListener('click', () => setTab(btn.dataset.type));
  });

  $('search-input').addEventListener('input', renderAnimals);
  $('theme-toggle').addEventListener('click', toggleTheme);
  $('fab-add').addEventListener('click', () => openAddForm(null));

  $('a-type').addEventListener('change', updateFormForType);
  $('a-adopt').addEventListener('change', updateContactVisibility);
  $('add-form').addEventListener('submit', handleSubmit);
  $('add-form').addEventListener('input', e => e.target.classList.remove('invalid'));

  // Seçilen dosya adını göster (galeri/kamera birbirini ezmesin)
  const fileInputs = [$('a-image-file'), $('a-camera-file')];
  fileInputs.forEach(input => {
    input.addEventListener('change', () => {
      const file = input.files[0];
      if (file) {
        fileInputs.filter(other => other !== input).forEach(other => { other.value = ''; });
        $('selected-file-name').textContent = 'Seçilen: ' + file.name;
      } else {
        $('selected-file-name').textContent = '';
      }
    });
  });

  // Kapatma
  $('close-add-modal').addEventListener('click', () => closeModal(addModal));
  $('close-detail-modal').addEventListener('click', () => closeModal(detailModal));
  $('close-zoom-modal').addEventListener('click', () => closeModal(zoomModal));
  [detailModal, addModal, zoomModal].forEach(modal => {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeModal(modal);
    });
  });
  document.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      const modal = topOpenModal();
      if (modal) closeModal(modal);
    }
  });

  // Resmi büyüt
  $('m-img').addEventListener('click', () => {
    $('z-img').src = $('m-img').src;
    openModal(zoomModal);
  });

  // Güncelle
  $('edit-animal-btn').addEventListener('click', () => {
    if (!currentViewedAnimal) return;
    const animal = animals.find(a => a.id === currentViewedAnimal.id);
    if (!animal) return;
    closeModal(detailModal);
    openAddForm(animal);
  });

  // Sil
  $('delete-animal-btn').addEventListener('click', () => {
    if (editingAnimalId === null) return;
    if (!confirm('Bu kaydı kalıcı olarak silmek istediğinize emin misiniz? (Örn: sahiplendirildiyse veya aramızdan ayrıldıysa)')) return;
    const backup = animals;
    animals = animals.filter(a => a.id !== editingAnimalId);
    if (!saveData()) {
      animals = backup;
      return;
    }
    editingAnimalId = null;
    renderAnimals();
    closeModal(addModal);
    showToast('Kayıt silindi.');
  });

  // Mama / su verildi
  $('feed-animal-btn').addEventListener('click', () => {
    if (!currentViewedAnimal) return;
    const idx = animals.findIndex(a => a.id === currentViewedAnimal.id);
    if (idx === -1) return;

    const previous = animals[idx].lastFed;
    const alreadyToday = previous && new Date(previous).toDateString() === new Date().toDateString();

    animals[idx] = { ...animals[idx], lastFed: Date.now() };
    if (!saveData()) {
      animals[idx] = { ...animals[idx], lastFed: previous };
      return;
    }

    // Puan şişirmeyi önlemek için: aynı canlıdan günde yalnızca bir kez puan
    if (alreadyToday) {
      showToast('Kaydedildi. Bu can için bugün zaten puan kazandınız.');
    } else {
      updateScore(FEED_POINTS);
      showToast(`Teşekkürler! +${FEED_POINTS} puan kazandınız.`, 'success');
    }
    openDetailModal(animals[idx]);
  });

  // Koruyucu ol
  $('guardian-btn').addEventListener('click', () => {
    if (!currentViewedAnimal) return;
    const name = prompt('Koruyucu olmak için lütfen isminizi veya takma adınızı girin:');
    if (!name || !name.trim()) return;
    const idx = animals.findIndex(a => a.id === currentViewedAnimal.id);
    if (idx === -1) return;
    animals[idx] = { ...animals[idx], guardian: name.trim().slice(0, 40) };
    if (saveData()) {
      showToast('Teşekkürler! Artık bu canın koruyucusu olarak görünüyorsunuz. 🛡️', 'success');
      openDetailModal(animals[idx]);
    }
  });

  // Paylaş
  $('share-btn').addEventListener('click', async () => {
    const a = currentViewedAnimal;
    if (!a) return;
    vibrate(50);

    let text;
    if (a.type === 'station') {
      text = `${a.name} (${a.location}) mama/su istasyonunun durumu: ${a.stationState || 'bilinmiyor'}. Lütfen ilgilenelim!`;
    } else if (a.isSOS) {
      text = `ACİL: ${a.name} (${a.location}) kayıp veya acil durumda. Lütfen yardımcı olalım!`;
    } else if (a.isAdoptable) {
      text = `${a.name} yuva arıyor! (${a.location}). İletişim: ${a.contact || 'belirtilmedi'}`;
    } else {
      text = `Kampüsün can dostu ${a.name} (${a.location}) hakkında bilgi almak için Kampüs Patileri'ne göz atın.`;
    }
    const payload = { title: 'Kampüs Patileri', text, url: location.href.split('#')[0] };

    if (navigator.share) {
      try {
        await navigator.share(payload);
      } catch (err) {
        if (err.name !== 'AbortError') showToast('Paylaşım başarısız oldu.', 'error');
      }
    } else {
      const ok = await copyText(`${text}\n${payload.url}`);
      showToast(ok ? 'Paylaşım metni panoya kopyalandı.' : 'Bu tarayıcı paylaşımı desteklemiyor.', ok ? 'success' : 'error');
    }
  });

  // QR kod
  $('generate-qr-btn').addEventListener('click', () => {
    if (!currentViewedAnimal) return;
    const qrImg = $('m-qr-img');
    const qrHelp = $('m-qr-help');
    const data = encodeURIComponent(`Kampüs Patileri: ${currentViewedAnimal.name} (${currentViewedAnimal.location})`);
    qrImg.onload = () => { qrImg.hidden = false; qrHelp.hidden = false; };
    qrImg.onerror = () => {
      qrImg.hidden = true;
      qrHelp.hidden = true;
      showToast('QR kod oluşturulamadı. İnternet bağlantınızı kontrol edin.', 'error');
    };
    qrImg.src = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=0&qzone=1&data=${data}`;
  });
}

// ---------------------------------------------------------------------------
// Detay modalı
// ---------------------------------------------------------------------------
function setText(id, value, fallback = 'Belirtilmedi') {
  $(id).textContent = value && String(value).trim() ? value : fallback;
}

function openDetailModal(animal) {
  currentViewedAnimal = animal;
  const isStation = animal.type === 'station';

  const mImg = $('m-img');
  mImg.onerror = () => { if (mImg.src !== PLACEHOLDER_IMG) mImg.src = PLACEHOLDER_IMG; };
  mImg.src = animal.image || PLACEHOLDER_IMG;
  mImg.alt = animal.name;
  $('m-name').textContent = animal.name;
  setText('m-location', animal.location);

  // Koruyucu
  const hasGuardian = !isStation && !!animal.guardian;
  $('m-guardian-badge').hidden = !hasGuardian;
  $('m-guardian-name').textContent = hasGuardian ? animal.guardian : '';
  $('guardian-btn').hidden = isStation || hasGuardian;

  // Karakter etiketleri
  const traits = $('m-traits');
  traits.textContent = '';
  if (!isStation && Array.isArray(animal.traits)) {
    animal.traits.forEach(t => traits.appendChild(el('span', 'trait-capsule', t)));
  }

  // Rozetler
  $('m-sos-badge').hidden = isStation || !animal.isSOS;
  $('m-adopt-badge').hidden = isStation || !animal.isAdoptable;

  // Kartlar
  document.querySelectorAll('[data-animal-only]').forEach(card => { card.hidden = isStation; });
  $('m-station-card').hidden = !isStation;

  const feedBtn = $('feed-animal-btn');
  const lastFedEl = $('m-last-fed');
  feedBtn.textContent = '';
  if (isStation) {
    setText('m-station-state', animal.stationState, 'Bilinmiyor');
    feedBtn.append(icon('fa-solid fa-rotate'), ' Suyu/Mamayı Tazeledim');
    feedBtn.className = 'submit-btn btn-blue';
  } else {
    setText('m-age', animal.age, 'Bilinmiyor');
    setText('m-health', animal.health);
    setText('m-vaccine', animal.vaccine);
    feedBtn.append(icon('fa-solid fa-bone'), ' Bugün Mama Verdim');
    feedBtn.className = 'submit-btn btn-amber';

    const neuteredCard = $('m-neutered-card');
    const unneutered = isUnneutered(animal);
    neuteredCard.classList.toggle('status-danger', unneutered);
    setText('m-neutered', unneutered ? 'Kısırlaştırılmadı (Dikkat!)' : animal.neutered, 'Bilinmiyor');
  }

  const label = isStation ? 'Son yenilenme' : 'Son beslenme';
  lastFedEl.textContent = `${label}: ${animal.lastFed ? timeAgo(animal.lastFed) : 'Henüz veri yok'}`;
  lastFedEl.classList.toggle('fresh', !!animal.lastFed);

  // İletişim
  const showContact = !isStation && animal.isAdoptable;
  $('m-adopt-card').hidden = !showContact;
  if (showContact) setText('m-contact', animal.contact);

  // QR sıfırla
  $('m-qr-img').hidden = true;
  $('m-qr-img').removeAttribute('src');
  $('m-qr-help').hidden = true;

  openModal($('animal-modal'));
}
