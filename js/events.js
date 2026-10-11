// ============================================
// EVENTS & ANNOUNCEMENTS — Bridge Calvary Chapel
// File: js/events.js  (full)
// ============================================

var siteContent = {};
var allEvents = [];
var allPrograms = [];
var allAnnouncements = [];
var currentDevotion = null;

var CATEGORY_ICONS = {
    'Worship': 'fa-church', 'Bible Study': 'fa-bible', 'Youth': 'fa-users',
    'Prayer': 'fa-pray', 'Outreach': 'fa-hands-helping', 'Children': 'fa-child',
    'Missions': 'fa-globe-africa', 'Special': 'fa-star', 'Maintenance': 'fa-broom'
};

var SB_URL = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/';
var SB_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U';

// ============================================
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function secImg(name) { var s = siteContent[name] || {}; return s.image || s.hero_image || s.background_image || ''; }
function getCategoryIcon(cat) { if (!cat) return 'fa-calendar-alt'; for (var k in CATEGORY_ICONS) { if (cat.toLowerCase().indexOf(k.toLowerCase()) > -1) return CATEGORY_ICONS[k]; } return 'fa-calendar-alt'; }

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
    body.scrollTop = 0;
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
// HERO
// ============================================
function renderHero() {
    var h = siteContent.events_hero || {};
    setText('heroEyebrow', h.eyebrow || 'BRIDGE CALVARY CHAPEL');
    var titleEl = document.getElementById('heroTitle');
    if (titleEl) {
        var line1 = h.title_line1 || 'Events &';
        var line2 = h.title_line2 || 'Announcements';
        titleEl.innerHTML = escapeHtml(line1) + ' <span class="accent">' + escapeHtml(line2) + '</span>';
    }
    setText('heroDesc', h.description || 'Stay connected with everything happening at Bridge Calvary Chapel. Join us for worship, fellowship, and community events.');
    var verseEl = document.getElementById('heroVerse');
    if (verseEl && h.verse_text) {
        verseEl.innerHTML = escapeHtml(h.verse_text) + '<span class="verse-ref">' + escapeHtml(h.verse_reference || '') + '</span>';
    } else if (verseEl) {
        verseEl.innerHTML = '"Let us not give up meeting together, as some are in the habit of doing, but encouraging one another."<span class="verse-ref">— Hebrews 10:25</span>';
    }
    var url = secImg('events_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// ============================================
// CHURCH PROGRAMS
// ============================================
function renderPrograms() {
    var grid = document.getElementById('programsGrid');
    if (!grid) return;
    if (!allPrograms.length) {
        grid.innerHTML = '<p class="empty-state">No programs available.</p>';
        return;
    }
    grid.innerHTML = allPrograms.map(function (p, idx) {
        var scheduleLines = (p.schedule || '').split('\n').filter(function (l) { return l.trim(); });
        var scheduleHTML = scheduleLines.map(function (line) {
            return '<div class="program-meta-item"><i class="fas fa-clock"></i><span>' + escapeHtml(line) + '</span></div>';
        }).join('');
        return '<article class="program-card" data-program="' + idx + '">'
            + '<div class="program-image">'
            +   '<img src="' + escapeHtml(p.image_url || '') + '" alt="' + escapeHtml(p.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="program-icon-badge"><i class="fas ' + escapeHtml(p.icon || 'fa-calendar-alt') + '"></i></div>'
            + '</div>'
            + '<div class="program-body">'
            +   '<h3 class="program-title">' + escapeHtml(p.title) + '</h3>'
            +   '<div class="program-meta">' + scheduleHTML + '</div>'
            +   '<p class="program-desc">' + escapeHtml(p.description || '') + '</p>'
            +   '<button class="btn-join" type="button" data-join-program="' + idx + '"><i class="fas fa-user-plus"></i> Join</button>'
            + '</div>'
            + '</article>';
    }).join('');

    grid.querySelectorAll('[data-join-program]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var p = allPrograms[parseInt(btn.dataset.joinProgram, 10)];
            if (p) openRegistrationPanel('Program', p.title);
        });
    });
    grid.querySelectorAll('[data-program]').forEach(function (card) {
        card.addEventListener('click', function () {
            var p = allPrograms[parseInt(card.dataset.program, 10)];
            if (p) openProgramDetails(p);
        });
    });
}

