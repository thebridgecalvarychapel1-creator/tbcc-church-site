// ============================================
// ABOUT US PAGE — Bridge Calvary Chapel
// File: js/about.js
// ============================================

var aboutContent = {};
var leadersCache = [];

// ---------- HELPERS ----------
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function setBg(id, url) { var el = document.getElementById(id); if (el && url) el.style.backgroundImage = 'url("' + url + '")'; }
function setSrc(id, val) {
    var el = document.getElementById(id);
    if (el && val) {
        el.style.display = 'block';
        el.src = val;
    }
}
function escapeHtml(str) {
    if (str === undefined || str === null) return '';
    return String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}
function secImg(name) {
    var s = aboutContent[name] || {};
    return s.image || s.hero_image || s.background_image || s.main_image || '';
}

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
// HERO
// ============================================
function renderHero() {
    var h = aboutContent.about_hero || {};
    setText('heroScript', h.title_line1 || 'About Us');
    setText('heroSubtitle', h.subtitle || 'A Church for Every Generation');
    setText('heroTagline', h.tagline || 'Real People • Real Faith • Real Life');

    // Prefer 'image' key, fall back to 'hero' key, then other image keys
    var url = h.image || h.hero_image || h.background_image || h.main_image || h.hero || '';
    if (url) {
        setBg('heroBg', url);
        console.log('🖼️ Hero image set from:', url);
    } else {
        console.warn('⚠️ No hero image URL found in about_hero');
    }
}

