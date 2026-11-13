// ============================================
// EVENTS & ANNOUNCEMENTS — Bridge Calvary Chapel
// ============================================

var siteContent = {};
var allEvents = [];
var allPrograms = [];
var allAnnouncements = [];
var allDevotions = [];

var SB_URL = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

var MAX_PROGRAMS = 4;
var _loadStarted = false;

// ---------- HELPERS ----------
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function secImg(name) { var s = siteContent[name] || {}; return s.image || s.image_url || s.hero_image || s.background_image || ''; }

async function sbFetch(path) {
    var res = await fetch(SB_URL + path, {
        headers: {
            'apikey': SB_KEY,
            'Authorization': 'Bearer ' + SB_KEY,
            'Accept': 'application/json'
        }
    });
    if (!res.ok) throw new Error('Supabase ' + res.status + ' — ' + path);
    var data = await res.json();
    return Array.isArray(data) ? data : [];
}

function emptyState(icon, title, msg) {
    return '<div class="empty-state"><i class="fas ' + icon + '"></i>'
        + '<h3>' + escapeHtml(title) + '</h3>'
        + '<p>' + escapeHtml(msg) + '</p></div>';
}

// ---------- MODAL ----------
window.openModal = function (html) {
    var overlay = document.getElementById('modalOverlay');
    var panel   = document.getElementById('modalPanel');
    var body    = document.getElementById('modalBody');
    if (!panel || !body || !overlay) return;
    body.innerHTML = html;
    overlay.classList.add('active');
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
};
window.closeModal = function () {
    var overlay = document.getElementById('modalOverlay');
    var panel   = document.getElementById('modalPanel');
    if (!panel) return;
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

// ---------- HERO ----------
function renderHero() {
    var h = siteContent.events_hero || {};
    setText('heroEyebrow', h.eyebrow || 'EVENTS & ANNOUNCEMENTS');
    setText('heroDesc', h.description || "Join us as we worship, fellowship, grow, and serve together. Discover what's happening in the life of our church.");
    var titleEl = document.getElementById('heroTitle');
    if (titleEl) {
        titleEl.innerHTML = escapeHtml(h.title_line1 || 'Stay Connected.') +
            ' <span class="accent">' + escapeHtml(h.title_line2 || "Be Part of What's Next.") + '</span>';
    }
    var url = secImg('events_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// ---------- CHURCH PROGRAMS ----------
function renderPrograms() {
    var grid = document.getElementById('programsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!allPrograms.length) {
        grid.innerHTML = emptyState('fa-church', 'No programs published yet', 'New church programs will appear here once added.');
        return;
    }

    grid.innerHTML = allPrograms.slice(0, MAX_PROGRAMS).map(function (p, idx) {
        var lines = (p.schedule || '').split('\n').filter(Boolean);
        var schedHtml = lines.map(function (l) {
            return '<span class="sched-line"><i class="fas fa-clock"></i> ' + escapeHtml(l) + '</span>';
        }).join('');

        var statusText = p.day_of_week ? p.day_of_week.toUpperCase() : 'WEEKLY';
        var statusClass = p.day_of_week ? '' : ' upcoming';

        return '<article class="program-card" data-program="' + idx + '" role="button" tabindex="0">'
            + '<span class="program-status' + statusClass + '">' + escapeHtml(statusText) + '</span>'
            + '<div class="program-icon"><i class="fas ' + escapeHtml(p.icon || 'fa-church') + '"></i></div>'
            + '<div class="program-title">' + escapeHtml(p.title || '') + '</div>'
            + '<div class="program-divider"></div>'
            + (schedHtml ? '<div class="program-sched">' + schedHtml + '</div>' : '')
            + (p.location ? '<span class="program-loc"><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(p.location) + '</span>' : '')
            + '<p class="program-desc">' + escapeHtml(p.description || '') + '</p>'
            + '<button class="btn-join" type="button" data-join-program="' + idx + '">Learn More <i class="fas fa-arrow-right"></i></button>'
            + '</article>';
    }).join('');

    bindCards(grid, 'data-program', 'data-join-program', allPrograms, openProgramDetails);
}

function openProgramDetails(p) {
    if (!p) return;
    var lines = (p.schedule || '').split('\n').filter(Boolean);
    var schedHtml = lines.map(function (l) {
        return '<p class="detail-line"><i class="fas fa-clock"></i> ' + escapeHtml(l) + '</p>';
    }).join('');

    var html = ''
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper"><i class="fas ' + escapeHtml(p.icon || 'fa-church') + '"></i></div>'
        +   '<h2>' + escapeHtml(p.title || '') + '</h2>'
        +   '<p class="modal-welcome">' + escapeHtml(p.welcome_message || 'Welcome! We are so glad you want to join us.') + '</p>'
        +   '<div class="modal-section-label">Details</div>'
        +   schedHtml
        +   (p.location ? '<p><strong><i class="fas fa-map-marker-alt"></i> Location:</strong> ' + escapeHtml(p.location) + '</p>' : '')
        +   (p.description ? '<p><strong>About:</strong> ' + escapeHtml(p.description) + '</p>' : '')
        +   (p.details ? '<p><strong>More:</strong> ' + escapeHtml(p.details) + '</p>' : '')
        +   '<div class="modal-section-label">Follow Us</div>'
        +   '<p>Stay connected with our church channel for updates and live streams.</p>'
        +   '<div class="modal-actions">'
        +     '<a href="https://youtube.com/@thebridgecalvarychapel-2" target="_blank" rel="noopener" class="modal-btn modal-btn-primary"><i class="fab fa-youtube"></i> Subscribe</a>'
        +     '<button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button>'
        +   '</div>'
        + '</div>';
    openModal(html);
}

// ---------- UPCOMING EVENTS ----------
function renderEvents() {
    var grid = document.getElementById('eventsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!allEvents.length) {
        grid.innerHTML = emptyState('fa-calendar-check', 'No events published yet', 'Upcoming events will appear here.');
        return;
    }

    grid.innerHTML = allEvents.map(function (e, idx) {
        return '<article class="event-card" data-event="' + idx + '" role="button" tabindex="0">'
            + '<div class="event-image">'
            +   (e.image_url ? '<img src="' + escapeHtml(e.image_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '')
            +   '<div class="event-date-badge"><span class="event-badge-month">' + escapeHtml(e.month_label || '') + '</span><span class="event-badge-day">' + escapeHtml(e.day_label || '') + '</span></div>'
            +   (e.category ? '<span class="event-cat-badge">' + escapeHtml(e.category) + '</span>' : '')
            + '</div>'
            + '<h3 class="event-title">' + escapeHtml(e.title || '') + '</h3>'
            + '<div class="event-meta-block">'
            +   (e.time_label ? '<span class="event-loc"><i class="fas fa-clock"></i> ' + escapeHtml(e.time_label) + '</span>' : '')
            +   (e.location ? '<span class="event-loc"><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location) + '</span>' : '')
            + '</div>'
            + '<p class="event-desc">' + escapeHtml(e.description || '') + '</p>'
            + '<button class="btn-event" type="button" data-details="' + idx + '">View Details <i class="fas fa-arrow-right"></i></button>'
            + '</article>';
    }).join('');

    bindCards(grid, 'data-event', 'data-details', allEvents, openEventDetails);
}

function openEventDetails(e) {
    if (!e) return;
    var html = ''
        + (e.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(e.image_url) + '" alt="">' : '')
        + '<div class="modal-content">'
        +   (e.category ? '<span class="event-tag">' + escapeHtml(e.category) + '</span>' : '')
        +   '<h2>' + escapeHtml(e.title || '') + '</h2>'
        +   '<p><strong>Date:</strong> ' + escapeHtml((e.month_label || '') + ' ' + (e.day_label || '')) + '</p>'
        +   (e.time_label ? '<p><strong>Time:</strong> ' + escapeHtml(e.time_label) + '</p>' : '')
        +   (e.location ? '<p><strong>Location:</strong> ' + escapeHtml(e.location) + '</p>' : '')
        +   (e.organizer ? '<p><strong>Organizer:</strong> ' + escapeHtml(e.organizer) + '</p>' : '')
        +   '<p>' + escapeHtml(e.description || '') + '</p>'
        +   '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html);
}

// ---------- DEVOTIONS ----------
function renderDevotions() {
    var grid = document.getElementById('devotionGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!allDevotions.length) {
        grid.innerHTML = emptyState('fa-book-bible', 'No devotions published yet', 'Daily inspiration will appear here.');
        return;
    }

    grid.innerHTML = allDevotions.map(function (d, idx) {
        return '<div class="devotion-card" data-devotion="' + idx + '" role="button" tabindex="0">'
            + '<div class="devotion-image">'
            +   (d.image_url ? '<img src="' + escapeHtml(d.image_url) + '" alt="" loading="lazy" onerror="this.style.display=\'none\'">' : '')
            + '</div>'
            + '<h3 class="devotion-title">' + escapeHtml(d.title || '') + '</h3>'
            + '<div class="devotion-meta"><span class="devotion-ref">' + escapeHtml(d.verse_reference || '') + '</span></div>'
            + '<p class="devotion-intro">' + escapeHtml(d.reflection || '') + '</p>'
            + '<span class="btn-read-more">Read More <i class="fas fa-arrow-right"></i></span>'
            + '</div>';
    }).join('');

    bindCards(grid, 'data-devotion', null, allDevotions, openDevotionPanel);
}

function openDevotionPanel(d) {
    if (!d) return;
    var idx = allDevotions.indexOf(d);
    var html = ''
        + (d.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(d.image_url) + '" alt="">' : '')
        + '<div class="modal-content">'
        +   '<h2>' + escapeHtml(d.title || '') + '</h2>'
        +   (d.verse_reference ? '<p><strong>Scripture:</strong> ' + escapeHtml(d.verse_reference) + '</p>' : '')
        +   (d.verse_text ? '<blockquote class="verse-block">' + escapeHtml(d.verse_text) + '</blockquote>' : '')
        +   (d.reflection ? '<div class="modal-section-label">Reflection</div><p>' + escapeHtml(d.reflection) + '</p>' : '')
        +   (d.prayer ? '<div class="modal-section-label">Prayer</div><p>' + escapeHtml(d.prayer) + '</p>' : '')
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-whatsapp" onclick="shareDevotionWhatsApp(' + idx + ')" type="button"><i class="fab fa-whatsapp"></i> WhatsApp</button>'
        +     '<button class="modal-btn modal-btn-facebook" onclick="shareDevotionFacebook()" type="button"><i class="fab fa-facebook-f"></i> Facebook</button>'
        +     (d.image_url ? '<button class="modal-btn modal-btn-primary" onclick="downloadDevotionImage(' + idx + ')" type="button"><i class="fas fa-download"></i> Download</button>' : '')
        +     '<button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button>'
        +   '</div>'
        + '</div>';
    openModal(html);
}

window.shareDevotionWhatsApp = function (idx) {
    var d = allDevotions[idx]; if (!d) return;
    var text = '*' + (d.title || '') + '*\n\n' + (d.verse_reference || '') + '\n' + (d.verse_text || '') + '\n\nRead more: ' + window.location.href;
    window.open('https://wa.me/?text=' + encodeURIComponent(text), '_blank');
};
window.shareDevotionFacebook = function () {
    window.open('https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(window.location.href), '_blank', 'width=640,height=580');
};
window.downloadDevotionImage = async function (idx) {
    var d = allDevotions[idx];
    if (!d || !d.image_url) return;
    try {
        var res = await fetch(d.image_url, { mode: 'cors' });
        var blob = await res.blob();
        var url = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = url;
        a.download = ((d.title || 'devotion').replace(/[^\w\-]+/g, '_')) + '.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
    } catch (err) {
        window.open(d.image_url, '_blank');
    }
};

// ---------- THIS WEEK ----------
function renderWeekly() {
    var grid = document.getElementById('weeklyGrid');
    if (!grid) return;
    grid.innerHTML = '';

    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var keys = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    var today = new Date();
    var start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    grid.innerHTML = days.map(function (d, i) {
        var date = new Date(start);
        date.setDate(start.getDate() + i);

        var match = allPrograms.find(function (p) {
            if (p.day_of_week) {
                var dayList = p.day_of_week.toLowerCase().split(',');
                if (dayList.indexOf(keys[i]) !== -1) return true;
            }
            var hay = ((p.schedule || '') + ' ' + (p.title || '')).toLowerCase();
            return hay.indexOf(keys[i]) !== -1;
        });

        var eventName = match ? (match.title || '—') : '—';
        var time = match ? firstTimeFromSchedule(match.schedule || '') : '';
        var isToday = (i === today.getDay());

        return '<div class="week-card' + (isToday ? ' today' : '') + '">'
            + '<div class="week-day">' + d + '</div>'
            + '<div class="week-date">' + date.getDate() + '</div>'
            + '<div class="week-event">' + escapeHtml(eventName) + '</div>'
            + (time ? '<div class="week-time">' + escapeHtml(time) + '</div>' : '')
            + '</div>';
    }).join('');
}

function firstTimeFromSchedule(schedule) {
    var line = (schedule || '').split('\n')[0] || '';
    var m = line.match(/\d{1,2}:\d{2}\s*(AM|PM)(\s*[–-]\s*\d{1,2}:\d{2}\s*(AM|PM))?/i);
    return m ? m[0].replace(/\s+/g, ' ').trim() : '';
}

// ---------- ANNOUNCEMENTS (SQUARE CARDS) ----------
function renderAnnouncements() {
    var grid = document.getElementById('announcementsGrid');
    if (!grid) return;
    grid.innerHTML = '';

    if (!allAnnouncements.length) {
        grid.innerHTML = emptyState('fa-bullhorn', 'No announcements yet', 'Church announcements will appear here.');
        return;
    }

    grid.innerHTML = allAnnouncements.map(function (a, idx) {
        return '<div class="announcement-card" data-ann="' + idx + '" role="button" tabindex="0">'
            + '<div class="announcement-icon"><i class="fas fa-bullhorn"></i></div>'
            + '<h4 class="announcement-title">' + escapeHtml(a.title || '') + '</h4>'
            + '<div class="announcement-meta">'
            +   ((a.month_label || a.day_label) ? '<span class="announcement-date"><i class="fas fa-calendar-alt"></i> ' + escapeHtml(((a.month_label || '') + ' ' + (a.day_label || '')).trim()) + '</span>' : '')
            +   (a.category ? '<span class="ann-cat-badge">' + escapeHtml(a.category) + '</span>' : '')
            + '</div>'
            + '<p class="announcement-desc">' + escapeHtml(a.summary || '') + '</p>'
            + '<span class="announcement-link">Read More <i class="fas fa-arrow-right"></i></span>'
            + '</div>';
    }).join('');

    bindCards(grid, 'data-ann', null, allAnnouncements, openAnnouncementModal);
}

function openAnnouncementModal(a) {
    if (!a) return;
    var html = ''
        + (a.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(a.image_url) + '" alt="">' : '')
        + '<div class="modal-content">'
        +   (a.category ? '<span class="event-tag">' + escapeHtml(a.category) + '</span>' : '')
        +   '<h2>' + escapeHtml(a.title || '') + '</h2>'
        +   ((a.month_label || a.day_label) ? '<p><strong>Date:</strong> ' + escapeHtml(((a.month_label || '') + ' ' + (a.day_label || '')).trim()) + '</p>' : '')
        +   '<p>' + escapeHtml(a.full_content || a.summary || '') + '</p>'
        +   '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html);
}

// ---------- BIND CARDS ----------
function bindCards(grid, cardAttr, btnAttr, arr, openFn) {
    if (btnAttr) {
        grid.querySelectorAll('[' + btnAttr + ']').forEach(function (btn) {
            btn.addEventListener('click', function (e) {
                e.stopPropagation();
                openFn(arr[parseInt(btn.getAttribute(btnAttr), 10)]);
            });
        });
    }
    grid.querySelectorAll('[' + cardAttr + ']').forEach(function (card) {
        var go = function () { openFn(arr[parseInt(card.getAttribute(cardAttr), 10)]); };
        card.addEventListener('click', go);
        card.addEventListener('keydown', function (ev) {
            if (ev.key === 'Enter' || ev.key === ' ') { ev.preventDefault(); go(); }
        });
    });
}

// ---------- LOAD ----------
async function loadEventsData() {
    if (_loadStarted) return;
    _loadStarted = true;

    try {
        if (window.db && typeof window.db.getSiteContent === 'function') {
            try { siteContent = (await window.db.getSiteContent()) || {}; } catch (e) { siteContent = {}; }
        }
    } catch (e) { siteContent = {}; }

    renderHero();

    var results = await Promise.all([
        sbFetch('events?select=*&is_published=eq.true&order=display_order.asc').catch(function (e) { console.warn('events:', e.message); return []; }),
        sbFetch('church_programs?select=*&is_published=eq.true&order=display_order.asc').catch(function (e) { console.warn('programs:', e.message); return []; }),
        sbFetch('devotions?select=*&is_published=eq.true&order=devotion_date.desc').catch(function (e) { console.warn('devotions:', e.message); return []; }),
        sbFetch('announcements?select=*&is_published=eq.true&order=display_order.asc').catch(function (e) { console.warn('announcements:', e.message); return []; })
    ]);

    allEvents        = results[0];
    allPrograms      = results[1];
    allDevotions     = results[2];
    allAnnouncements = results[3];

    renderPrograms();
    renderEvents();
    renderDevotions();
    renderWeekly();
    renderAnnouncements();
}

// ---------- BOOT ----------
if (window.db) setTimeout(loadEventsData, 100);
else window.addEventListener('supabase-ready', loadEventsData);
document.addEventListener('DOMContentLoaded', function () {
    if (!window.db) setTimeout(loadEventsData, 300);
});

// ---------- DOM READY ----------
document.addEventListener('DOMContentLoaded', function () {
    var navToggle = document.getElementById('navToggle');
    var navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) {
        navToggle.addEventListener('click', function () {
            navMenu.classList.toggle('active');
            var icon = navToggle.querySelector('i');
            if (icon) { icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-times'); }
            navToggle.setAttribute('aria-expanded', navMenu.classList.contains('active') ? 'true' : 'false');
        });
    }
    var overlay  = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay)  overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    var nl = document.getElementById('footerNewsletter');
    if (nl) nl.addEventListener('submit', function (e) { e.preventDefault(); alert('Thank you for subscribing!'); nl.reset(); });
    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});