function openProgramDetails(p) {
    if (!p) return;
    var html = ''
        + (p.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(p.image_url) + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper"><i class="fas ' + escapeHtml(p.icon || 'fa-calendar-alt') + '"></i></div>'
        +   '<h2>' + escapeHtml(p.title) + '</h2>'
        +   '<p class="modal-subtitle">' + escapeHtml(p.schedule || '') + '</p>'
        +   '<p class="modal-description">' + escapeHtml(p.description || '') + '</p>'
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-primary" onclick="closeModal();openRegistrationPanel(\'Program\', \'' + escapeHtml(p.title).replace(/'/g, "\\'") + '\')" type="button"><i class="fas fa-user-plus"></i> Join This Program</button>'
        +   '</div>'
        + '</div>';
    openModal(html);
}

// ============================================
// UPCOMING EVENTS
// ============================================
function renderEvents() {
    var grid = document.getElementById('eventsGrid');
    if (!grid) return;
    if (!allEvents.length) {
        grid.innerHTML = '<p class="empty-state">No upcoming events.</p>';
        return;
    }
    grid.innerHTML = allEvents.map(function (e, idx) {
        var icon = getCategoryIcon(e.category);
        return '<article class="event-card" data-event="' + idx + '">'
            + '<div class="event-image">'
            +   '<img src="' + escapeHtml(e.image_url || '') + '" alt="' + escapeHtml(e.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="event-date-badge"><span class="event-badge-month">' + escapeHtml(e.month_label || '') + '</span><span class="event-badge-day">' + escapeHtml(e.day_label || '') + '</span></div>'
            +   '<div class="event-icon-badge"><i class="fas ' + icon + '"></i></div>'
            + '</div>'
            + '<div class="event-body">'
            +   (e.category ? '<span class="event-tag">' + escapeHtml(e.category) + '</span>' : '')
            +   '<h3 class="event-title">' + escapeHtml(e.title) + '</h3>'
            +   (e.time_label ? '<div class="event-meta"><i class="fas fa-clock"></i> ' + escapeHtml(e.time_label) + '</div>' : '')
            +   (e.location ? '<div class="event-meta"><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location) + '</div>' : '')
            +   '<p class="event-desc">' + escapeHtml(e.description || '') + '</p>'
            +   '<div class="event-actions">'
            +     '<button class="btn-event btn-event-outline" type="button" data-details="' + idx + '"><i class="fas fa-info-circle"></i> View Details</button>'
            +     '<button class="btn-event btn-event-primary" type="button" data-join-event="' + idx + '"><i class="fas fa-user-plus"></i> Join</button>'
            +   '</div>'
            + '</div></article>';
    }).join('');

    grid.querySelectorAll('[data-details]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            openEventDetails(allEvents[parseInt(btn.dataset.details, 10)]);
        });
    });
    grid.querySelectorAll('[data-join-event]').forEach(function (btn) {
        btn.addEventListener('click', function (e) {
            e.stopPropagation();
            var ev = allEvents[parseInt(btn.dataset.joinEvent, 10)];
            if (ev) openRegistrationPanel('Event', ev.title);
        });
    });
    grid.querySelectorAll('[data-event]').forEach(function (card) {
        card.addEventListener('click', function () {
            openEventDetails(allEvents[parseInt(card.dataset.event, 10)]);
        });
    });
}

function openEventDetails(e) {
    if (!e) return;
    var videoHTML = '';
    if (e.video_url) {
        var isYT = e.video_url.indexOf('youtube') > -1 || e.video_url.indexOf('youtu.be') > -1;
        if (isYT) {
            var embedUrl = e.video_url;
            var ytMatch = e.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (ytMatch) embedUrl = 'https://www.youtube.com/embed/' + ytMatch[1];
            videoHTML = '<div class="modal-section-label">Watch</div><div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;"><iframe src="' + embedUrl + '" title="" allow="accelerometer; autoplay; encrypted-media" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>';
        } else {
            videoHTML = '<div class="modal-section-label">Watch</div><div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;"><video controls preload="metadata" style="width:100%;height:100%;"><source src="' + escapeHtml(e.video_url) + '" type="video/mp4"></video></div>';
        }
    }

    var html = ''
        + (e.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(e.image_url) + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<div class="modal-content">'
        +   (e.category ? '<span class="event-tag" style="margin-bottom:8px;">' + escapeHtml(e.category) + '</span>' : '')
        +   '<h2>' + escapeHtml(e.title) + '</h2>'
        +   (e.organizer ? '<p class="modal-subtitle">Led by ' + escapeHtml(e.organizer) + '</p>' : '')
        +   '<div class="modal-meta-row">'
        +     '<span><i class="fas fa-calendar"></i> ' + escapeHtml((e.month_label || '') + ' ' + (e.day_label || '')) + '</span>'
        +     (e.time_label ? '<span><i class="fas fa-clock"></i> ' + escapeHtml(e.time_label) + '</span>' : '')
        +     (e.location ? '<span><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location) + '</span>' : '')
        +   '</div>'
        +   '<p class="modal-description">' + escapeHtml(e.description || '') + '</p>'
        +   videoHTML
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-primary" onclick="closeModal();openRegistrationPanel(\'Event\', \'' + escapeHtml(e.title).replace(/'/g, "\\'") + '\')" type="button"><i class="fas fa-user-plus"></i> Join This Event</button>'
        +     '<a class="modal-btn modal-btn-secondary" href="plan-your-visit.html"><i class="fas fa-map-marker-alt"></i> Plan Your Visit</a>'
        +   '</div>'
        + '</div>';
    openModal(html);
}

// ============================================
// REGISTRATION PANEL (used by programs AND events)
// ============================================
window.openRegistrationPanel = function (type, name) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var html = ''
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper"><i class="fas fa-user-plus"></i></div>'
        +   '<h2>Join ' + escapeHtml(name) + '</h2>'
        +   '<p class="modal-subtitle">Fill in your details and send your registration to our church office.</p>'
        +   '<form id="regForm" class="modal-form">'
        +     '<input type="hidden" name="type" value="' + escapeHtml(type) + '">'
        +     '<input type="hidden" name="name_of_program" value="' + escapeHtml(name) + '">'
        +     '<div class="form-group full"><label><i class="fas fa-tag"></i> Program / Event</label><input type="text" name="program_name" value="' + escapeHtml(name) + '" readonly style="background:#F1F8FF;color:#005BEA;font-weight:700;"></div>'
        +     '<div class="form-group full"><label><i class="fas fa-user"></i> Full Name <span class="req">*</span></label><input type="text" name="participant_name" required></div>'
        +     '<div class="form-group"><label><i class="fas fa-birthday-cake"></i> Age</label><input type="text" name="age" placeholder="e.g. 25"></div>'
        +     '<div class="form-group"><label><i class="fas fa-venus-mars"></i> Gender</label><select name="gender"><option value="">Select...</option><option value="Male">Male</option><option value="Female">Female</option><option value="Prefer not to say">Prefer not to say</option></select></div>'
        +     '<div class="form-group"><label><i class="fab fa-whatsapp"></i> Phone / WhatsApp <span class="req">*</span></label><input type="tel" name="phone" placeholder="+256..." required></div>'
        +     '<div class="form-group"><label><i class="fas fa-envelope"></i> Email</label><input type="email" name="email" placeholder="your@email.com"></div>'
        +     '<div class="form-group full"><label><i class="fas fa-comment"></i> Additional Info / Questions</label><textarea name="notes" rows="3" placeholder="Anything we should know..."></textarea></div>'
        +   '</form>'
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-whatsapp" id="btnRegWhatsApp" type="button"><i class="fab fa-whatsapp"></i> Submit via WhatsApp</button>'
        +     '<button class="modal-btn modal-btn-email" id="btnRegEmail" type="button"><i class="fas fa-envelope"></i> Submit via Email</button>'
        +   '</div>'
        +   '<p class="form-status"></p>'
        + '</div>';
    openModal(html);

    function collect() {
        var p = {};
        new FormData(document.getElementById('regForm')).forEach(function (v, k) { p[k] = v; });
        return p;
    }
    function buildMessage(p) {
        var lines = [];
        lines.push('Hello Bridge Calvary Chapel, I would like to register for: ' + (p.program_name || ''));
        lines.push('');
        lines.push('👤 Name: ' + (p.participant_name || ''));
        if (p.age) lines.push('🎂 Age: ' + p.age);
        if (p.gender) lines.push('⚧ Gender: ' + p.gender);
        lines.push('📱 Phone/WhatsApp: ' + (p.phone || ''));
        if (p.email) lines.push('📧 Email: ' + p.email);
        if (p.notes) lines.push('💬 Additional: ' + p.notes);
        lines.push('');
        lines.push('Sent from Bridge Calvary Chapel website');
        return lines.join('\n');
    }
    async function saveReg(p) {
        try {
            var res = await fetch(SB_URL + 'program_registrations', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': SB_KEY,
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    program_name: p.program_name,
                    participant_name: p.participant_name,
                    age: p.age || null,
                    gender: p.gender || null,
                    phone: p.phone,
                    email: p.email || null,
                    notes: p.notes || null,
                    status: 'pending'
                })
            });
            return res.ok;
        } catch (e) { console.warn('save reg failed', e); return false; }
    }

    document.getElementById('btnRegWhatsApp').addEventListener('click', async function () {
        var st = document.querySelector('.form-status');
        var p = collect();
        if (!p.participant_name || !p.phone) { alert('Please enter your name and phone number.'); return; }
        st.textContent = 'Preparing...'; st.className = 'form-status loading';
        await saveReg(p);
        st.textContent = '✅ Opening WhatsApp...'; st.className = 'form-status success';
        var c = window.CHURCH_CONTACT || { whatsapp: '' };
        window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildMessage(p)), '_blank', 'noopener');
    });

    document.getElementById('btnRegEmail').addEventListener('click', async function () {
        var st = document.querySelector('.form-status');
        var p = collect();
        if (!p.participant_name || !p.phone) { alert('Please enter your name and phone number.'); return; }
        st.textContent = 'Preparing...'; st.className = 'form-status loading';
        await saveReg(p);
        st.textContent = '✅ Opening email...'; st.className = 'form-status success';
        var c = window.CHURCH_CONTACT || { email: '' };
        window.location.href = 'mailto:' + c.email + '?subject=' + encodeURIComponent('Registration — ' + p.program_name) + '&body=' + encodeURIComponent(buildMessage(p));
    });
};

