// ============================================
// SERMONS PAGE — Bridge Calvary Chapel
// File: js/sermons.js
// ============================================

var siteContent = {};
var allSermons = [];
var filteredSermons = [];
var currentCategory = 'all';
var currentSearch = '';
var visibleCount = 6;
var LOAD_INCREMENT = 6;

var CATEGORIES = [
    { key: 'all', label: 'All' },
    { key: 'sunday', label: 'Sunday Services' },
    { key: 'bible-study', label: 'Bible Study' },
    { key: 'special', label: 'Special Services' },
    { key: 'youth', label: 'Youth' },
    { key: 'worship', label: 'Worship' },
    { key: 'guest', label: 'Guest Speakers' }
];

function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function secImg(name) { var s = siteContent[name] || {}; return s.image || s.hero_image || s.background_image || ''; }

window.openModal = function (html) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    if (!panel || !body) return;
    body.innerHTML = html;
    overlay.classList.add('active');
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var c = panel.querySelector('.modal-panel-close');
    if (c) c.focus();
};
window.closeModal = function () {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    if (!panel) return;
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

function getCategoryFromTitle(title) {
    var t = (title || '').toLowerCase();
    if (t.indexOf('sunday') > -1 || t.indexOf('school') > -1 || t.indexOf('kingdom') > -1 || t.indexOf('coming') > -1) return 'sunday';
    if (t.indexOf('bible') > -1 || t.indexOf('heaven') > -1) return 'bible-study';
    if (t.indexOf('youth') > -1 || t.indexOf('lutindo') > -1) return 'youth';
    if (t.indexOf('worship') > -1 || t.indexOf('praise') > -1) return 'worship';
    if (t.indexOf('special') > -1 || t.indexOf('communion') > -1) return 'special';
    if (t.indexOf('guest') > -1) return 'guest';
    return 'sunday';
}
function getCategoryLabel(key) { var c = CATEGORIES.find(function (x) { return x.key === key; }); return c ? c.label : key; }

// ============================================
// HERO
// ============================================
function renderHero() {
    var h = siteContent.sermons_hero || {};
    setText('heroEyebrow', h.eyebrow);
    setText('heroLine1', h.title_line1);
    setText('heroLine2', h.title_line2);
    setText('heroScript', h.script_line);
    var url = secImg('sermons_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var n = h['stat' + i + '_number'];
        var l = h['stat' + i + '_label'];
        var ic = h['stat' + i + '_icon'];
        if (!n) continue;
        statsHTML += '<div class="hero-stat"><div class="hero-stat-icon"><i class="fas ' + (ic || 'fa-star') + '"></i></div><div class="hero-stat-info"><span class="hero-stat-number">' + escapeHtml(n) + '</span><span class="hero-stat-label">' + escapeHtml(l || '') + '</span></div></div>';
    }
    setHTML('heroStats', statsHTML);
    var yt = h.youtube_url || '#';
    var btnHeroYT = document.getElementById('btnYouTubeHero');
    if (btnHeroYT) btnHeroYT.href = yt;
}

// ============================================
// SUBSCRIBE CARD
// ============================================
function renderSubscribeCard() {
    var s = siteContent.sermons_sidebar_sub || {};
    setText('subTitle', s.title || 'Watch. Learn. Grow.');
    setText('subDesc', s.description);
    setText('subNote', s.note);
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var n = s['stat' + i + '_number'];
        var l = s['stat' + i + '_label'];
        if (!n) continue;
        statsHTML += '<div class="subscribe-stat"><span class="subscribe-stat-number">' + escapeHtml(n) + '</span><span class="subscribe-stat-label">' + escapeHtml(l || '') + '</span></div>';
    }
    setHTML('subStats', statsHTML);
    var yt = s.youtube_url || '#';
    var btn = document.getElementById('btnSubscribeHero');
    if (btn) btn.href = yt;
}

