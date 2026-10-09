// ============================================
// EVENTS & ANNOUNCEMENTS — BRIDGE CALVARY CHAPEL
// File: js/events.js
// ============================================

var heroContent = {};
var weeklyContent = {};
var connectContent = {};
var footerContent = {};
var allEvents = [];
var allAnnouncements = [];

var CATEGORY_ICONS = {
    'Worship': 'fa-church',
    'Bible Study': 'fa-bible',
    'Youth': 'fa-users',
    'Prayer': 'fa-pray',
    'Outreach': 'fa-hands-helping',
    'Children': 'fa-child',
    'Missions': 'fa-globe-africa',
    'Special': 'fa-star'
};

var ANNOUNCEMENTS_URL = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/announcements?select=*&is_published=eq.true&order=display_order.asc&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

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
    panel.querySelectorAll('video').forEach(function (v) { try { v.pause(); } catch (e) {} });
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
};

// ============================================
// HELPERS
// ============================================
function setText(id, val) {
    var el = document.getElementById(id);
    if (el && val !== undefined && val !== null) el.textContent = val;
}

function getCategoryIcon(cat) {
    if (!cat) return 'fa-calendar-alt';
    for (var key in CATEGORY_ICONS) {
        if (cat.toLowerCase().indexOf(key.toLowerCase()) > -1) return CATEGORY_ICONS[key];
    }
    return 'fa-calendar-alt';
}

function escapeHtml(str) {
    if (!str) return '';
    return String(str)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

// ============================================
// RENDER HERO
// ============================================
function renderHero() {
    setText('heroEyebrow', heroContent.eyebrow);
    setText('heroLine1', heroContent.title_line1);
    setText('heroLine2', heroContent.title_line2);
    setText('heroSubtitle', heroContent.subtitle);
    setText('heroDescription', heroContent.description);

    var verseEl = document.getElementById('heroVerse');
    if (verseEl && heroContent.verse_text) {
        verseEl.innerHTML = escapeHtml(heroContent.verse_text) +
            '<span class="verse-ref">' + escapeHtml(heroContent.verse_reference || '') + '</span>';
    }

    if (heroContent.hero_image) {
        var bg = document.getElementById('heroBg');
        if (bg) bg.style.backgroundImage = 'url("' + heroContent.hero_image + '")';
    }
}

// ============================================
// RENDER EVENTS GRID
// ============================================
function renderEvents() {
    var grid = document.getElementById('eventsGrid');
    var count = document.getElementById('eventsCount');
    if (count) count.textContent = allEvents.length + ' Events';
    if (!grid) return;

    if (!allEvents.length) {
        grid.innerHTML = '<p style="grid-column: 1/-1;text-align:center;color:#49658A;padding:40px;">No upcoming events.</p>';
        return;
    }

    grid.innerHTML = allEvents.map(function (e, idx) {
        var icon = getCategoryIcon(e.category);
        return '<article class="event-card" data-idx="' + idx + '" tabindex="0" role="button">'
            + '<div class="event-image">'
            +   '<img src="' + escapeHtml(e.image_url || '') + '" alt="' + escapeHtml(e.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="event-date-badge">'
            +     '<span class="event-badge-month">' + escapeHtml(e.month_label || '') + '</span>'
            +     '<span class="event-badge-day">' + escapeHtml(e.day_label || '') + '</span>'
            +   '</div>'
            +   '<div class="event-icon-badge"><i class="fas ' + icon + '"></i></div>'
            + '</div>'
            + '<div class="event-body">'
            +   '<h3 class="event-title">' + escapeHtml(e.title || '') + '</h3>'
            +   (e.category ? '<span class="event-cat">' + escapeHtml(e.category) + '</span>' : '')
            +   (e.time_label ? '<div class="event-meta"><i class="fas fa-clock"></i><span>' + escapeHtml(e.time_label) + '</span></div>' : '')
            +   (e.location ? '<div class="event-meta"><i class="fas fa-map-marker-alt"></i><span>' + escapeHtml(e.location) + '</span></div>' : '')
            +   '<p class="event-desc">' + escapeHtml(e.description || '') + '</p>'
            +   '<div class="event-actions">'
            +     '<button class="btn-event btn-event-primary" type="button" data-details="' + idx + '"><i class="fas fa-info-circle"></i> View Details</button>'
            +     (e.registration_enabled ? '<button class="btn-event btn-event-rose" type="button" data-register="' + idx + '"><i class="fas fa-user-plus"></i> Register</button>' : '')
            +   '</div>'
            + '</div>'
            + '</article>';
    }).join('');

    grid.querySelectorAll('.event-card').forEach(function (card) {
        var open = function () {
            var idx = parseInt(card.dataset.idx, 10);
            openEventModal(allEvents[idx]);
        };
        card.addEventListener('click', function (e) {
            if (e.target.closest('[data-register]')) return;
            open();
        });
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });

    grid.querySelectorAll('[data-register]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var idx = parseInt(btn.dataset.register, 10);
            openRegisterForm(allEvents[idx]);
        });
    });
}

