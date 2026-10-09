// ============================================
// SERMONS PAGE — BRIDGE CALVARY CHAPEL
// File: js/sermons.js
// ============================================

var heroContent = {};
var sidebarContent = {};
var versesContent = {};
var bannerContent = {};
var featuredContent = {};
var footerContent = {};
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

// ============================================
// MODAL
// ============================================
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

// ============================================
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val) el.innerHTML = val; }

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

function getCategoryLabel(key) {
    var c = CATEGORIES.find(function (x) { return x.key === key; });
    return c ? c.label : key;
}

// ============================================
// RENDER HERO
// ============================================
function renderHero() {
    setText('heroEyebrow', heroContent.eyebrow);
    setText('heroLine1', heroContent.title_line1);
    setText('heroLine2', heroContent.title_line2);
    setText('heroScript', heroContent.script_line);

    if (heroContent.hero_image) {
        var bg = document.getElementById('heroBg');
        if (bg) bg.style.backgroundImage = 'url("' + heroContent.hero_image + '")';
    }

    // Stats
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var n = heroContent['stat' + i + '_number'];
        var l = heroContent['stat' + i + '_label'];
        var ic = heroContent['stat' + i + '_icon'];
        if (!n) continue;
        statsHTML += '<div class="hero-stat">'
            + '<div class="hero-stat-icon"><i class="fas ' + (ic || 'fa-star') + '"></i></div>'
            + '<div class="hero-stat-info">'
            +   '<span class="hero-stat-number">' + n + '</span>'
            +   '<span class="hero-stat-label">' + (l || '') + '</span>'
            + '</div>'
            + '</div>';
    }
    setHTML('heroStats', statsHTML);

    // YouTube links
    var yt = heroContent.youtube_url || '#';
    var btnHeroYT = document.getElementById('btnYouTubeHero');
    if (btnHeroYT) btnHeroYT.href = yt;
}

// ============================================
// RENDER SUBSCRIBE CARD
// ============================================
function renderSubscribeCard() {
    setText('subTitle', sidebarContent.title || 'Watch. Learn. Grow.');
    setText('subDesc', sidebarContent.description);
    setText('subNote', sidebarContent.note);

    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var n = sidebarContent['stat' + i + '_number'];
        var l = sidebarContent['stat' + i + '_label'];
        if (!n) continue;
        statsHTML += '<div class="subscribe-stat">'
            + '<span class="subscribe-stat-number">' + n + '</span>'
            + '<span class="subscribe-stat-label">' + (l || '') + '</span>'
            + '</div>';
    }
    setHTML('subStats', statsHTML);

    var yt = sidebarContent.youtube_url || '#';
    var btn = document.getElementById('btnSubscribeHero');
    if (btn) btn.href = yt;
}

// ============================================
// RENDER SIDEBAR
// ============================================
function renderSidebar() {
    setText('sideSubTitle', sidebarContent.title);
    setText('sideSubDesc', sidebarContent.description);
    setText('sideSubNote', sidebarContent.note);

    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var n = sidebarContent['stat' + i + '_number'];
        var l = sidebarContent['stat' + i + '_label'];
        if (!n) continue;
        statsHTML += '<div class="sidebar-stat">'
            + '<div class="sidebar-stat-icon"><i class="fas fa-users"></i></div>'
            + '<span class="sidebar-stat-number">' + n + '</span>'
            + '<span class="sidebar-stat-label">' + (l || '') + '</span>'
            + '</div>';
    }
    setHTML('sideSubStats', statsHTML);

    var yt = sidebarContent.youtube_url || '#';
    var btn = document.getElementById('btnSubscribeSide');
    if (btn) btn.href = yt;
}

