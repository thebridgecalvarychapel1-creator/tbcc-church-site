// ============================================
// BRIDGE CALVARY CHAPEL - MAIN UI (homepage)
// File: js/main.js
// ============================================

var siteContent = {};
var smallGroupsCache = [];
var popupCards = [];

// ---------- HELPERS ----------
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function setSrc(id, val) { var el = document.getElementById(id); if (el && val) el.src = val; }
function setBg(id, url) { var el = document.getElementById(id); if (el && url) el.style.backgroundImage = 'url("' + url + '")'; }
function escapeHtml(str) {
    if (!str) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function sectionImg(name) {
    var s = siteContent[name] || {};
    return s.image || s.hero_image || s.background_image || s.main_image || '';
}

// ---------- MODAL ----------
// Second argument (imageUrl) shows a top banner image inside the modal.
// When not passed, the modal behaves exactly as before.
window.openModal = function (html, imageUrl) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    var imageWrap = document.getElementById('modalPanelImage');
    var imageEl = document.getElementById('modalPanelImg');
    if (!panel || !body) return;

    if (imageWrap && imageEl) {
        if (imageUrl) {
            imageEl.style.display = 'block';
            imageEl.src = imageUrl;
            imageEl.alt = '';
            imageWrap.hidden = false;
        } else {
            imageEl.src = '';
            imageWrap.hidden = true;
        }
    }

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
    var imageWrap = document.getElementById('modalPanelImage');
    var imageEl = document.getElementById('modalPanelImg');
    if (!panel) return;
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    if (imageWrap) imageWrap.hidden = true;
    if (imageEl) imageEl.src = '';
};

// ---------- VALUE PANELS ----------
var VALUE_PANELS = {
    value_biblical: { theme: 'blue', icon: 'fa-bible' },
    value_community: { theme: 'maroon', icon: 'fa-users' },
    value_serve: { theme: 'gold', icon: 'fa-hands-helping' },
    value_world: { theme: 'cyan', icon: 'fa-globe-africa' }
};

window.openValuePanel = function (key) {
    var p = VALUE_PANELS[key];
    var d = siteContent[key] || {};
    if (!p) return;

    var ctaHTML = '';
    var link = d.cta_link || '#';
    if (link === 'panel:smallgroup') {
        ctaHTML = '<button class="modal-panel-btn" onclick="closeModal();setTimeout(openSmallGroupPanel,400);" type="button"><span>' + (d.cta_label || 'Find a Small Group') + '</span> <i class="fas fa-arrow-right"></i></button>';
    } else if (link === 'panel:volunteer') {
        ctaHTML = '<button class="modal-panel-btn" onclick="closeModal();setTimeout(openVolunteerPanel,400);" type="button"><span>' + (d.cta_label || 'Start Volunteering') + '</span> <i class="fas fa-arrow-right"></i></button>';
    } else {
        ctaHTML = '<a href="' + link + '" class="modal-panel-btn"><span>' + (d.cta_label || 'Learn More') + '</span> <i class="fas fa-arrow-right"></i></a>';
    }

    var html = ''
        + '<div class="modal-panel-header">'
        +   '<div class="modal-panel-icon"><i class="fas ' + p.icon + '"></i></div>'
        +   '<h2>' + escapeHtml(d.title || '') + '</h2>'
        +   '<p class="modal-panel-subtitle">' + escapeHtml(d.description || '') + '</p>'
        + '</div>'
        + '<p class="modal-panel-description">' + escapeHtml(d.panel_description || d.description || '') + '</p>'
        + (d.scripture ? '<div class="modal-panel-scripture"><p>' + escapeHtml(d.scripture) + '</p></div>' : '')
        + ctaHTML;

    // Pass the card's image as the top banner — everything else identical to before
    openModal(html, sectionImg(key));
};