// ============================================
// SIDEBAR
// ============================================
function renderSidebar() {
    var s = siteContent.sermons_sidebar_sub || {};
    setText('sideSubTitle', s.title);
    setText('sideSubDesc', s.description);
    setText('sideSubNote', s.note);
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var n = s['stat' + i + '_number'];
        var l = s['stat' + i + '_label'];
        if (!n) continue;
        statsHTML += '<div class="sidebar-stat"><div class="sidebar-stat-icon"><i class="fas fa-users"></i></div><span class="sidebar-stat-number">' + escapeHtml(n) + '</span><span class="sidebar-stat-label">' + escapeHtml(l || '') + '</span></div>';
    }
    setHTML('sideSubStats', statsHTML);
    var btn = document.getElementById('btnSubscribeSide');
    if (btn) btn.href = s.youtube_url || '#';
}

// ============================================
// VERSES
// ============================================
function renderVerses() {
    var vs = siteContent.sermons_verses || {};
    setText('versesTitle', vs.title);
    var html = '';
    for (var i = 1; i <= 3; i++) {
        var v = siteContent['sermons_verse_' + i];
        if (!v) continue;
        html += '<div class="verse-mini" data-verse="' + i + '" tabindex="0" role="button"><span class="verse-mini-quote">"</span><p class="verse-mini-text">' + escapeHtml(v.text || '') + '</p><span class="verse-mini-ref">' + escapeHtml(v.reference || '') + '</span></div>';
    }
    setHTML('versesList', html);
    document.querySelectorAll('[data-verse]').forEach(function (el) {
        var open = function () {
            var v = siteContent['sermons_verse_' + el.dataset.verse];
            if (!v) return;
            openModal('<h2>' + escapeHtml(v.reference || '') + '</h2><div class="modal-scripture"><p>' + escapeHtml(v.text || '') + '</p></div>' + (v.reflection ? '<p class="modal-description"><strong>Reflection:</strong> ' + escapeHtml(v.reflection) + '</p>' : ''));
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

// ============================================
// BANNER
// ============================================
function renderBanner() {
    var b = siteContent.sermons_banner || {};
    setText('bannerLabel', b.label);
    setText('bannerTitle', b.title);
    setText('bannerDesc', b.description);
    var url = secImg('sermons_banner');
    if (url) { var bg = document.getElementById('bannerBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
    var btn = document.getElementById('btnBannerYouTube');
    if (btn) btn.href = b.youtube_url || '#';
}

// ============================================
// FEATURED HEADER
// ============================================
function renderFeaturedHeader() {
    var f = siteContent.sermons_featured || {};
    setText('featuredLabel', f.label);
    setText('featuredTitle', f.title);
    setText('featuredTagline', f.tagline);
}

// ============================================
// FILTER TABS
// ============================================
function renderFilterTabs() {
    var tabs = document.getElementById('filterTabs');
    if (!tabs) return;
    tabs.innerHTML = CATEGORIES.map(function (c) {
        return '<button class="filter-tab' + (c.key === 'all' ? ' active' : '') + '" data-cat="' + c.key + '" type="button">' + c.label + '</button>';
    }).join('');
    tabs.querySelectorAll('.filter-tab').forEach(function (tab) {
        tab.addEventListener('click', function () {
            tabs.querySelectorAll('.filter-tab').forEach(function (t) { t.classList.remove('active'); });
            tab.classList.add('active');
            currentCategory = tab.dataset.cat;
            visibleCount = LOAD_INCREMENT;
            applyFilters();
        });
    });
}

function applyFilters() {
    filteredSermons = allSermons.slice();
    if (currentCategory !== 'all') filteredSermons = filteredSermons.filter(function (s) { return getCategoryFromTitle(s.title) === currentCategory; });
    if (currentSearch.trim()) {
        var q = currentSearch.toLowerCase().trim();
        filteredSermons = filteredSermons.filter(function (s) {
            return (s.title || '').toLowerCase().indexOf(q) > -1 || (s.speaker || '').toLowerCase().indexOf(q) > -1 || (s.date_label || '').toLowerCase().indexOf(q) > -1;
        });
    }
    renderSermonGrid();
}

function renderSermonGrid() {
    var grid = document.getElementById('sermonGrid');
    if (!grid) return;
    if (!filteredSermons.length) {
        grid.innerHTML = '<div class="empty-state"><i class="fas fa-search"></i>No sermons match your search or filter.</div>';
        setText('libraryCount', '');
        var lm = document.getElementById('btnLoadMore');
        if (lm) lm.style.display = 'none';
        return;
    }
    var visible = filteredSermons.slice(0, visibleCount);
    grid.innerHTML = visible.map(function (s, idx) {
        var cat = getCategoryFromTitle(s.title);
        return '<article class="sermon-card" data-idx="' + idx + '" tabindex="0" role="button">'
            + '<div class="sermon-thumb"><img src="' + escapeHtml(s.thumbnail_url || '') + '" alt="" onerror="this.style.display=\'none\'"><span class="sermon-badge-cat ' + cat + '">' + getCategoryLabel(cat) + '</span><span class="sermon-badge-dur">' + escapeHtml(s.duration || '') + '</span></div>'
            + '<div class="sermon-body"><h3 class="sermon-title">' + escapeHtml(s.title || '') + '</h3>'
            + '<div class="sermon-meta"><i class="fas fa-user"></i><span>' + escapeHtml(s.speaker || '') + '</span></div>'
            + '<div class="sermon-meta"><i class="fas fa-calendar"></i><span>' + escapeHtml(s.date_label || '') + '</span></div>'
            + '<p class="sermon-desc">' + escapeHtml(s.description || 'Click to watch this sermon.') + '</p>'
            + '<button class="btn-watch" type="button"><i class="fas fa-play"></i> Watch Video <i class="fas fa-arrow-right"></i></button></div></article>';
    }).join('');
    setText('libraryCount', 'Showing ' + visible.length + ' of ' + filteredSermons.length + ' sermons');
    var lm = document.getElementById('btnLoadMore');
    if (lm) lm.style.display = (visibleCount >= filteredSermons.length) ? 'none' : 'inline-flex';

    grid.querySelectorAll('.sermon-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn-watch')) return;
            openSermonModal(visible[parseInt(card.dataset.idx, 10)]);
        });
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openSermonModal(visible[parseInt(card.dataset.idx, 10)]); } });
    });
    grid.querySelectorAll('.btn-watch').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            openVideo(visible[parseInt(btn.closest('.sermon-card').dataset.idx, 10)]);
        });
    });
}