// ============================================
// EVENT DETAIL MODAL
// ============================================
function openEventModal(e) {
    if (!e) return;

    var videoHTML = '';
    if (e.video_url) {
        var isYT = e.video_url.indexOf('youtube') > -1 || e.video_url.indexOf('youtu.be') > -1;
        if (isYT) {
            var embedUrl = e.video_url;
            var ytMatch = e.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (ytMatch) embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
            videoHTML = '<div class="modal-section-title">Watch</div>'
                + '<div class="modal-video-wrap">'
                + '<div class="modal-video">'
                + '<iframe src="' + embedUrl + '" title="' + escapeHtml(e.title || '') + '" allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>'
                + '</div>'
                + (e.video_title ? '<p class="modal-video-caption">' + escapeHtml(e.video_title) + '</p>' : '')
                + '</div>';
        } else {
            videoHTML = '<div class="modal-section-title">Watch</div>'
                + '<div class="modal-video-wrap">'
                + '<div class="modal-video">'
                + '<video controls preload="metadata"' + (e.video_poster ? ' poster="' + escapeHtml(e.video_poster) + '"' : '') + '>'
                + '<source src="' + escapeHtml(e.video_url) + '" type="video/mp4">'
                + 'Your browser does not support video.'
                + '</video>'
                + '</div>'
                + (e.video_title ? '<p class="modal-video-caption">' + escapeHtml(e.video_title) + '</p>' : '')
                + '</div>';
        }
    }

    var html = ''
        + '<img class="modal-hero-image" src="' + escapeHtml(e.image_url || '') + '" alt="' + escapeHtml(e.title || '') + '" onerror="this.style.display=\'none\'">'
        + '<div class="modal-content">'
        +   (e.category ? '<span class="modal-cat-badge">' + escapeHtml(e.category) + '</span>' : '')
        +   '<h2>' + escapeHtml(e.title || '') + '</h2>'
        +   (e.organizer ? '<p class="modal-subtitle">Led by ' + escapeHtml(e.organizer) + '</p>' : '')
        +   '<div class="modal-meta-row">'
        +     (e.month_label ? '<span><i class="fas fa-calendar"></i> ' + escapeHtml(e.month_label + ' ' + (e.day_label || '')) + '</span>' : '')
        +     (e.time_label ? '<span><i class="fas fa-clock"></i> ' + escapeHtml(e.time_label) + '</span>' : '')
        +     (e.location ? '<span><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location) + '</span>' : '')
        +   '</div>'
        +   '<p class="modal-description">' + escapeHtml(e.description || '') + '</p>'
        +   videoHTML
        +   '<div class="modal-actions">'
        +     (e.registration_enabled ? '<button class="modal-btn modal-btn-rose" data-modal-register="' + escapeHtml(e.title || '') + '" type="button"><i class="fas fa-user-plus"></i> Register for This Event</button>' : '')
        +     '<a class="modal-btn modal-btn-primary" href="plan-your-visit.html"><i class="fas fa-map-marker-alt"></i> Plan Your Visit</a>'
        +   '</div>'
        + '</div>';

    openModal(html);

    // Attach register handler inside modal
    var regBtn = document.querySelector('[data-modal-register]');
    if (regBtn) {
        regBtn.addEventListener('click', function () {
            openRegisterForm(e);
        });
    }
}

// ============================================
// REGISTER FORM
// ============================================
window.openRegisterForm = function (e) {
    if (!e) return;
    var html = ''
        + '<div class="modal-content">'
        +   '<h2>Register for ' + escapeHtml(e.title || '') + '</h2>'
        +   '<p class="modal-subtitle">Fill in your details below.</p>'
        +   '<form id="eventRegisterForm" class="modal-form">'
        +     '<label>Your Name *<input type="text" name="name" required></label>'
        +     '<label>Email *<input type="email" name="email" required></label>'
        +     '<label>Phone<input type="tel" name="phone" placeholder="+256..."></label>'
        +     '<label>Number of Attendees<input type="number" name="attendees" min="1" value="1"></label>'
        +     '<label>Message<textarea name="message" rows="3"></textarea></label>'
        +     '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit Registration</button>'
        +     '<p class="form-status"></p>'
        +   '</form>'
        + '</div>';

    openModal(html);

    document.getElementById('eventRegisterForm').addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var status = ev.target.querySelector('.form-status');
        var btn = ev.target.querySelector('button[type="submit"]');
        status.textContent = 'Submitting...';
        status.className = 'form-status loading';
        btn.disabled = true;

        var payload = {};
        new FormData(ev.target).forEach(function (v, k) { payload[k] = v; });

        try {
            await window.db.submitVolunteerRequest({
                ministry: 'Event Registration: ' + (e.title || ''),
                name: payload.name,
                email: payload.email,
                phone: payload.phone || null,
                message: 'Attendees: ' + (payload.attendees || 1) + '. ' + (payload.message || '')
            });

            status.textContent = '✅ Thank you! Registration received.';
            status.className = 'form-status success';
            ev.target.reset();

            setTimeout(function () {
                var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
                var text = encodeURIComponent(
                    '🙏 Event Registration\n\nEvent: ' + (e.title || '') +
                    '\nName: ' + (payload.name || '') +
                    '\nEmail: ' + (payload.email || '') +
                    '\nAttendees: ' + (payload.attendees || 1)
                );
                var summaryHtml = ''
                    + '<div class="modal-content">'
                    +   '<h2>Send to Church Office</h2>'
                    +   '<p class="modal-subtitle">Your registration is saved. Send it to us so we can confirm.</p>'
                    +   '<a class="modal-btn modal-btn-primary" style="background:linear-gradient(120deg,#25D366,#128C7E);text-decoration:none;margin-bottom:10px;" href="https://wa.me/' + c.whatsapp + '?text=' + text + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Send via WhatsApp</a>'
                    +   '<a class="modal-btn modal-btn-primary" style="text-decoration:none;" href="mailto:' + c.email + '?subject=' + encodeURIComponent('Event Registration — ' + (e.title || '')) + '&body=' + text + '"><i class="fas fa-envelope"></i> Send via Email</a>'
                    + '</div>';
                openModal(summaryHtml);
            }, 700);
        } catch (err) {
            console.error(err);
            status.textContent = '❌ ' + (err.message || 'Something went wrong.');
            status.className = 'form-status error';
            btn.disabled = false;
        }
    });
};