// ---------- SMALL GROUP PANEL ----------
window.openSmallGroupPanel = function () {
    if (!smallGroupsCache.length) {
        openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-users"></i></div><h2>Find a Small Group</h2><p class="modal-panel-subtitle">No groups available right now.</p></div>');
        return;
    }
    var items = smallGroupsCache.map(function (g) {
        return '<div class="modal-list-item">'
            + '<h4><i class="fas fa-users"></i> ' + escapeHtml(g.name) + '</h4>'
            + '<p>' + escapeHtml(g.description || '') + '</p>'
            + '<div class="modal-list-meta">'
            +   (g.meeting_day ? '<span><i class="fas fa-calendar"></i> ' + escapeHtml(g.meeting_day) + '</span>' : '')
            +   (g.meeting_time ? '<span><i class="fas fa-clock"></i> ' + escapeHtml(g.meeting_time) + '</span>' : '')
            +   (g.location ? '<span><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(g.location) + '</span>' : '')
            + '</div>'
            + '<button class="modal-list-btn" data-group="' + escapeHtml(g.name) + '" type="button">Join This Group <i class="fas fa-arrow-right"></i></button>'
            + '</div>';
    }).join('');
    openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-users"></i></div><h2>Find a Small Group</h2><p class="modal-panel-subtitle">Grow deeper in your faith through real community.</p></div><div class="modal-list">' + items + '</div>');
    document.querySelectorAll('.modal-list-btn[data-group]').forEach(function (btn) {
        btn.addEventListener('click', function () { joinGroup(btn.dataset.group); });
    });
};

// ---------- VOLUNTEER PANEL ----------
window.openVolunteerPanel = function () {
    var opportunities = [
        { name: "Children's Ministry", icon: 'fa-child' },
        { name: 'Worship Team', icon: 'fa-music' },
        { name: 'Welcome Team', icon: 'fa-handshake' },
        { name: 'Prayer Team', icon: 'fa-pray' },
        { name: 'Media Team', icon: 'fa-video' },
        { name: 'Outreach Team', icon: 'fa-hands-helping' }
    ];
    var items = opportunities.map(function (o) {
        return '<div class="modal-list-item"><h4><i class="fas ' + o.icon + '"></i> ' + o.name + '</h4><button class="modal-list-btn" data-volunteer="' + o.name + '" type="button">Get Involved <i class="fas fa-arrow-right"></i></button></div>';
    }).join('');
    openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-hands-helping"></i></div><h2>Start Volunteering</h2><p class="modal-panel-subtitle">Use your gifts to make an eternal impact.</p></div><div class="modal-list">' + items + '</div>');
    document.querySelectorAll('.modal-list-btn[data-volunteer]').forEach(function (btn) {
        btn.addEventListener('click', function () { volunteerInterest(btn.dataset.volunteer); });
    });
};

// ---------- JOIN GROUP ----------
window.joinGroup = function (groupName) {
    var html = '<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-user-plus"></i></div><h2>Join "' + escapeHtml(groupName) + '"</h2><p class="modal-panel-subtitle">Fill in your details.</p></div>'
        + '<form id="joinGroupForm" class="modal-form">'
        + '<input type="hidden" name="group_name" value="' + escapeHtml(groupName) + '">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone"></label>'
        + '<label>Message<textarea name="message" rows="3"></textarea></label>'
        + '<button type="submit" class="modal-panel-btn"><span>Submit Request</span> <i class="fas fa-paper-plane"></i></button>'
        + '<p class="form-status"></p></form>';
    openModal(html);
    document.getElementById('joinGroupForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var st = e.target.querySelector('.form-status');
        var btn = e.target.querySelector('button[type="submit"]');
        st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
        var payload = {};
        new FormData(e.target).forEach(function (v, k) { payload[k] = v; });
        try {
            await window.db.submitGroupRequest(payload);
            st.textContent = '✅ Thank you!'; st.className = 'form-status success';
            e.target.reset();
        } catch (err) {
            console.error(err);
            st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false;
        }
    });
};