// ============================================
// HISTORY CARD
// ============================================
function renderHistoryCard() {
    var h = aboutContent.about_history || {};
    setText('historyHeading', h.heading || 'OUR HISTORY');
    setText('historyIntro', h.intro || '');
    setText('historyBtnLabel', h.learn_more_label || 'Learn More');

    // Set the image IMMEDIATELY on page load (this is the fix)
    var url = h.main_image || h.image || h.small_image_1 || '';
    if (url) {
        setSrc('historyPhoto', url);
        console.log('🖼️ History image set from:', url);
    } else {
        console.warn('⚠️ No history image URL found in about_history');
    }

    var card = document.getElementById('historyCard');
    var btn = document.getElementById('historyBtn');
    var open = function () { openHistoryPanel(); };
    if (card) {
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
}

function openHistoryPanel() {
    var h = aboutContent.about_history || {};
    var img = h.main_image || h.image || '';
    var html = ''
        + (img ? '<img class="modal-panel-image" src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<h2>' + escapeHtml(h.heading || 'Our History') + '</h2>'
        + '<p class="modal-subtitle">Since ' + escapeHtml(h.title_highlight || '1995') + '</p>'
        + (h.paragraph1 ? '<p class="modal-description">' + escapeHtml(h.paragraph1) + '</p>' : '')
        + (h.paragraph2 ? '<p class="modal-description">' + escapeHtml(h.paragraph2) + '</p>' : '')
        + (h.paragraph3 ? '<p class="modal-description">' + escapeHtml(h.paragraph3) + '</p>' : '');
    openModal(html);
}

// ============================================
// PASTOR CARD
// ============================================
function renderPastorCard() {
    var pastor = leadersCache[0] || null;
    var pastorImage = '';
    if (pastor) {
        setText('pastorName', pastor.name || '');
        setText('pastorRole', pastor.tagline || pastor.role || '');
        setText('pastorVerse', pastor.bio || '');
        pastorImage = pastor.image_url || '';
    } else {
        var l = aboutContent.about_leader_1 || {};
        setText('pastorName', l.name || 'Our Pastor');
        setText('pastorRole', l.role || '');
        setText('pastorVerse', l.bio || '');
        pastorImage = l.image || '';
    }
    if (pastorImage) {
        setSrc('pastorPhoto', pastorImage);
        console.log('🖼️ Pastor image set from:', pastorImage);
    } else {
        console.warn('⚠️ No pastor image URL found');
    }

    var card = document.getElementById('pastorCard');
    var btn = document.getElementById('pastorBtn');
    var open = function () {
        if (pastor) { openLeaderProfile(pastor); return; }
        var l = aboutContent.about_leader_1 || {};
        openLeaderProfile({ name: l.name, role: l.role, bio: l.bio, full_bio: l.full_bio, image_url: l.image });
    };
    if (card) {
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
}

// ============================================
// MISSION + ACCORDIONS
// ============================================
function renderMission() {
    var m = aboutContent.about_mission || {};
    setText('missionHeading', m.heading || 'OUR MISSION');
    setText('missionSub', m.subheading || '');
    setText('missionBody', m.body || m.description || '');
    setText('missionBtnLabel', m.button_label || 'Explore Our Mission');

    var btn = document.getElementById('missionBtn');
    if (btn) btn.addEventListener('click', function () {
        openModal(
            '<div class="modal-icon-wrapper"><i class="fas fa-bullseye"></i></div>'
            + '<h2>' + escapeHtml(m.heading || 'Our Mission') + '</h2>'
            + '<p class="modal-subtitle">' + escapeHtml(m.subheading || '') + '</p>'
            + '<p class="modal-description">' + escapeHtml(m.body || m.description || '') + '</p>'
        );
    });
}

function renderAccordions() {
    var container = document.getElementById('accordion');
    if (!container) return;

    var html = '';
    for (var i = 1; i <= 4; i++) {
        var d = aboutContent['about_mission_acc_' + i];
        if (!d) continue;
        html += '<div class="accordion-item" data-acc="' + i + '">'
            + '<button class="accordion-header" type="button">'
            +   '<span class="accordion-icon"><i class="fas ' + escapeHtml(d.icon || 'fa-star') + '"></i></span>'
            +   '<span class="accordion-title-wrap">'
            +     '<span class="accordion-title">' + escapeHtml(d.title || '') + '</span>'
            +     '<span class="accordion-sub">' + escapeHtml(d.subtitle || '') + '</span>'
            +   '</span>'
            +   '<i class="fas fa-chevron-down accordion-chevron"></i>'
            + '</button>'
            + '<div class="accordion-body"><div class="accordion-body-inner">' + escapeHtml(d.body || '') + '</div></div>'
            + '</div>';
    }
    container.innerHTML = html;

    container.querySelectorAll('.accordion-item').forEach(function (item) {
        var header = item.querySelector('.accordion-header');
        var body = item.querySelector('.accordion-body');
        header.addEventListener('click', function () {
            var isOpen = item.classList.contains('open');
            container.querySelectorAll('.accordion-item').forEach(function (other) {
                other.classList.remove('open');
                var ob = other.querySelector('.accordion-body');
                if (ob) ob.style.maxHeight = null;
            });
            if (!isOpen) {
                item.classList.add('open');
                body.style.maxHeight = body.scrollHeight + 'px';
            }
        });
    });
}

// ============================================
// VISION CARD
// ============================================
function renderVisionCard() {
    var v = aboutContent.about_vision_section || {};
    setText('visionHeading', v.heading || 'OUR VISION');
    setText('visionSub', v.subheading || '');
    setText('visionBody', v.body || '');
    setText('visionBtnLabel', v.button_label || 'Learn More');

    // Set the image IMMEDIATELY
    var img = v.image || v.background_image || v.main_image || secImg('about_vision_section');
    if (img) {
        setSrc('visionPhoto', img);
        console.log('🖼️ Vision image set from:', img);
    } else {
        console.warn('⚠️ No vision image URL found in about_vision_section');
    }

    var card = document.getElementById('visionCard');
    var btn = document.getElementById('visionBtn');
    var open = function () {
        openModal(
            '<div class="modal-icon-wrapper"><i class="fas fa-eye"></i></div>'
            + '<h2>' + escapeHtml(v.heading || 'Our Vision') + '</h2>'
            + '<p class="modal-subtitle">' + escapeHtml(v.subheading || '') + '</p>'
            + '<p class="modal-description">' + escapeHtml(v.body || '') + '</p>'
        );
    };
    if (card) {
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
}

// ============================================
// VALUES CARD
// ============================================
function renderValuesCard() {
    var v = aboutContent.about_values_section || {};
    setText('valuesHeading', v.heading || 'OUR VALUES');
    setText('valuesSub', v.subheading || '');
    setText('valuesBtnLabel', v.button_label || 'Discover Our Values');

    var list = document.getElementById('valuesList');
    if (list) {
        var items = '';
        for (var i = 1; i <= 5; i++) {
            var item = aboutContent['about_values_item_' + i];
            if (!item || !item.title) continue;
            items += '<li><i class="fas fa-check"></i> ' + escapeHtml(item.title) + '</li>';
        }
        list.innerHTML = items;
    }

    // Set the image IMMEDIATELY
    var img = v.image || v.background_image || v.main_image || secImg('about_values_section');
    if (img) {
        setSrc('valuesPhoto', img);
        console.log('🖼️ Values image set from:', img);
    } else {
        console.warn('⚠️ No values image URL found in about_values_section');
    }

    var card = document.getElementById('valuesCard');
    var btn = document.getElementById('valuesBtn');
    var open = function () {
        var valueItems = '';
        for (var i = 1; i <= 5; i++) {
            var it = aboutContent['about_values_item_' + i];
            if (!it || !it.title) continue;
            valueItems += '<li style="display:flex;gap:10px;align-items:center;font-size:14px;color:#5A6B85;margin-bottom:8px;"><i class="fas fa-check" style="color:#8B1A2F;"></i> ' + escapeHtml(it.title) + '</li>';
        }
        openModal(
            '<div class="modal-icon-wrapper"><i class="fas fa-heart"></i></div>'
            + '<h2>' + escapeHtml(v.heading || 'Our Values') + '</h2>'
            + '<p class="modal-subtitle">' + escapeHtml(v.subheading || '') + '</p>'
            + '<ul>' + valueItems + '</ul>'
        );
    };
    if (card) {
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    }
    if (btn) btn.addEventListener('click', function (e) { e.stopPropagation(); open(); });
}

// ============================================
// LEADERS GRID
// ============================================
function renderLeaders() {
    var l = aboutContent.about_leaders_section || {};
    setText('leadersHeading', l.heading || 'OUR LEADERS');
    setText('leadersSub', l.subheading || 'Committed to Serve');
    setText('leadersBtnLabel', l.button_label || 'Meet Our Team');

    var grid = document.getElementById('leadersGrid');
    if (!grid) return;

    if (!leadersCache.length) {
        grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#5A6B85;">No leaders have been added yet.</p>';
        return;
    }

    grid.innerHTML = leadersCache.map(function (d, idx) {
        var img = d.image_url || '';
        var socials = '';
        if (d.facebook_url)  socials += '<a href="' + escapeHtml(d.facebook_url)  + '" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>';
        if (d.youtube_url)   socials += '<a href="' + escapeHtml(d.youtube_url)   + '" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>';
        if (d.x_url)         socials += '<a href="' + escapeHtml(d.x_url)         + '" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>';
        if (d.instagram_url) socials += '<a href="' + escapeHtml(d.instagram_url) + '" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>';
        if (d.tiktok_url)    socials += '<a href="' + escapeHtml(d.tiktok_url)    + '" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>';

        return '<article class="leader-card-lg" data-idx="' + idx + '" tabindex="0" role="button">'
            + '<div class="leader-photo">' + (img ? '<img src="' + escapeHtml(img) + '" alt="' + escapeHtml(d.name || '') + '" loading="eager" onerror="this.style.display=\'none\'">' : '') + '</div>'
            + '<div class="leader-card-body">'
            +   '<h3>' + escapeHtml(d.name || '') + '</h3>'
            +   '<p class="role">' + escapeHtml(d.role || '') + '</p>'
            +   (socials ? '<div class="leader-socials">' + socials + '</div>' : '')
            +   '<button class="btn-maroon" type="button"><span>View Profile</span> <i class="fas fa-arrow-right"></i></button>'
            + '</div>'
            + '</article>';
    }).join('');

    grid.querySelectorAll('.leader-card-lg').forEach(function (card) {
        var idx = parseInt(card.dataset.idx, 10);
        var open = function (e) {
            if (e && e.target && e.target.closest('.leader-socials')) return;
            openLeaderProfile(leadersCache[idx]);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openLeaderProfile(leadersCache[idx]); } });
    });

    var headerBtn = document.getElementById('leadersBtn');
    if (headerBtn) {
        headerBtn.onclick = function () {
            var section = document.getElementById('leaders');
            if (section) section.scrollIntoView({ behavior: 'smooth', block: 'start' });
        };
    }
}

// ============================================
// LEADER PROFILE PANEL
// ============================================
function openLeaderProfile(d) {
    if (!d) return;
    var img = d.image_url || '';
    var html = ''
        + (img ? '<img class="modal-panel-image" src="' + escapeHtml(img) + '" alt="" onerror="this.style.display=\'none\'">' : '')
        + '<h2>' + escapeHtml(d.name || '') + '</h2>'
        + (d.role ? '<p class="modal-subtitle">' + escapeHtml(d.role) + '</p>' : '')
        + (d.full_bio || d.bio ? '<p class="modal-description">' + escapeHtml(d.full_bio || d.bio) + '</p>' : '');

    if (d.ministry_background) {
        html += '<p class="modal-section-title">Ministry Background</p>'
              + '<p class="modal-description">' + escapeHtml(d.ministry_background) + '</p>';
    }
    if (d.vision) {
        html += '<p class="modal-section-title">Vision</p>'
              + '<p class="modal-description">' + escapeHtml(d.vision) + '</p>';
    }
    if (d.responsibilities) {
        html += '<p class="modal-section-title">Responsibilities</p>'
              + '<p class="modal-description">' + escapeHtml(d.responsibilities) + '</p>';
    }

    var contacts = [];
    if (d.phone)    contacts.push('<a class="modal-contact-btn" href="tel:' + escapeHtml(String(d.phone).replace(/\s/g, '')) + '"><i class="fas fa-phone"></i> ' + escapeHtml(d.phone) + '</a>');
    if (d.whatsapp) contacts.push('<a class="modal-contact-btn" href="https://wa.me/' + escapeHtml(d.whatsapp) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>');
    if (d.email)    contacts.push('<a class="modal-contact-btn" href="mailto:' + escapeHtml(d.email) + '"><i class="fas fa-envelope"></i> Email</a>');
    if (contacts.length) html += '<div class="modal-contact-row">' + contacts.join('') + '</div>';

    var socials = [];
    if (d.facebook_url)  socials.push('<a href="' + escapeHtml(d.facebook_url)  + '" target="_blank" rel="noopener" aria-label="Facebook"><i class="fab fa-facebook-f"></i></a>');
    if (d.youtube_url)   socials.push('<a href="' + escapeHtml(d.youtube_url)   + '" target="_blank" rel="noopener" aria-label="YouTube"><i class="fab fa-youtube"></i></a>');
    if (d.instagram_url) socials.push('<a href="' + escapeHtml(d.instagram_url) + '" target="_blank" rel="noopener" aria-label="Instagram"><i class="fab fa-instagram"></i></a>');
    if (d.tiktok_url)    socials.push('<a href="' + escapeHtml(d.tiktok_url)    + '" target="_blank" rel="noopener" aria-label="TikTok"><i class="fab fa-tiktok"></i></a>');
    if (d.x_url)         socials.push('<a href="' + escapeHtml(d.x_url)         + '" target="_blank" rel="noopener" aria-label="X"><i class="fab fa-x-twitter"></i></a>');
    if (socials.length) {
        html += '<div class="modal-leader-social"><span>Follow on:</span><div class="modal-leader-social-icons">' + socials.join('') + '</div></div>';
    }

    openModal(html);
}

// ============================================
// FOOTER VERSE + CONTACT
// ============================================
function renderFooter() {
    var f = aboutContent.footer || {};
    setText('footerTagline', f.tagline);
    setText('footerPhone', f.phone);
    setText('footerEmail', f.email);
    setText('footerAddress', f.address);
    setText('footerCopyrightName', f.copyright_name);

    var v = aboutContent.about_footer_verse || {};
    setText('verseText', v.text ? '"' + v.text + '"' : '');
    setText('verseRef', v.reference || '');
}

// ============================================
// LOAD DATA
// ============================================
async function loadAboutData() {
    console.log('📥 Loading About Us data...');
    try {
        var results = await Promise.all([
            window.db.getSiteContent(),
            window.db.getLeaders ? window.db.getLeaders() : Promise.resolve([])
        ]);
        aboutContent = results[0] || {};
        leadersCache = results[1] || [];
        console.log('✅ Leaders loaded:', leadersCache.length);

        renderHero();
        renderHistoryCard();
        renderPastorCard();
        renderMission();
        renderAccordions();
        renderVisionCard();
        renderValuesCard();
        renderLeaders();
        renderFooter();

        console.log('✅ About Us data loaded');
    } catch (err) {
        console.error('❌ About load error:', err);
    }
}

if (window.db) setTimeout(loadAboutData, 100);
else window.addEventListener('supabase-ready', loadAboutData);
setTimeout(function () { if (window.db && Object.keys(aboutContent).length === 0) loadAboutData(); }, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ about.js initialized');
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