// ============================================
// DEVOTION
// ============================================
function renderDevotion() {
    if (!currentDevotion) return;
    setText('devotionTitle', currentDevotion.title);
    var verseEl = document.getElementById('devotionVerse');
    if (verseEl) verseEl.innerHTML = escapeHtml(currentDevotion.verse_text || '') + '<span class="devotion-verse-ref">' + escapeHtml(currentDevotion.verse_reference || '') + '</span>';
    setText('devotionDesc', currentDevotion.reflection);
    var url = currentDevotion.image_url;
    if (url) { var bg = document.getElementById('devotionBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

function openDevotionPanel() {
    if (!currentDevotion) { alert('Devotion coming soon.'); return; }
    var html = ''
        + (currentDevotion.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(currentDevotion.image_url) + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#F4C430,#D97706);"><i class="fas fa-book-bible"></i></div>'
        +   '<h2>' + escapeHtml(currentDevotion.title) + '</h2>'
        +   '<p class="modal-subtitle">' + escapeHtml(currentDevotion.verse_reference || '') + '</p>'
        +   '<div class="modal-section-label">Verse</div>'
        +   '<p style="font-style:italic;color:#041A3A;">' + escapeHtml(currentDevotion.verse_text || '') + '</p>'
        +   '<div class="modal-section-label">Reflection</div>'
        +   '<p>' + escapeHtml(currentDevotion.reflection || '') + '</p>'
        +   (currentDevotion.prayer ? '<div class="modal-section-label">Prayer</div><p>' + escapeHtml(currentDevotion.prayer) + '</p>' : '')
        +   '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button"><span>Close</span></button></div>'
        + '</div>';
    openModal(html);
}

// ============================================
// WEEKLY SCHEDULE
// ============================================
function renderWeekly() {
    var grid = document.getElementById('weeklyGrid');
    if (!grid) return;
    var days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    var today = new Date();
    var start = new Date(today); start.setDate(today.getDate() - today.getDay());

    // Build day-to-program map
    var dayPrograms = {
        0: 'Worship Services',   // Sunday
        3: 'Bible Study',        // Wednesday
        4: 'Choir Practice',     // Thursday (optional)
        5: 'Youth Fellowship',   // Friday (optional)
        6: 'Community Outreach'  // Saturday
    };
    var dayTimes = {
        0: '8:30 AM & 10:30 AM',
        1: 'Open',
        3: '5:00 PM',
        4: '6:30 PM',
        5: '6:30 PM',
        6: '9:00 AM'
    };

    grid.innerHTML = days.map(function (d, i) {
        var date = new Date(start); date.setDate(start.getDate() + i);
        var eventName = dayPrograms[i] || (i === 2 ? 'Prayer Meeting' : (i === 1 ? 'Church Office' : '—'));
        var time = dayTimes[i] || '';
        return '<div class="week-card">'
            + '<div class="week-day">' + d + '</div>'
            + '<div class="week-date">' + date.getDate() + '</div>'
            + '<div class="week-event">' + escapeHtml(eventName) + '</div>'
            + '<div class="week-time">' + escapeHtml(time) + '</div>'
            + '</div>';
    }).join('');

    var w = siteContent.events_weekly || {};
    setText('weeklyVerseText', w.verse_text || '"Trust in the Lord with all your heart and lean not on your own understanding; in all your ways submit to Him, and He will make your paths straight."');
    setText('weeklyVerseRef', w.verse_reference || '— Proverbs 3:5-6');
    var url = secImg('events_weekly');
    if (url) { var bg = document.getElementById('weeklyVerseBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// ============================================
// ANNOUNCEMENTS
// ============================================
function renderAnnouncements() {
    var carousel = document.getElementById('announcementsCarousel');
    if (!carousel) return;
    if (!allAnnouncements.length) {
        carousel.innerHTML = '<p style="padding:20px;color:#49658A;">No announcements yet.</p>';
        return;
    }
    carousel.innerHTML = allAnnouncements.map(function (a, idx) {
        var cat = (a.category_class || 'special').toLowerCase();
        return '<div class="announcement-card" data-ann="' + idx + '" tabindex="0" role="button">'
            + '<div class="announcement-image">'
            +   '<img src="' + escapeHtml(a.image_url || '') + '" alt="" onerror="this.style.display=\'none\'">'
            +   '<span class="ann-date-badge">' + escapeHtml((a.month_label || '') + ' ' + (a.day_label || '')) + '</span>'
            +   (a.category ? '<span class="ann-cat-badge ' + cat + '">' + escapeHtml(a.category) + '</span>' : '')
            + '</div>'
            + '<div class="announcement-body">'
            +   '<h4 class="announcement-title">' + escapeHtml(a.title) + '</h4>'
            +   '<p class="announcement-desc">' + escapeHtml(a.summary || '') + '</p>'
            +   '<span class="announcement-link">Read More <i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '</div>';
    }).join('');

    carousel.querySelectorAll('.announcement-card').forEach(function (card) {
        var open = function () {
            openAnnouncementModal(allAnnouncements[parseInt(card.dataset.ann, 10)]);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

function openAnnouncementModal(a) {
    if (!a) return;
    var videoHTML = '';
    if (a.video_url) {
        var isYT = a.video_url.indexOf('youtube') > -1 || a.video_url.indexOf('youtu.be') > -1;
        if (isYT) {
            var embedUrl = a.video_url;
            var m = a.video_url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
            if (m) embedUrl = 'https://www.youtube.com/embed/' + m[1];
            videoHTML = '<div class="modal-section-label">Watch</div><div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;"><iframe src="' + embedUrl + '" title="" allowfullscreen style="width:100%;height:100%;border:0;"></iframe></div>';
        } else {
            videoHTML = '<div class="modal-section-label">Watch</div><div style="position:relative;width:100%;aspect-ratio:16/9;border-radius:12px;overflow:hidden;background:#000;"><video controls preload="metadata" style="width:100%;height:100%;"><source src="' + escapeHtml(a.video_url) + '" type="video/mp4"></video></div>';
        }
    }
    var html = ''
        + (a.image_url ? '<img class="modal-hero-image" src="' + escapeHtml(a.image_url) + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<div class="modal-content">'
        +   (a.category ? '<span class="event-tag" style="margin-bottom:8px;">' + escapeHtml(a.category) + '</span>' : '')
        +   '<h2>' + escapeHtml(a.title) + '</h2>'
        +   '<div class="modal-meta-row">'
        +     '<span><i class="fas fa-calendar"></i> ' + escapeHtml((a.month_label || '') + ' ' + (a.day_label || '')) + '</span>'
        +     (a.date_label ? '<span><i class="fas fa-clock"></i> ' + escapeHtml(a.date_label) + '</span>' : '')
        +   '</div>'
        +   '<p class="modal-description">' + escapeHtml(a.full_content || a.summary || '') + '</p>'
        +   videoHTML
        +   '<div class="modal-actions"><a class="modal-btn modal-btn-primary" href="events-contact.html"><i class="fas fa-envelope"></i> Contact Church</a></div>'
        + '</div>';
    openModal(html);
}

function setupCarousel() {
    var carousel = document.getElementById('announcementsCarousel');
    var prev = document.getElementById('annPrev');
    var next = document.getElementById('annNext');
    if (!carousel || !prev || !next) return;
    prev.addEventListener('click', function () { carousel.scrollBy({ left: -240, behavior: 'smooth' }); });
    next.addEventListener('click', function () { carousel.scrollBy({ left: 240, behavior: 'smooth' }); });
}

// ============================================
// SHOP PROMO + FOOTER
// ============================================
function renderShopPromo() {
    var url = secImg('events_shop_promo');
    if (url) { var bg = document.getElementById('shopPromoBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

function renderFooter() {
    var f = siteContent.footer || {};
    setText('footerTagline', f.tagline);
    setText('footerPhone', f.phone);
    setText('footerEmail', f.email);
    setText('footerAddress', f.address);
    setText('footerCopyrightName', f.copyright_name);
}

// ============================================
// LOAD DATA
// ============================================
async function loadEventsData() {
    console.log('📥 Loading events page data...');
    try {
        var content = await window.db.getSiteContent();
        siteContent = content || {};

        // Load events from events table
        var eventsResp = await fetch(SB_URL + 'events?select=*&is_published=eq.true&order=display_order.asc&apikey=' + SB_KEY);
        allEvents = await eventsResp.json();
        if (!Array.isArray(allEvents)) allEvents = [];

        // Load programs
        var progResp = await fetch(SB_URL + 'church_programs?select=*&is_published=eq.true&order=display_order.asc&apikey=' + SB_KEY);
        allPrograms = await progResp.json();
        if (!Array.isArray(allPrograms)) allPrograms = [];

        // Load devotion
        var devResp = await fetch(SB_URL + 'devotions?select=*&is_published=eq.true&limit=1&apikey=' + SB_KEY);
        var devs = await devResp.json();
        currentDevotion = Array.isArray(devs) && devs.length ? devs[0] : null;

        // Load announcements
        var annResp = await fetch(SB_URL + 'announcements?select=*&is_published=eq.true&order=display_order.asc&apikey=' + SB_KEY);
        allAnnouncements = await annResp.json();
        if (!Array.isArray(allAnnouncements)) allAnnouncements = [];

        renderHero();
        renderPrograms();
        renderEvents();
        renderDevotion();
        renderWeekly();
        renderAnnouncements();
        setupCarousel();
        renderShopPromo();
        renderFooter();

        console.log('✅ Loaded: ' + allPrograms.length + ' programs, ' + allEvents.length + ' events, ' + allAnnouncements.length + ' announcements');
    } catch (err) { console.error('❌ Load error:', err); }
}

if (window.db) setTimeout(loadEventsData, 100);
else window.addEventListener('supabase-ready', loadEventsData);
setTimeout(function () { if (window.db && allEvents.length === 0) loadEventsData(); }, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ events.js initialized');

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

    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });

    var btnDevotion = document.getElementById('btnReadDevotion');
    if (btnDevotion) btnDevotion.addEventListener('click', openDevotionPanel);

    var nl = document.getElementById('footerNewsletter');
    if (nl) nl.addEventListener('submit', async function (e) {
        e.preventDefault();
        var input = nl.querySelector('input[type="email"]');
        var email = input.value.trim();
        if (!email || email.indexOf('@') === -1) { alert('Please enter a valid email.'); return; }
        try {
            var r = await window.db.subscribeNewsletter(email);
            alert(r.duplicate ? 'You are already subscribed!' : '✅ Thank you for subscribing!');
            input.value = '';
        } catch (err) { console.error(err); alert('❌ Something went wrong.'); }
    });

    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});