// ============================================
// RENDER VERSES
// ============================================
function renderVerses() {
    setText('versesTitle', versesContent.title);

    var html = '';
    for (var i = 1; i <= 3; i++) {
        var t = versesContent['verse_' + i] ? versesContent['verse_' + i].text : null;
        var r = versesContent['verse_' + i] ? versesContent['verse_' + i].reference : null;
        var ref = versesContent['verse_' + i] ? versesContent['verse_' + i].reflection : '';
        if (!t) continue;
        html += '<div class="verse-mini" data-verse="' + i + '" tabindex="0" role="button">'
            + '<span class="verse-mini-quote">"</span>'
            + '<p class="verse-mini-text">' + t + '</p>'
            + '<span class="verse-mini-ref">' + (r || '') + '</span>'
            + '</div>';
    }
    setHTML('versesList', html);

    document.querySelectorAll('[data-verse]').forEach(function (el) {
        var open = function () {
            var n = el.dataset.verse;
            var v = versesContent['verse_' + n];
            if (!v) return;
            var html = ''
                + '<h2>' + (v.reference || 'Bible Verse') + '</h2>'
                + '<div class="modal-scripture"><p>' + v.text + '</p></div>'
                + (v.reflection ? '<p class="modal-description"><strong>Reflection:</strong> ' + v.reflection + '</p>' : '');
            openModal(html);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER BANNER
// ============================================
function renderBanner() {
    setText('bannerLabel', bannerContent.label);
    setText('bannerTitle', bannerContent.title);
    setText('bannerDesc', bannerContent.description);

    if (bannerContent.background_image) {
        var bg = document.getElementById('bannerBg');
        if (bg) bg.style.backgroundImage = 'url("' + bannerContent.background_image + '")';
    }

    var btn = document.getElementById('btnBannerYouTube');
    if (btn) btn.href = bannerContent.youtube_url || '#';
}

// ============================================
// RENDER FEATURED HEADER
// ============================================
function renderFeaturedHeader() {
    setText('featuredLabel', featuredContent.label);
    setText('featuredTitle', featuredContent.title);
    setText('featuredTagline', featuredContent.tagline);
}

// ============================================
// RENDER FILTER TABS
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

// ============================================
// FILTER + SEARCH
// ============================================
function applyFilters() {
    filteredSermons = allSermons.slice();

    if (currentCategory !== 'all') {
        filteredSermons = filteredSermons.filter(function (s) {
            return getCategoryFromTitle(s.title) === currentCategory;
        });
    }

    if (currentSearch.trim()) {
        var q = currentSearch.toLowerCase().trim();
        filteredSermons = filteredSermons.filter(function (s) {
            return (s.title || '').toLowerCase().indexOf(q) > -1
                || (s.speaker || '').toLowerCase().indexOf(q) > -1
                || (s.date_label || '').toLowerCase().indexOf(q) > -1;
        });
    }

    renderSermonGrid();
}

// ============================================
// RENDER SERMON GRID
// ============================================
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
        var catLabel = getCategoryLabel(cat);
        var catClass = cat;
        return '<article class="sermon-card" data-idx="' + idx + '" tabindex="0" role="button">'
            + '<div class="sermon-thumb">'
            +   '<img src="' + (s.thumbnail_url || '') + '" alt="' + (s.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<span class="sermon-badge-cat ' + catClass + '">' + catLabel + '</span>'
            +   '<span class="sermon-badge-dur">' + (s.duration || '') + '</span>'
            + '</div>'
            + '<div class="sermon-body">'
            +   '<h3 class="sermon-title">' + (s.title || '') + '</h3>'
            +   '<div class="sermon-meta"><i class="fas fa-user"></i><span>' + (s.speaker || '') + '</span></div>'
            +   '<div class="sermon-meta"><i class="fas fa-calendar"></i><span>' + (s.date_label || '') + '</span></div>'
            +   '<p class="sermon-desc">' + (s.description || 'Click to watch this sermon.') + '</p>'
            +   '<button class="btn-watch" type="button"><i class="fas fa-play"></i> Watch Video <i class="fas fa-arrow-right"></i></button>'
            + '</div>'
            + '</article>';
    }).join('');

    setText('libraryCount', 'Showing ' + visible.length + ' of ' + filteredSermons.length + ' sermons');

    // Load more visibility
    var lm = document.getElementById('btnLoadMore');
    if (lm) {
        lm.style.display = (visibleCount >= filteredSermons.length) ? 'none' : 'inline-flex';
    }

    // Attach click handlers — card opens modal, watch button opens video
    grid.querySelectorAll('.sermon-card').forEach(function (card) {
        card.addEventListener('click', function (e) {
            if (e.target.closest('.btn-watch')) return;
            var idx = parseInt(card.dataset.idx, 10);
            openSermonModal(visible[idx]);
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                var idx = parseInt(card.dataset.idx, 10);
                openSermonModal(visible[idx]);
            }
        });
    });

    grid.querySelectorAll('.btn-watch').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var idx = parseInt(btn.closest('.sermon-card').dataset.idx, 10);
            openVideo(visible[idx]);
        });
    });
}

