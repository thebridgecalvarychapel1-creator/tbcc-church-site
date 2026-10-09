// ============================================
// BRIDGE CALVARY CHAPEL — ABOUT US PAGE
// File: js/about.js
// ============================================

var aboutContent = {};

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

// ============================================
// RENDER HERO
// ============================================
function renderHero() {
    var h = aboutContent.about_hero || {};
    setText('heroEyebrow', h.eyebrow);
    setText('heroDescription', h.description);

    var titleEl = document.getElementById('heroTitle');
    if (titleEl && h.title) {
        var html = h.title;
        if (h.title_highlight) {
            html = h.title.replace(h.title_highlight, '<span class="highlight">' + h.title_highlight + '</span>');
        }
        titleEl.innerHTML = html;
    }
    if (h.hero_image) {
        var bg = document.getElementById('heroBg');
        if (bg) bg.style.backgroundImage = 'url("' + h.hero_image + '")';
    }
}

// ============================================
// RENDER VALUES (4 cards)
// ============================================
function renderValues() {
    var grid = document.getElementById('valuesGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 4; i++) {
        var d = aboutContent['about_value_' + i];
        if (!d) continue;
        html += '<article class="value-card" data-modal="value_' + i + '" tabindex="0" role="button">'
            + '<div class="value-card-icon"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '<h3>' + (d.title || '') + '</h3>'
            + '<p>' + (d.desc || '') + '</p>'
            + '</article>';
    }
    grid.innerHTML = html;

    grid.querySelectorAll('[data-modal]').forEach(function (el) {
        el.addEventListener('click', function () { openValueModal(el.dataset.modal.replace('value_', '')); });
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); el.click(); }
        });
    });
}

window.openValueModal = function (num) {
    var d = aboutContent['about_value_' + num];
    if (!d) return;
    var html = ''
        + '<div class="modal-icon-wrapper"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
        + '<h2>' + (d.title || '') + '</h2>'
        + '<p class="modal-description">' + (d.detail || d.desc || '') + '</p>';
    openModal(html);
};

// ============================================
// RENDER HISTORY
// ============================================
function renderHistory() {
    var h = aboutContent.about_history || {};

    setText('historyLabel', h.label);
    var titleEl = document.getElementById('historyTitle');
    if (titleEl && h.title) {
        var html = h.title;
        if (h.title_highlight) {
            html = h.title.replace(h.title_highlight, '<span class="highlight">' + h.title_highlight + '</span>');
        }
        titleEl.innerHTML = html;
    }

    var textHTML = '';
    if (h.paragraph1) textHTML += '<p class="history-text">' + h.paragraph1 + '</p>';
    if (h.paragraph2) textHTML += '<p class="history-text">' + h.paragraph2 + '</p>';
    if (h.paragraph3) textHTML += '<p class="history-text">' + h.paragraph3 + '</p>';
    setHTML('historyText', textHTML);

    // Collage
    var collage = document.getElementById('historyCollage');
    if (collage) {
        var collageHTML = ''
            + '<div class="collage-main" data-img="' + (h.main_image || '') + '">'
            +   '<img src="' + (h.main_image || '') + '" alt="Church history" onerror="this.style.display=\'none\'">'
            + '</div>'
            + '<div class="collage-small collage-small-1" data-img="' + (h.small_image_1 || '') + '">'
            +   '<img src="' + (h.small_image_1 || '') + '" alt="Fellowship" onerror="this.style.display=\'none\'">'
            + '</div>'
            + '<div class="collage-small collage-small-2" data-img="' + (h.small_image_2 || '') + '">'
            +   '<img src="' + (h.small_image_2 || '') + '" alt="Worship" onerror="this.style.display=\'none\'">'
            + '</div>'
            + '<div class="collage-small collage-small-3" data-img="' + (h.small_image_3 || '') + '">'
            +   '<img src="' + (h.small_image_3 || '') + '" alt="Community" onerror="this.style.display=\'none\'">'
            + '</div>';
        collage.innerHTML = collageHTML;

        collage.querySelectorAll('[data-img]').forEach(function (el) {
            el.addEventListener('click', function () {
                var img = el.dataset.img;
                if (!img) return;
                openModal('<h2>Our Story</h2><img class="modal-panel-image" src="' + img + '" alt="Church history"><p class="modal-description">' + (h.paragraph1 || '') + '</p>');
            });
        });
    }

    // Stats
    var stats = document.getElementById('historyStats');
    if (stats) {
        var statsHTML = '';
        for (var i = 1; i <= 4; i++) {
            var num = h['stat' + i + '_number'];
            var label = h['stat' + i + '_label'];
            var icon = h['stat' + i + '_icon'];
            if (!num) continue;
            statsHTML += '<div class="stat-row">'
                + '<div class="stat-icon"><i class="fas ' + (icon || 'fa-chart-bar') + '"></i></div>'
                + '<div class="stat-content">'
                +   '<span class="stat-number">' + num + '</span>'
                +   '<span class="stat-label">' + (label || '') + '</span>'
                + '</div>'
                + '</div>';
        }
        stats.innerHTML = statsHTML;
    }
}