// ============================================
// WEEKLY SCHEDULE
// ============================================
function renderWeekly() {
    setText('weeklyTitle', weeklyContent.title);

    var verseEl = document.getElementById('weeklyVerseText');
    if (verseEl && weeklyContent.verse_text) verseEl.textContent = weeklyContent.verse_text;

    setText('weeklyVerseRef', weeklyContent.verse_reference);
    setText('weeklyEncouragement', weeklyContent.encouragement);

    if (weeklyContent.background_image) {
        var bg = document.getElementById('weeklyBg');
        if (bg) bg.style.backgroundImage = 'url("' + weeklyContent.background_image + '")';
        var vb = document.getElementById('weeklyVerseBg');
        if (vb) vb.style.backgroundImage = 'url("' + weeklyContent.background_image + '")';
    }

    var grid = document.getElementById('weeklyGrid');
    if (!grid) return;

    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri'];
    var today = new Date();
    var start = new Date(today);
    start.setDate(today.getDate() - today.getDay());

    grid.innerHTML = days.map(function (d, i) {
        var date = new Date(start);
        date.setDate(start.getDate() + i);
        var matched = allEvents.length ? allEvents[i % allEvents.length] : null;
        return '<div class="week-card">'
            + '<div class="week-day">' + d + '</div>'
            + '<div class="week-date">' + date.getDate() + '</div>'
            + '<div class="week-event">' + (matched ? escapeHtml((matched.title || '').substring(0, 26)) : '—') + '</div>'
            + '<div class="week-time">' + (matched ? escapeHtml((matched.time_label || '').substring(0, 14)) : '') + '</div>'
            + '</div>';
    }).join('');
}