// ============================================
// OPEN SERMON DETAIL MODAL
// ============================================
function openSermonModal(s) {
    if (!s) return;
    var cat = getCategoryFromTitle(s.title);
    var catLabel = getCategoryLabel(cat);

    var html = ''
        + '<img class="modal-panel-image" src="' + (s.thumbnail_url || '') + '" alt="' + (s.title || '') + '" onerror="this.style.display=\'none\'">'
        + '<h2>' + (s.title || '') + '</h2>'
        + '<div class="modal-meta-row">'
        +   '<span><i class="fas fa-user"></i> ' + (s.speaker || '') + '</span>'
        +   '<span><i class="fas fa-calendar"></i> ' + (s.date_label || '') + '</span>'
        +   '<span><i class="fas fa-clock"></i> ' + (s.duration || '') + '</span>'
        +   '<span><i class="fas fa-tag"></i> ' + catLabel + '</span>'
        + '</div>'
        + '<p class="modal-description">' + (s.description || 'Watch this sermon to be encouraged and transformed by God\'s Word.') + '</p>'
        + '<div class="modal-actions">'
        +   '<a class="modal-btn" href="' + (s.video_url || '#') + '" target="_blank" rel="noopener">'
        +     '<i class="fab fa-youtube"></i> Watch Full Sermon'
        +   '</a>'
        + '</div>';

    openModal(html);
}

// ============================================
// OPEN VIDEO DIRECTLY
// ============================================
function openVideo(s) {
    if (!s || !s.video_url) return;
    window.open(s.video_url, '_blank', 'noopener');
}