function openSermonModal(s) {
    if (!s) return;
    var cat = getCategoryFromTitle(s.title);
    var html = ''
        + '<img class="modal-panel-image" src="' + escapeHtml(s.thumbnail_url || '') + '" alt="" onerror="this.style.display=\'none\'">'
        + '<h2>' + escapeHtml(s.title || '') + '</h2>'
        + '<div class="modal-meta-row"><span><i class="fas fa-user"></i> ' + escapeHtml(s.speaker || '') + '</span><span><i class="fas fa-calendar"></i> ' + escapeHtml(s.date_label || '') + '</span><span><i class="fas fa-clock"></i> ' + escapeHtml(s.duration || '') + '</span><span><i class="fas fa-tag"></i> ' + getCategoryLabel(cat) + '</span></div>'
        + '<p class="modal-description">' + escapeHtml(s.description || 'Watch this sermon to be encouraged and transformed by God\'s Word.') + '</p>'
        + '<div class="modal-actions"><a class="modal-btn" href="' + escapeHtml(s.video_url || '#') + '" target="_blank" rel="noopener"><i class="fab fa-youtube"></i> Watch Full Sermon</a></div>';
    openModal(html);
}
function openVideo(s) { if (s && s.video_url) window.open(s.video_url, '_blank', 'noopener'); }