window.volunteerInterest = function (ministryName) {
    var html = '<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-hands-helping"></i></div><h2>Volunteer: ' + escapeHtml(ministryName) + '</h2><p class="modal-panel-subtitle">Tell us a bit about yourself.</p></div>'
        + '<form id="volunteerForm" class="modal-form">'
        + '<input type="hidden" name="ministry" value="' + escapeHtml(ministryName) + '">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone"></label>'
        + '<label>Message<textarea name="message" rows="3"></textarea></label>'
        + '<button type="submit" class="modal-panel-btn"><span>Submit</span> <i class="fas fa-paper-plane"></i></button>'
        + '<p class="form-status"></p></form>';
    openModal(html);
    document.getElementById('volunteerForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var st = e.target.querySelector('.form-status');
        var btn = e.target.querySelector('button[type="submit"]');
        st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
        var payload = {};
        new FormData(e.target).forEach(function (v, k) { payload[k] = v; });
        try {
            await window.db.submitVolunteerRequest(payload);
            st.textContent = '✅ Thank you!'; st.className = 'form-status success';
            e.target.reset();
        } catch (err) {
            console.error(err);
            st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false;
        }
    });
};

window.openFamilyPanel = function () { openSmallGroupPanel(); };

// ---------- RENDER: ANNOUNCEMENT ----------
function renderAnnouncement() {
    var a = siteContent.home_announcement || {};
    if (a.message) setText('announceMessage', a.message);
    if (a.service_times) setText('announceTimes', a.service_times);
}

// ---------- RENDER: HERO ----------
function renderHero() {
    var h = siteContent.hero || {};
    setText('heroEyebrow', h.eyebrow);
    setText('heroLine1', h.title_line1);
    setText('heroLine2', h.title_line2);
    setText('heroLine3', h.title_line3);
    setText('heroTagline', h.tagline);
    setText('heroDescription', h.description);
    setSrc('heroImage', sectionImg('hero'));
}

// ---------- RENDER: FAMILY ----------
function renderFamily() {
    var f = siteContent.family || {};
    var main = sectionImg('family');
    setSrc('familyMainImg', main);
    setSrc('familySmall1', f.small_image_1 || main);
    setSrc('familySmall2', f.small_image_2 || main);
    setText('familyStatNumber', f.stat_number);
    setText('familyStatLabel', f.stat_label);
    setText('familyVerseText', f.verse_text);
    setText('familyVerseRef', f.verse_reference);
}

// ---------- RENDER: SERVICE ----------
function renderService(service) {
    if (!service) return;
    setText('serviceTitle', service.title);
    setText('serviceDay', service.day_label);
    setText('serviceTime', service.time_label);
    setText('serviceInvite', service.invite_text);
}