// ============================================
// RENDER MISSION
// ============================================
function renderMission() {
    var m = aboutContent.about_mission || {};
    setText('missionLabel', m.label);
    setText('missionTitle', m.title);
    setText('missionDesc', m.description);
    if (m.background_image) {
        var bg = document.getElementById('missionBg');
        if (bg) bg.style.backgroundImage = 'url("' + m.background_image + '")';
    }

    var pills = document.getElementById('missionPills');
    if (!pills) return;
    var html = '';
    for (var i = 1; i <= 5; i++) {
        var p = aboutContent['about_mission_pillar_' + i];
        if (!p) continue;
        html += '<button class="mission-pill" data-modal="mission_' + i + '" type="button">'
            + '<span class="mission-pill-icon"><i class="fas ' + (p.icon || 'fa-star') + '"></i></span>'
            + '<span>' + (p.label || '') + '</span>'
            + '</button>';
    }
    pills.innerHTML = html;

    pills.querySelectorAll('[data-modal]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var key = btn.dataset.modal;
            var d = aboutContent[key] || aboutContent['about_' + key];
            if (!d) return;
            var detail = d.detail || '';
            var scripture = d.scripture || '';
            var html = ''
                + '<div class="modal-icon-wrapper"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
                + '<h2>' + (d.label || '') + '</h2>'
                + '<p class="modal-description">' + detail + '</p>'
                + (scripture ? '<div class="modal-scripture"><p>' + scripture + '</p></div>' : '');
            openModal(html);
        });
    });
}