// ============================================
// RENDER ANNOUNCEMENTS
// ============================================
function renderAnnouncements() {
    var carousel = document.getElementById('announcementsCarousel');
    if (!carousel) return;

    if (!allAnnouncements || !allAnnouncements.length) {
        carousel.innerHTML = '<p style="padding:20px;color:#49658A;">No announcements yet.</p>';
        return;
    }

    carousel.innerHTML = allAnnouncements.map(function (a, idx) {
        var cat = (a.category_class || 'special').toLowerCase();
        return '<div class="announcement-card" data-idx="' + idx + '" tabindex="0" role="button">'
            + '<div class="announcement-image">'
            +   '<img src="' + escapeHtml(a.image_url || '') + '" alt="' + escapeHtml(a.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<span class="ann-date-badge">' + escapeHtml((a.month_label || '') + ' ' + (a.day_label || '')) + '</span>'
            +   (a.category ? '<span class="ann-cat-badge ' + cat + '">' + escapeHtml(a.category) + '</span>' : '')
            + '</div>'
            + '<div class="announcement-body">'
            +   '<h4 class="announcement-title">' + escapeHtml(a.title || '') + '</h4>'
            +   '<p class="announcement-desc">' + escapeHtml(a.summary || '') + '</p>'
            +   '<span class="announcement-link">Read More <i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '</div>';
    }).join('');

    carousel.querySelectorAll('.announcement-card').forEach(function (card) {
        var open = function () {
            var idx = parseInt(card.dataset.idx, 10);
            openAnnouncementModal(allAnnouncements[idx]);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// ANNOUNCEMENT DETAIL MODAL
// ============================================
function openAnnouncementModal(a) {
    if (!a) return;

    var videoHTML = '';
    if (a.video_url) {
        var isYT = a.video_url.indexOf('youtube') > -1 || a.video_url.indexOf('youtu.be') > -1;
        if (isYT) {
            var embedUrl = a.video_url;
            var ytMatch = a.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (ytMatch) embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
            videoHTML = '<div class="modal-section-title">Watch</div>'
                + '<div class="modal-video-wrap"><div class="modal-video">'
                + '<iframe src="' + embedUrl + '" title="' + escapeHtml(a.title || '') + '" allow="accelerometer; autoplay; encrypted-media; gyroscope" allowfullscreen style="width:100%;height:100%;border:0;"></iframe>'
                + '</div>' + (a.video_title ? '<p class="modal-video-caption">' + escapeHtml(a.video_title) + '</p>' : '') + '</div>';
        } else {
            videoHTML = '<div class="modal-section-title">Watch</div>'
                + '<div class="modal-video-wrap"><div class="modal-video">'
                + '<video controls preload="metadata"' + (a.video_poster ? ' poster="' + escapeHtml(a.video_poster) + '"' : '') + '><source src="' + escapeHtml(a.video_url) + '" type="video/mp4">Your browser does not support video.</video>'
                + '</div>' + (a.video_title ? '<p class="modal-video-caption">' + escapeHtml(a.video_title) + '</p>' : '') + '</div>';
        }
    }

    var html = ''
        + '<img class="modal-hero-image" src="' + escapeHtml(a.image_url || '') + '" alt="' + escapeHtml(a.title || '') + '" onerror="this.style.display=\'none\'">'
        + '<div class="modal-content">'
        +   (a.category ? '<span class="modal-cat-badge">' + escapeHtml(a.category) + '</span>' : '')
        +   '<h2>' + escapeHtml(a.title || '') + '</h2>'
        +   '<div class="modal-meta-row">'
        +     (a.month_label ? '<span><i class="fas fa-calendar"></i> ' + escapeHtml((a.month_label || '') + ' ' + (a.day_label || '')) + '</span>' : '')
        +     (a.date_label ? '<span><i class="fas fa-clock"></i> ' + escapeHtml(a.date_label) + '</span>' : '')
        +   '</div>'
        +   '<p class="modal-description">' + escapeHtml(a.full_content || a.summary || '') + '</p>'
        +   videoHTML
        +   '<div class="modal-actions">'
        +     '<a class="modal-btn modal-btn-primary" href="events-contact.html"><i class="fas fa-envelope"></i> Contact Church</a>'
        +   '</div>'
        + '</div>';

    openModal(html);
}

// ============================================
// CAROUSEL CONTROLS
// ============================================
function setupCarousel() {
    var carousel = document.getElementById('announcementsCarousel');
    var prev = document.getElementById('annPrev');
    var next = document.getElementById('annNext');
    if (!carousel || !prev || !next) return;

    prev.addEventListener('click', function () { carousel.scrollBy({ left: -220, behavior: 'smooth' }); });
    next.addEventListener('click', function () { carousel.scrollBy({ left: 220, behavior: 'smooth' }); });
}

// ============================================
// RENDER CONNECT STRIP
// ============================================
function renderConnect() {
    setText('connectTitle', connectContent.title);
    setText('connectDesc', connectContent.description);
    setText('connectNewsTitle', connectContent.newsletter_title);
    setText('connectNewsDesc', connectContent.newsletter_desc);
    setText('connectPhone', connectContent.phone);
    setText('connectEmail', connectContent.email);
    setText('connectAddress', connectContent.address);
}

// ============================================
// RENDER FOOTER
// ============================================
function renderFooter() {
    setText('footerCopyrightName', footerContent.copyright_name);
}

// ============================================
// LOAD DATA
// ============================================
async function loadEventsData() {
    console.log('📥 Loading events data...');
    try {
        var content = await window.db.getSiteContent();
        var events = await window.db.getEvents();

        var announcements = [];
        try {
            var res = await fetch(ANNOUNCEMENTS_URL);
            announcements = await res.json();
        } catch (e) {
            console.warn('⚠️ announcements fetch failed', e);
        }

        allEvents = Array.isArray(events) ? events : [];
        allAnnouncements = Array.isArray(announcements) ? announcements : [];

        heroContent = (content && content.events_hero) ? content.events_hero : {};
        weeklyContent = (content && content.events_weekly) ? content.events_weekly : {};
        connectContent = (content && content.events_connect) ? content.events_connect : {};
        footerContent = (content && content.footer) ? content.footer : {};

        console.log('🔍 heroContent keys:', Object.keys(heroContent).length);

        renderHero();
        renderEvents();
        renderWeekly();
        renderAnnouncements();
        setupCarousel();
        renderConnect();
        renderFooter();

        console.log('✅ Loaded: ' + allEvents.length + ' events, ' + allAnnouncements.length + ' announcements');
    } catch (err) {
        console.error('❌ Load error:', err);
    }
}

// Wait for supabase.js to be ready
if (window.db) {
    // Supabase client already available
    setTimeout(loadEventsData, 100);
} else {
    window.addEventListener('supabase-ready', loadEventsData);
}

// Backup trigger
setTimeout(function () {
    if (window.db && allEvents.length === 0) {
        console.log('🔁 Retrying load...');
        loadEventsData();
    }
}, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ events.js initialized');

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

    // Modal close
    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') closeModal();
    });

    // Newsletter
    var nl = document.getElementById('connectNewsletter');
    if (nl) {
        nl.addEventListener('submit', async function (e) {
            e.preventDefault();
            var input = nl.querySelector('input[type="email"]');
            var email = input.value.trim();
            if (!email || email.indexOf('@') === -1) {
                alert('Please enter a valid email.');
                return;
            }
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

    // Current year
    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});