// ---------- RENDER: VALUES ----------
function renderValueCards() {
    var grid = document.getElementById('valuesGrid');
    if (!grid) return;
    var keys = ['value_biblical', 'value_community', 'value_serve', 'value_world'];
    var html = keys.map(function (key) {
        var d = siteContent[key];
        if (!d) return '';
        var variant = (key === 'value_community' || key === 'value_world') ? 'value-maroon' : 'value-blue';
        var img = sectionImg(key);
        return '<article class="value-card ' + variant + '" data-value="' + key + '" tabindex="0" role="button">'
            + '<div class="value-image">'
            +   (img ? '<img src="' + img + '" alt="' + escapeHtml(d.title || '') + '" onerror="this.style.display=\'none\'">' : '')
            +   '<div class="value-icon"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '</div>'
            + '<div class="value-body">'
            +   '<h3>' + escapeHtml(d.title || '') + '</h3>'
            +   '<p>' + escapeHtml(d.description || '') + '</p>'
            +   '<span class="value-btn">Learn More <i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '</article>';
    }).join('');
    grid.innerHTML = html;
    grid.querySelectorAll('.value-card').forEach(function (card) {
        var open = function () { openValuePanel(card.dataset.value); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

// ---------- RENDER: EVENTS ----------
function renderEvents(events) {
    var c = document.getElementById('eventsSlider');
    if (!c) return;
    if (!events.length) { c.innerHTML = '<p class="empty-state" style="color:#94a3b8;">No upcoming events.</p>'; return; }
    c.innerHTML = events.slice(0, 3).map(function (e) {
        return '<article class="event-card">'
            + '<div class="event-image"><img src="' + escapeHtml(e.image_url || '') + '" alt="" onerror="this.style.display=\'none\'"><div class="event-date-badge"><span class="event-month">' + escapeHtml(e.month_label || '') + '</span><span class="event-day">' + escapeHtml(e.day_label || '') + '</span></div></div>'
            + '<div class="event-body"><h4>' + escapeHtml(e.title || '') + '</h4>'
            + (e.time_label ? '<p><i class="fas fa-clock"></i> ' + escapeHtml(e.time_label) + '</p>' : '')
            + (e.location ? '<p><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location) + '</p>' : '')
            + '<a href="events-announcements.html" class="btn btn-primary" style="margin-top:12px;padding:8px 16px;font-size:12px;">View Details <i class="fas fa-arrow-right"></i></a>'
            + '</div></article>';
    }).join('');
}

// ---------- RENDER: MINISTRIES ----------
function renderMinistries(ministries) {
    var c = document.getElementById('ministriesGrid');
    if (!c) return;
    if (!ministries.length) { c.innerHTML = '<p class="empty-state" style="color:#94a3b8;">No ministries.</p>'; return; }
    var top3 = ministries.slice(0, 3);
    var colors = ['icon-blue', 'icon-maroon', 'icon-blue'];
    c.innerHTML = top3.map(function (m, i) {
        return '<a href="ministries.html" class="ministry-card">'
            + '<div class="ministry-image"><img src="' + escapeHtml(m.image_url || '') + '" alt="" onerror="this.style.display=\'none\'"></div>'
            + '<div class="ministry-icon ' + colors[i % 3] + '"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            + '<div class="ministry-overlay"><h4>' + escapeHtml(m.name || '') + '</h4><span class="ministry-arrow"><i class="fas fa-arrow-right"></i></span></div></a>';
    }).join('');
}

// ---------- RENDER: SERMONS ----------
function renderSermons(sermons) {
    var c = document.getElementById('sermonsSlider');
    if (!c) return;
    if (!sermons.length) { c.innerHTML = '<p class="empty-state" style="color:#94a3b8;">No sermons.</p>'; return; }
    var top3 = sermons.slice(0, 3);
    c.innerHTML = top3.map(function (s) {
        return '<article class="sermon-card">'
            + '<div class="sermon-image"><img src="' + escapeHtml(s.thumbnail_url || '') + '" alt="" onerror="this.style.display=\'none\'"><div class="sermon-play"><i class="fas fa-play"></i></div>' + (s.duration ? '<span class="sermon-duration">' + escapeHtml(s.duration) + '</span>' : '') + '</div>'
            + '<div class="sermon-body"><h4>' + escapeHtml(s.title || '') + '</h4>'
            + (s.speaker ? '<p><i class="fas fa-user"></i> ' + escapeHtml(s.speaker) + '</p>' : '')
            + (s.date_label ? '<p><i class="fas fa-calendar"></i> ' + escapeHtml(s.date_label) + '</p>' : '')
            + '<a href="sermons.html" class="btn btn-primary" style="margin-top:10px;padding:8px 14px;font-size:12px;">Watch Video <i class="fas fa-arrow-right"></i></a>'
            + '</div></article>';
    }).join('');
}

// ---------- RENDER: DEVOTION ----------
function renderDevotion(d) {
    var banner = document.getElementById('devotionBanner');
    if (!banner) return;
    if (!d) return;
    if (d.image_url) setBg('devotionBg', d.image_url);
    setText('devotionTitle', d.title || "Start each day with God's Word.");
    setText('devotionVerse', d.verse_text ? '"' + d.verse_text + '" — ' + (d.verse_reference || '') : '');
    setText('devotionDesc', d.reflection || '');
    var btn = document.getElementById('btnReadDevotion');
    if (btn) {
        btn.onclick = function () {
            var html = '<div class="modal-panel-header">'
                + '<div class="modal-panel-icon"><i class="fas fa-book-bible"></i></div>'
                + '<h2>' + escapeHtml(d.title || 'Daily Devotion') + '</h2>'
                + '<p class="modal-panel-subtitle">' + escapeHtml(d.verse_reference || '') + '</p>'
                + '</div>'
                + (d.verse_text ? '<div class="modal-panel-scripture"><p>"' + escapeHtml(d.verse_text) + '"</p></div>' : '')
                + (d.reflection ? '<p class="modal-panel-description">' + escapeHtml(d.reflection) + '</p>' : '')
                + (d.prayer ? '<div class="modal-panel-scripture"><p><strong>Prayer:</strong> ' + escapeHtml(d.prayer) + '</p></div>' : '');
            openModal(html, d.image_url || null);
        };
    }
}

// ============================================
// ROTATING POPUP
// ============================================
function pickRandomCard(cards) {
    if (!cards || !cards.length) return null;
    return cards[Math.floor(Math.random() * cards.length)];
}

function renderPopupCard(card) {
    if (!card) { console.warn('⚠️ renderPopupCard: no card'); return; }
    var overlay = document.getElementById('shopPopupOverlay');
    if (!overlay) { console.error('❌ shopPopupOverlay not found'); return; }

    var isDonation = (card.type === 'donation');

    var badge = document.getElementById('shopPopupBadge');
    if (badge) {
        badge.textContent = isDonation ? 'DONATE' : 'CHURCH SHOP';
        badge.classList.toggle('is-donation', isDonation);
    }

    var img = document.getElementById('shopPopupImage');
    var ph  = document.getElementById('shopPopupPlaceholder');
    if (img && ph) {
        if (card.image_url) {
            img.onerror = function () {
                this.style.display = 'none';
                ph.style.display = 'flex';
            };
            img.onload = function () {
                this.style.display = 'block';
                ph.style.display = 'none';
            };
            img.style.display = 'block';
            ph.style.display = 'flex';
            img.src = card.image_url;
        } else {
            img.style.display = 'none';
            ph.style.display = 'flex';
        }
    }

    setText('shopPopupTitle', card.title || '');
    setText('shopPopupMessage', card.description || card.message || '');

    var priceEl = document.getElementById('shopPopupPrice');
    if (priceEl) {
        if (card.price && !isDonation) {
            priceEl.textContent = card.price;
            priceEl.hidden = false;
        } else {
            priceEl.hidden = true;
        }
    }

    var btn = document.getElementById('shopPopupBtn');
    if (btn) {
        btn.href = card.button_url || (isDonation ? 'donations.html' : 'donations.html#shopSection');
        btn.innerHTML = (card.button_text || (isDonation ? 'Donate Now' : 'Buy Now')) + ' <i class="fas fa-arrow-right"></i>';
        btn.classList.toggle('is-donation', isDonation);
    }

    var delay = (card.display_delay_seconds || 3) * 1000;
    var duration = (card.display_duration_seconds || 60) * 1000;

    setTimeout(function () {
        overlay.classList.add('active');
        overlay.setAttribute('aria-hidden', 'false');
    }, delay);

    setTimeout(function () {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }, delay + duration);

    function closePopup() {
        overlay.classList.remove('active');
        overlay.setAttribute('aria-hidden', 'true');
    }
    var closeBtn = document.getElementById('shopPopupClose');
    if (closeBtn) closeBtn.onclick = closePopup;
    overlay.addEventListener('click', function (e) { if (e.target === overlay) closePopup(); });
}

// ============================================
// LOAD ALL DATA
// ============================================
async function loadAllData() {
    console.log('📥 Loading homepage data...');
    try {
        var results = await Promise.all([
            window.db.getSiteContent(),
            window.db.getNextService(),
            window.db.getMinistries(),
            window.db.getEvents(),
            window.db.getSermons(),
            window.db.getSmallGroups(),
            window.db.getLatestDevotion ? window.db.getLatestDevotion() : Promise.resolve(null),
            window.db.getPopupCards ? window.db.getPopupCards() : Promise.resolve([])
        ]);
        siteContent = results[0] || {};
        smallGroupsCache = results[5] || [];
        popupCards = results[7] || [];

        renderAnnouncement();
        renderHero();
        renderFamily();
        renderService(results[1]);
        renderValueCards();
        renderEvents(results[3]);
        renderMinistries(results[2]);
        renderSermons(results[4]);
        renderDevotion(results[6]);

        if (popupCards && popupCards.length) {
            var chosen = pickRandomCard(popupCards);
            renderPopupCard(chosen);
        }

        console.log('✅ Homepage data loaded');
    } catch (err) {
        console.error('❌ Load error:', err);
    }
}

if (window.db) setTimeout(loadAllData, 100);
else window.addEventListener('supabase-ready', loadAllData);
setTimeout(function () { if (window.db && Object.keys(siteContent).length === 0) loadAllData(); }, 2000);

// ---------- WELCOME VIDEO ----------
window.openWelcomeVideo = function () {
    var modal = document.getElementById('videoModal');
    var video = document.getElementById('welcomeVideo');
    if (!modal || !video) return;
    var url = (siteContent.hero && siteContent.hero.welcome_video) || 'assets/videos/welcome.mp4';
    if (video.getAttribute('src') !== url) video.setAttribute('src', url);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    try { video.play().catch(function () {}); } catch (e) {}
};
window.closeWelcomeVideo = function () {
    var modal = document.getElementById('videoModal');
    var video = document.getElementById('welcomeVideo');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (video) { try { video.pause(); } catch (e) {} }
};

// ---------- DOM READY ----------
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ main.js initialized');
    var navbar = document.getElementById('navbar');
    if (navbar) window.addEventListener('scroll', function () { navbar.classList.toggle('scrolled', window.pageYOffset > 40); }, { passive: true });

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

    var btnWelcome = document.getElementById('btnWatchWelcome');
    if (btnWelcome) btnWelcome.addEventListener('click', openWelcomeVideo);

    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    document.querySelectorAll('[data-close-modal]').forEach(function (el) { el.addEventListener('click', closeWelcomeVideo); });
    document.querySelectorAll('[data-panel]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var p = btn.dataset.panel;
            if (p === 'smallgroup') openSmallGroupPanel();
            if (p === 'volunteer') openVolunteerPanel();
        });
    });

    var familyCard = document.getElementById('familyCard');
    if (familyCard) {
        familyCard.addEventListener('click', openFamilyPanel);
        familyCard.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFamilyPanel(); } });
    }

    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            var input = e.target.querySelector('input[type="email"]');
            var btn = e.target.querySelector('button');
            var email = input.value.trim();
            if (!email || email.indexOf('@') === -1) { alert('Please enter a valid email.'); return; }
            var orig = btn.innerHTML; btn.innerHTML = '...'; btn.disabled = true;
            try {
                var result = await window.db.subscribeNewsletter(email);
                alert(result.duplicate ? 'You are already subscribed!' : '✅ Thank you for subscribing!');
                input.value = '';
            } catch (err) { console.error(err); alert('❌ Something went wrong.'); }
            finally { btn.innerHTML = orig; btn.disabled = false; }
        });
    }

    var footerNewsletter = document.getElementById('footerNewsletter');
    if (footerNewsletter) {
        footerNewsletter.addEventListener('submit', async function (e) {
            e.preventDefault();
            var input = e.target.querySelector('input[type="email"]');
            var email = input.value.trim();
            if (!email || email.indexOf('@') === -1) return;
            try { await window.db.subscribeNewsletter(email); alert('✅ Subscribed!'); input.value = ''; }
            catch (err) { alert('❌ Something went wrong.'); }
        });
    }

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') { closeModal(); closeWelcomeVideo(); } });
    var y = document.getElementById('currentYear'); if (y) y.textContent = new Date().getFullYear();
});