// ============================================
// RENDER VISION
// ============================================
function renderVision() {
    var v = aboutContent.about_vision || {};
    setText('visionLabel', v.label);

    var grid = document.getElementById('visionGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 5; i++) {
        var d = aboutContent['about_vision_' + i];
        if (!d) continue;
        html += '<div class="vision-step" data-modal="vision_' + i + '" tabindex="0" role="button">'
            + '<div class="vision-number">' + (d.number || '0' + i) + '</div>'
            + '<h3>' + (d.title || '') + '</h3>'
            + '<p>' + (d.desc || '') + '</p>'
            + '</div>';
    }
    grid.innerHTML = html;

    grid.querySelectorAll('[data-modal]').forEach(function (el) {
        var open = function () {
            var num = el.dataset.modal.replace('vision_', '');
            var d = aboutContent['about_vision_' + num];
            if (!d) return;
            var html = ''
                + '<div class="modal-icon-wrapper"><i class="fas fa-cross"></i></div>'
                + '<h2>' + (d.title || '') + '</h2>'
                + '<p class="modal-subtitle">Vision Step ' + (d.number || '0' + num) + '</p>'
                + '<p class="modal-description">' + (d.detail || d.desc || '') + '</p>'
                + (d.scripture ? '<div class="modal-scripture"><p>' + d.scripture + '</p></div>' : '');
            openModal(html);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER BELIEFS
// ============================================
function renderBeliefs() {
    var b = aboutContent.about_beliefs || {};
    setText('beliefsLabel', b.label);
    setText('beliefsTitle', b.title);

    var cards = document.getElementById('beliefsCards');
    if (!cards) return;
    var html = '';
    for (var i = 1; i <= 6; i++) {
        var d = aboutContent['about_belief_' + i];
        if (!d) continue;
        html += '<div class="belief-card" data-modal="belief_' + i + '" tabindex="0" role="button">'
            + '<div class="belief-card-icon"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '<div>'
            +   '<h4>' + (d.title || '') + '</h4>'
            +   '<p>' + (d.desc || '') + '</p>'
            + '</div>'
            + '</div>';
    }
    cards.innerHTML = html;

    cards.querySelectorAll('[data-modal]').forEach(function (el) {
        var open = function () {
            var num = el.dataset.modal.replace('belief_', '');
            var d = aboutContent['about_belief_' + num];
            if (!d) return;
            var html = ''
                + '<div class="modal-icon-wrapper"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
                + '<h2>' + (d.title || '') + '</h2>'
                + '<p class="modal-subtitle">' + (d.desc || '') + '</p>'
                + '<p class="modal-description">' + (d.detail || '') + '</p>'
                + (d.scripture ? '<div class="modal-scripture"><p>' + d.scripture + '</p></div>' : '');
            openModal(html);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER CORE VALUES
// ============================================
function renderCore() {
    var c = aboutContent.about_core || {};
    setText('coreLabel', c.label);

    var grid = document.getElementById('coreGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 5; i++) {
        var d = aboutContent['about_core_' + i];
        if (!d) continue;
        html += '<div class="core-card" data-modal="core_' + i + '" tabindex="0" role="button">'
            + '<div class="core-image">'
            +   '<img src="' + (d.image || '') + '" alt="' + (d.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="core-icon-badge"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '</div>'
            + '<div class="core-body">'
            +   '<h4>' + (d.title || '') + '</h4>'
            +   '<p>' + (d.desc || '') + '</p>'
            + '</div>'
            + '</div>';
    }
    grid.innerHTML = html;

    grid.querySelectorAll('[data-modal]').forEach(function (el) {
        var open = function () {
            var num = el.dataset.modal.replace('core_', '');
            var d = aboutContent['about_core_' + num];
            if (!d) return;
            var html = ''
                + '<img class="modal-panel-image" src="' + (d.image || '') + '" alt="' + (d.title || '') + '" onerror="this.style.display=\'none\'">'
                + '<h2>' + (d.title || '') + '</h2>'
                + '<p class="modal-description">' + (d.detail || '') + '</p>'
                + (d.scripture ? '<div class="modal-scripture"><p>' + d.scripture + '</p></div>' : '');
            openModal(html);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER LEADERSHIP
// ============================================
function renderLeadership() {
    var l = aboutContent.about_leadership || {};
    setText('leadershipLabel', l.label);
    setText('leadershipSubtitle', l.subtitle);

    var grid = document.getElementById('leadershipGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 3; i++) {
        var d = aboutContent['about_leader_' + i];
        if (!d) continue;
        html += '<div class="leader-card" data-modal="leader_' + i + '" tabindex="0" role="button">'
            + '<div class="leader-portrait">'
            +   '<img src="' + (d.image || '') + '" alt="' + (d.name || '') + '" onerror="this.style.background=\'linear-gradient(135deg,#031B43,#005BEA)\'">'
            + '</div>'
            + '<div class="leader-info">'
            +   '<h3>' + (d.name || '') + '</h3>'
            +   '<span class="leader-role">' + (d.role || '') + '</span>'
            +   '<p>' + (d.bio || '') + '</p>'
            + '</div>'
            + '</div>';
    }
    grid.innerHTML = html;

    grid.querySelectorAll('[data-modal]').forEach(function (el) {
        var open = function () {
            var num = el.dataset.modal.replace('leader_', '');
            var d = aboutContent['about_leader_' + num];
            if (!d) return;
            var html = ''
                + '<img class="modal-panel-image" src="' + (d.image || '') + '" alt="' + (d.name || '') + '" onerror="this.style.display=\'none\'">'
                + '<h2>' + (d.name || '') + '</h2>'
                + '<p class="modal-subtitle">' + (d.role || '') + '</p>'
                + '<p class="modal-description">' + (d.full_bio || d.bio || '') + '</p>';
            openModal(html);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER COMMUNITY
// ============================================
function renderCommunity() {
    var c = aboutContent.about_community || {};
    setText('communityLabel', c.label);
    setText('communityTitle', c.title);

    var grid = document.getElementById('communityGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 4; i++) {
        var d = aboutContent['about_community_' + i];
        if (!d) continue;
        html += '<div class="community-card" data-modal="community_' + i + '" tabindex="0" role="button">'
            + '<div class="community-image">'
            +   '<img src="' + (d.image || '') + '" alt="' + (d.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="community-icon"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '</div>'
            + '<div class="community-body">'
            +   '<h4>' + (d.title || '') + '</h4>'
            +   '<p>' + (d.desc || '') + '</p>'
            + '</div>'
            + '</div>';
    }
    grid.innerHTML = html;

    grid.querySelectorAll('[data-modal]').forEach(function (el) {
        var open = function () {
            var num = el.dataset.modal.replace('community_', '');
            var d = aboutContent['about_community_' + num];
            if (!d) return;
            var html = ''
                + '<img class="modal-panel-image" src="' + (d.image || '') + '" alt="' + (d.title || '') + '" onerror="this.style.display=\'none\'">'
                + '<h2>' + (d.title || '') + '</h2>'
                + '<p class="modal-description">' + (d.detail || '') + '</p>';
            openModal(html);
        };
        el.addEventListener('click', open);
        el.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// RENDER WELCOME
// ============================================
function renderWelcome() {
    var w = aboutContent.about_welcome || {};
    setText('welcomeTitle', w.title);
    setText('welcomeDesc', w.desc);
    if (w.background_image) {
        var bg = document.getElementById('welcomeBg');
        if (bg) bg.style.backgroundImage = 'url("' + w.background_image + '")';
    }
}

// ============================================
// RENDER FOOTER
// ============================================
function renderFooter() {
    var f = aboutContent.footer || {};
    setText('footerTagline', f.tagline);
    setText('footerPhone', f.phone);
    setText('footerEmail', f.email);
    setText('footerAddress', f.address);
    setText('footerCopyrightName', f.copyright_name);
}

// ============================================
// VIDEO MODAL
// ============================================
window.openVideo = function () {
    var modal = document.getElementById('videoModal');
    var video = document.getElementById('aboutVideo');
    if (!modal || !video) return;
    var url = (aboutContent.about_hero && aboutContent.about_hero.video_url) || 'assets/videos/welcome.mp4';
    if (video.getAttribute('src') !== url) video.setAttribute('src', url);
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    try { video.play().catch(function () {}); } catch (e) {}
};

window.closeVideo = function () {
    var modal = document.getElementById('videoModal');
    var video = document.getElementById('aboutVideo');
    if (!modal) return;
    modal.classList.remove('active');
    document.body.style.overflow = '';
    if (video) { try { video.pause(); } catch (e) {} }
};

// ============================================
// LOAD DATA
// ============================================
async function loadAboutData() {
    console.log('📥 Loading About Us data...');
    try {
        var content = await window.db.getSiteContent();
        aboutContent = content || {};

        renderHero();
        renderValues();
        renderHistory();
        renderMission();
        renderVision();
        renderBeliefs();
        renderCore();
        renderLeadership();
        renderCommunity();
        renderWelcome();
        renderFooter();

        console.log('✅ About Us data loaded');
    } catch (err) {
        console.error('❌ About load error:', err);
    }
}

window.addEventListener('supabase-ready', loadAboutData);
setTimeout(function () {
    if (window.db && Object.keys(aboutContent).length === 0) loadAboutData();
}, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ about.js initialized');

    // Navbar scroll
    var navbar = document.getElementById('navbar');
    if (navbar) {
        window.addEventListener('scroll', function () {
            navbar.classList.toggle('scrolled', window.pageYOffset > 40);
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

    // Watch story button
    var btnWatch = document.getElementById('btnWatchStory');
    if (btnWatch) btnWatch.addEventListener('click', openVideo);

    // Video close
    document.querySelectorAll('[data-close-video]').forEach(function (el) {
        el.addEventListener('click', closeVideo);
    });

    // Modal close
    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Escape
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeModal(); closeVideo(); }
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

    // Follow our journey
    var btnFollow = document.getElementById('btnFollowJourney');
    if (btnFollow) {
        btnFollow.addEventListener('click', function (e) {
            e.preventDefault();
            alert('Follow us on social media using the icons below!');
        });
    }

    // Year
    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});