// ============================================
// RENDER FEATURED CARDS
// ============================================
function renderFeaturedCards() {
    var grid = document.getElementById('featuredCards');
    if (!grid) return;
    var top3 = allSermons.slice(0, 3);
    grid.innerHTML = top3.map(function (s, idx) {
        return '<div class="featured-card" data-idx="' + idx + '" tabindex="0" role="button">'
            + '<div class="featured-thumb">'
            +   '<img src="' + (s.thumbnail_url || '') + '" alt="' + (s.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="featured-play"><i class="fas fa-play"></i></div>'
            +   '<span class="featured-dur">' + (s.duration || '') + '</span>'
            + '</div>'
            + '<div class="featured-body">'
            +   '<h4>' + (s.title || '') + '</h4>'
            +   '<p>' + (s.speaker || '') + ' &bull; ' + (s.date_label || '') + '</p>'
            + '</div>'
            + '</div>';
    }).join('');

    grid.querySelectorAll('.featured-card').forEach(function (card) {
        var open = function () {
            var idx = parseInt(card.dataset.idx, 10);
            openSermonModal(top3[idx]);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER FOOTER
// ============================================
function renderFooter() {
    setText('footerTagline', footerContent.tagline);
    setText('footerPhone', footerContent.phone);
    setText('footerEmail', footerContent.email);
    setText('footerAddress', footerContent.address);
    setText('footerCopyrightName', footerContent.copyright_name);
}

// ============================================
// LOAD ALL DATA
// ============================================
async function loadSermonsData() {
    console.log('📥 Loading sermons data...');
    try {
        var results = await Promise.all([
            window.db.getSiteContent(),
            window.db.getSermons()
        ]);

        var content = results[0] || {};
        allSermons = (results[1] || []).slice(); // slice to make a copy
        filteredSermons = allSermons.slice();

        // Extract sections
        heroContent = {
            eyebrow: content.sermons_hero ? content.sermons_hero.eyebrow : '',
            title_line1: content.sermons_hero ? content.sermons_hero.title_line1 : '',
            title_line2: content.sermons_hero ? content.sermons_hero.title_line2 : '',
            script_line: content.sermons_hero ? content.sermons_hero.script_line : '',
            stat1_number: content.sermons_hero ? content.sermons_hero.stat1_number : '',
            stat1_label: content.sermons_hero ? content.sermons_hero.stat1_label : '',
            stat1_icon: content.sermons_hero ? content.sermons_hero.stat1_icon : '',
            stat2_number: content.sermons_hero ? content.sermons_hero.stat2_number : '',
            stat2_label: content.sermons_hero ? content.sermons_hero.stat2_label : '',
            stat2_icon: content.sermons_hero ? content.sermons_hero.stat2_icon : '',
            stat3_number: content.sermons_hero ? content.sermons_hero.stat3_number : '',
            stat3_label: content.sermons_hero ? content.sermons_hero.stat3_label : '',
            stat3_icon: content.sermons_hero ? content.sermons_hero.stat3_icon : '',
            hero_image: content.sermons_hero ? content.sermons_hero.hero_image : '',
            youtube_url: content.sermons_hero ? content.sermons_hero.youtube_url : ''
        };

        sidebarContent = {
            title: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.title : '',
            description: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.description : '',
            stat1_number: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.stat1_number : '',
            stat1_label: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.stat1_label : '',
            stat2_number: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.stat2_number : '',
            stat2_label: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.stat2_label : '',
            stat3_number: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.stat3_number : '',
            stat3_label: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.stat3_label : '',
            note: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.note : '',
            youtube_url: content.sermons_sidebar_sub ? content.sermons_sidebar_sub.youtube_url : ''
        };

        versesContent = {
            title: content.sermons_verses ? content.sermons_verses.title : 'Bible Memory Verses',
            verse_1: {
                text: content.sermons_verse_1 ? content.sermons_verse_1.text : '',
                reference: content.sermons_verse_1 ? content.sermons_verse_1.reference : '',
                reflection: content.sermons_verse_1 ? content.sermons_verse_1.reflection : ''
            },
            verse_2: {
                text: content.sermons_verse_2 ? content.sermons_verse_2.text : '',
                reference: content.sermons_verse_2 ? content.sermons_verse_2.reference : '',
                reflection: content.sermons_verse_2 ? content.sermons_verse_2.reflection : ''
            },
            verse_3: {
                text: content.sermons_verse_3 ? content.sermons_verse_3.text : '',
                reference: content.sermons_verse_3 ? content.sermons_verse_3.reference : '',
                reflection: content.sermons_verse_3 ? content.sermons_verse_3.reflection : ''
            }
        };

        bannerContent = {
            label: content.sermons_banner ? content.sermons_banner.label : '',
            title: content.sermons_banner ? content.sermons_banner.title : '',
            description: content.sermons_banner ? content.sermons_banner.description : '',
            background_image: content.sermons_banner ? content.sermons_banner.background_image : '',
            youtube_url: content.sermons_banner ? content.sermons_banner.youtube_url : ''
        };

        featuredContent = {
            label: content.sermons_featured ? content.sermons_featured.label : '',
            title: content.sermons_featured ? content.sermons_featured.title : '',
            tagline: content.sermons_featured ? content.sermons_featured.tagline : ''
        };

        footerContent = content.footer || {};

        // Render everything
        renderHero();
        renderSubscribeCard();
        renderSidebar();
        renderVerses();
        renderBanner();
        renderFeaturedHeader();
        renderFilterTabs();
        applyFilters();
        renderFeaturedCards();
        renderFooter();

        console.log('✅ Sermons data loaded: ' + allSermons.length + ' sermons');
    } catch (err) {
        console.error('❌ Sermons load error:', err);
    }
}

window.addEventListener('supabase-ready', loadSermonsData);
setTimeout(function () {
    if (window.db && Object.keys(heroContent).length === 0) loadSermonsData();
}, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ sermons.js initialized');

    // Navbar scroll
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.style.boxShadow = window.pageYOffset > 40 ? '0 8px 24px rgba(3,27,67,0.4)' : 'none';
        }, { passive: true });
    }

    // Mobile menu
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

    // Search input
    var search = document.getElementById('searchInput');
    if (search) {
        search.addEventListener('input', function () {
            currentSearch = this.value;
            visibleCount = LOAD_INCREMENT;
            applyFilters();
        });
    }

    // Load more
    var btnLoad = document.getElementById('btnLoadMore');
    if (btnLoad) {
        btnLoad.addEventListener('click', function () {
            visibleCount += LOAD_INCREMENT;
            renderSermonGrid();
        });
    }

    // Modal close
    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    // Newsletter form
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
            } catch (err) {
                console.error(err);
                alert('❌ Something went wrong. Please try again.');
            }
        });
    }

    // Year
    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});