// ============================================
// FEATURED CARDS
// ============================================
function renderFeaturedCards() {
    var grid = document.getElementById('featuredCards');
    if (!grid) return;
    var top3 = allSermons.slice(0, 3);
    grid.innerHTML = top3.map(function (s, idx) {
        return '<div class="featured-card" data-idx="' + idx + '" tabindex="0" role="button"><div class="featured-thumb"><img src="' + escapeHtml(s.thumbnail_url || '') + '" alt="" onerror="this.style.display=\'none\'"><div class="featured-play"><i class="fas fa-play"></i></div><span class="featured-dur">' + escapeHtml(s.duration || '') + '</span></div><div class="featured-body"><h4>' + escapeHtml(s.title || '') + '</h4><p>' + escapeHtml(s.speaker || '') + ' • ' + escapeHtml(s.date_label || '') + '</p></div></div>';
    }).join('');
    grid.querySelectorAll('.featured-card').forEach(function (card) {
        var open = function () { openSermonModal(top3[parseInt(card.dataset.idx, 10)]); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

// ============================================
// FOOTER
// ============================================
function renderFooter() {
    var f = siteContent.footer || {};
    setText('footerTagline', f.tagline);
    setText('footerPhone', f.phone);
    setText('footerEmail', f.email);
    setText('footerAddress', f.address);
    setText('footerCopyrightName', f.copyright_name);
}

// ============================================
// LOAD
// ============================================
async function loadSermonsData() {
    console.log('📥 Loading sermons data...');
    try {
        var results = await Promise.all([window.db.getSiteContent(), window.db.getSermons()]);
        siteContent = results[0] || {};
        allSermons = results[1] || [];
        filteredSermons = allSermons.slice();
        renderHero(); renderSubscribeCard(); renderSidebar(); renderVerses(); renderBanner(); renderFeaturedHeader(); renderFilterTabs(); applyFilters(); renderFeaturedCards(); renderFooter();
        console.log('✅ Sermons loaded: ' + allSermons.length);
    } catch (err) { console.error('❌ Sermons load error:', err); }
}

if (window.db) setTimeout(loadSermonsData, 100);
else window.addEventListener('supabase-ready', loadSermonsData);
setTimeout(function () { if (window.db && allSermons.length === 0) loadSermonsData(); }, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ sermons.js initialized');
    var navbar = document.getElementById('navbar');
    if (navbar) window.addEventListener('scroll', function () { navbar.style.boxShadow = window.pageYOffset > 40 ? '0 8px 24px rgba(4,26,58,0.4)' : 'none'; }, { passive: true });
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            var open = navMenu.classList.toggle('active');
            navToggle.setAttribute('aria-expanded', open);
            var icon = navToggle.querySelector('i');
            icon.classList.toggle('fa-bars', !open);
            icon.classList.toggle('fa-times', open);
        });
    }
    var search = document.getElementById('searchInput');
    if (search) search.addEventListener('input', function () { currentSearch = this.value; visibleCount = LOAD_INCREMENT; applyFilters(); });
    var btnLoad = document.getElementById('btnLoadMore');
    if (btnLoad) btnLoad.addEventListener('click', function () { visibleCount += LOAD_INCREMENT; renderSermonGrid(); });
    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    var news = document.getElementById('footerNewsletter');
    if (news) {
        news.addEventListener('submit', async function (e) {
            e.preventDefault();
            var input = news.querySelector('input[type="email"]');
            var email = input.value.trim();
            if (!email || email.indexOf('@') === -1) { alert('Please enter a valid email.'); return; }
            try {
                var r = await window.db.subscribeNewsletter(email);
                alert(r.duplicate ? 'You are already subscribed!' : '✅ Thank you for subscribing!');
                input.value = '';
            } catch (err) { console.error(err); alert('❌ Something went wrong.'); }
        });
    }
    var y = document.getElementById('currentYear'); if (y) y.textContent = new Date().getFullYear();
});