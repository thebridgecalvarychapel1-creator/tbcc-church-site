// ============================================
// PLAN YOUR VISIT — Bridge Calvary Chapel
// ============================================

var visitContent = {};
var allMinistries = [];
var allReviews = [];
var selectedRating = 5;

// Church maps link (used by all directions buttons)
var CHURCH_MAP_LINK = 'https://maps.app.goo.gl/Rw7zyaQJJapp8GJE7';
var CHURCH_MAP_EMBED = 'https://www.google.com/maps?q=Jinja+Bell+Avenue,+Jinja,+Uganda&output=embed';

function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function secImg(name) { var s = visitContent[name] || {}; return s.image || s.hero_image || s.background_image || ''; }

// MODAL
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

// HERO
function renderHero() {
    var h = visitContent.visit_hero || {};
    setText('heroEyebrow', h.eyebrow || 'PLAN YOUR VISIT');
    setText('heroLine1', h.title_line1 || "We Can't Wait to");
    setText('heroLine2', h.title_line2 || 'Welcome You');
    setText('heroDesc', h.description || "Find our location, service times, and get everything you need for your visit.");
    var url = secImg('visit_hero');
    if (!url) url = 'https://mtmgvmvhgkoqjuhiqvsk.supabase.co/storage/v1/object/public/church-media/hero/hero.jpg';
    var bg = document.getElementById('heroBg');
    if (bg && url) bg.style.backgroundImage = 'url("' + url + '")';
    // Directions button uses the church link
    var btnDir = document.getElementById('btnDirections');
    if (btnDir) btnDir.href = CHURCH_MAP_LINK;
}

// INFO CARDS
function renderInfoCards() {
    var grid = document.getElementById('infoGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 4; i++) {
        var d = visitContent['visit_card_' + i];
        if (!d) continue;
        html += '<div class="info-card">'
            + '<div class="info-icon"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '<div class="info-card-content"><h3>' + escapeHtml(d.title || '') + '</h3><p>' + escapeHtml(d.short || '') + '</p></div>'
            + '<i class="fas fa-arrow-right info-arrow"></i>'
            + '</div>';
    }
    grid.innerHTML = html;
}

// FORM & FIND US
function renderFormAndFindUs() {
    var f = visitContent.visit_form || {};
    setText('formTitle', f.title || 'Plan Your Visit');
    setText('formSubtitle', f.description || "Let us know you're coming! Fill in the form below and we'll be ready to welcome you.");

    // Location info
    setText('findusAddress', 'Jinja Bell Avenue, opposite Ntake Bakery, Jinja');
    setText('findusParking', 'Free Parking Available');

    // Map iframe — uses the church embed
    var mapFrame = document.getElementById('mapFrame');
    if (mapFrame) mapFrame.src = CHURCH_MAP_EMBED;

    // Both directions buttons — point to your Google Maps link
    var mapBtn = document.getElementById('mapBtn');
    if (mapBtn) mapBtn.href = CHURCH_MAP_LINK;

    var btnDir = document.getElementById('btnDirections');
    if (btnDir) btnDir.href = CHURCH_MAP_LINK;
}

function populateMinistryDropdown() {
    var sel = document.getElementById('ministrySelect');
    if (!sel) return;
    sel.innerHTML = '<option value="">Select a ministry</option>';
    var fallback = [
        "Children's Ministry",
        'Life on Life Youth Ministry',
        'Hospital Ministry',
        "Women's Ministry",
        'Praise & Worship Ministry',
        'Lutindo Ministry'
    ];
    var names = allMinistries.length ? allMinistries.map(function(m){ return m.name; }) : fallback;
    names.forEach(function (name) {
        var opt = document.createElement('option');
        opt.value = name;
        opt.textContent = name;
        sel.appendChild(opt);
    });
}

// MINISTRIES
function renderMiniMinistries() {
    var grid = document.getElementById('miniMinistriesGrid');
    if (!grid) return;

    var list = allMinistries.length ? allMinistries.slice(0, 6) : [
        { name: "Children's Ministry", icon: 'fa-child', description: 'Teaching children about Jesus through fun, engaging Bible lessons, activities, and worship.' },
        { name: 'Life on Life Youth Ministry', icon: 'fa-users', description: 'Empowering young people to live out their faith boldly in today\'s culture.' },
        { name: 'Hospital Ministry', icon: 'fa-hospital', description: 'Bringing hope and healing to those in need through prayer and care.' },
        { name: "Women's Ministry", icon: 'fa-female', description: 'Empowering women to grow in faith, connect in community, and serve together.' },
        { name: 'Praise & Worship Ministry', icon: 'fa-music', description: 'Leading the church in authentic worship through music and the arts.' },
        { name: 'Lutindo Ministry', icon: 'fa-pray', description: 'Interceding for the church, community, and world through prayer.' }
    ];

    grid.innerHTML = list.map(function (m, i) {
        return '<div class="mini-ministry-item" data-min="' + i + '">'
            + '<div class="mm-icon"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            + '<div class="mm-text"><strong>' + escapeHtml(m.name || '') + '</strong><span>' + escapeHtml(m.description || '') + '</span></div>'
            + '<i class="fas fa-chevron-right mm-arrow"></i>'
            + '</div>';
    }).join('');

    grid.querySelectorAll('[data-min]').forEach(function (item) {
        item.addEventListener('click', function () {
            openMinistryModal(list[parseInt(item.dataset.min, 10)]);
        });
    });
}

function openMinistryModal(m) {
    if (!m) return;
    openModal('<div class="modal-icon-wrapper"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
        + '<h2>' + escapeHtml(m.name || '') + '</h2>'
        + '<p>' + escapeHtml(m.description || '') + '</p>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-primary" onclick="closeModal();openJoinMinistry(\'' + escapeHtml(m.name || '').replace(/\'/g, "\\'") + '\')" type="button"><i class="fas fa-user-plus"></i> Join This Ministry</button></div>');
}

window.openJoinMinistry = function (name) {
    openModal('<h2>Join ' + escapeHtml(name) + '</h2>'
        + '<form id="joinMinForm" class="modal-form">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone"></label>'
        + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit</button>'
        + '<p class="form-status"></p></form>');
    document.getElementById('joinMinForm').addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var st = ev.target.querySelector('.form-status');
        var btn = ev.target.querySelector('button[type="submit"]');
        st.textContent = 'Submitting...'; btn.disabled = true;
        var p = {}; new FormData(ev.target).forEach(function (v, k) { p[k] = v; });
        try {
            await window.db.submitVolunteerRequest({ ministry: name, name: p.name, email: p.email, phone: p.phone || null });
            st.textContent = '✅ Thank you!'; st.className = 'form-status success';
        } catch (err) { st.textContent = '❌ Error'; st.className = 'form-status error'; btn.disabled = false; }
    });
};

// WELCOME
function renderWelcome() {
    var w = visitContent.visit_welcome || {};
    setText('welcomeScript', w.title || 'You Are Welcome Here');
    var verseEl = document.getElementById('welcomeVerse');
    if (verseEl && w.verse_text) verseEl.innerHTML = escapeHtml(w.verse_text) + '<span class="ref">' + escapeHtml(w.verse_reference || '— Matthew 11:28') + '</span>';
    setText('welcomeMessage', w.description || 'No matter where you are on your spiritual journey, you are welcome at Bridge Calvary Chapel. Come as you are and discover a community that will love you, encourage you, and help you grow in your faith.');
    var url = secImg('visit_welcome');
    if (url) { var bg = document.getElementById('welcomeBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// HELP
function renderHelp() {
    var c = window.CHURCH_CONTACT || { whatsapp: '256793240756', email: 'thebridgecalvarychapel1@gmail.com' };
    setText('helpCallNumber', '+' + c.whatsapp);
    setText('helpEmailAddress', c.email);
    var call = document.getElementById('helpCall'); if (call) call.href = 'tel:+' + c.whatsapp;
    var wa = document.getElementById('helpWhatsApp'); if (wa) wa.href = 'https://wa.me/' + c.whatsapp;
    var em = document.getElementById('helpEmail'); if (em) em.href = 'mailto:' + c.email;
}

// REVIEWS
function renderReviews() {
    var grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    if (!allReviews.length) { grid.innerHTML = ''; return; }
    grid.innerHTML = allReviews.map(function (v) {
        var stars = '★'.repeat(v.rating || 5) + '☆'.repeat(5 - (v.rating || 5));
        var initial = (v.name || '?').substring(0, 1).toUpperCase();
        return '<div class="review-display-card">'
            + '<div class="rd-header"><div class="rd-avatar">' + initial + '</div><div class="rd-info"><h4>' + escapeHtml(v.name) + '</h4><span>' + escapeHtml(v.visit_label || '') + '</span></div></div>'
            + '<div class="rd-stars">' + stars + '</div>'
            + '<p class="rd-text">"' + escapeHtml(v.text) + '"</p>'
            + '</div>';
    }).join('');
}

window.openWriteReview = function () {
    var html = '<div class="modal-icon-wrapper"><i class="fas fa-star"></i></div>'
        + '<h2>Share Your Experience</h2>'
        + '<p>Your feedback helps us grow and serve better.</p>'
        + '<form id="reviewForm" class="modal-form">'
        + '<label>Display Name *<input type="text" name="name" required></label>'
        + '<label>Visit Date<input type="date" name="visit_label"></label>'
        + '<label>Your Rating *<div class="star-select" id="starSelect">'
        + '<i class="fas fa-star" data-r="1"></i><i class="fas fa-star" data-r="2"></i><i class="fas fa-star" data-r="3"></i><i class="fas fa-star" data-r="4"></i><i class="fas fa-star" data-r="5"></i>'
        + '</div><input type="hidden" name="rating" id="ratingInput" value="5"></label>'
        + '<label>Your Review *<textarea name="text" rows="4" required></textarea></label>'
        + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit Review</button>'
        + '<p class="form-status"></p></form>';
    openModal(html);

    var starEls = document.querySelectorAll('#starSelect i');
    starEls.forEach(function (s) { s.classList.add('active'); });

    starEls.forEach(function (star) {
        star.addEventListener('click', function () {
            var r = parseInt(star.dataset.r, 10);
            document.getElementById('ratingInput').value = r;
            starEls.forEach(function (s) {
                s.classList.toggle('active', parseInt(s.dataset.r, 10) <= r);
            });
        });
    });

    document.getElementById('reviewForm').addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var st = ev.target.querySelector('.form-status');
        var btn = ev.target.querySelector('button[type="submit"]');
        st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
        var payload = {};
        new FormData(ev.target).forEach(function (v, k) { payload[k] = v; });
        payload.rating = parseInt(payload.rating, 10) || 5;

        try {
            var res = await fetch('https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/reviews', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U',
                    'Prefer': 'return=representation'
                },
                body: JSON.stringify({
                    name: payload.name,
                    visit_label: payload.visit_label || '',
                    rating: payload.rating,
                    text: payload.text,
                    is_approved: true
                })
            });

            if (!res.ok) {
                var errBody = await res.json().catch(function(){ return {}; });
                throw new Error(errBody.message || errBody.hint || ('HTTP ' + res.status));
            }

            var saved = await res.json();
            if (saved && saved[0]) allReviews.unshift(saved[0]);

            st.textContent = '✅ Thank you! Your review has been posted.';
            st.className = 'form-status success';
            ev.target.reset();

            setTimeout(function () {
                closeModal();
                renderReviews();
                var grid = document.getElementById('reviewsGrid');
                if (grid) grid.scrollIntoView({ behavior: 'smooth', block: 'start' });
            }, 1200);

        } catch (err) {
            console.error('Review submit failed:', err);
            st.textContent = '❌ ' + (err.message || 'Error');
            st.className = 'form-status error';
            btn.disabled = false;
        }
    });
};

// SUBMIT VISIT FORM
async function handleVisitSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var status = document.getElementById('formStatus');
    var btn = document.getElementById('btnSubmitVisit');
    status.textContent = 'Submitting...'; status.className = 'form-status loading'; btn.disabled = true;
    var payload = {};
    new FormData(form).forEach(function (v, k) { payload[k] = v; });

    try {
        var res = await fetch('https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/visit_requests', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'apikey': 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U',
                'Prefer': 'return=minimal'
            },
            body: JSON.stringify({
                full_name: payload.full_name,
                email: payload.email,
                phone: payload.phone || null,
                preferred_date: payload.preferred_date || null,
                number_of_people: payload.number_of_people || null,
                ministry: payload.ministry || null,
                message: payload.message || null
            })
        });

        if (!res.ok) throw new Error('Failed to save');

        var c = window.CHURCH_CONTACT || { whatsapp: '256793240756' };
        var lines = ['Hello Bridge Calvary Chapel, I would like to plan my visit.', '', '👤 Name: ' + (payload.full_name || '—'), '📧 Email: ' + (payload.email || '—')];
        if (payload.phone) lines.push('📱 Phone: ' + payload.phone);
        if (payload.preferred_date) lines.push('📅 Preferred Date: ' + payload.preferred_date);
        if (payload.ministry) lines.push('🙏 Ministry: ' + payload.ministry);
        if (payload.message) lines.push('💬 Message: ' + payload.message);

        var waUrl = 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
        var emailUrl = 'mailto:' + (c.email || 'thebridgecalvarychapel1@gmail.com') + '?subject=' + encodeURIComponent('Visit Request') + '&body=' + encodeURIComponent(lines.join('\n'));

        openModal('<div class="modal-icon-wrapper" style="background:#22C55E;"><i class="fas fa-check"></i></div>'
            + '<h2>Your Visit Request Is Ready!</h2>'
            + '<p>Your information has been saved. Choose how you would like to send it to our church office:</p>'
            + '<div class="modal-actions">'
            + '<a class="modal-btn modal-btn-whatsapp" href="' + waUrl + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> WhatsApp</a>'
            + '<a class="modal-btn modal-btn-primary" href="' + emailUrl + '"><i class="fas fa-envelope"></i> Email</a>'
            + '</div>');

        status.textContent = '✅ Saved! Open WhatsApp or Email to send.';
        status.className = 'form-status success';
        form.reset();
    } catch (err) {
        status.textContent = '❌ Error saving. Please try again.';
        status.className = 'form-status error';
    } finally {
        btn.disabled = false;
    }
}

// LOAD
async function loadVisitData() {
    try {
        var content = await window.db.getSiteContent();
        var ministries = await window.db.getMinistries();
        visitContent = content || {};
        allMinistries = ministries || [];

        try {
            var revRes = await fetch('https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/reviews?select=*&is_approved=eq.true&limit=6&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U');
            allReviews = await revRes.json();
        } catch (e) {}

        renderHero();
        renderInfoCards();
        renderFormAndFindUs();
        populateMinistryDropdown();
        renderMiniMinistries();
        renderReviews();
        renderHelp();
        renderWelcome();
    } catch (err) { console.error('Visit load error:', err); }
}

if (window.db) setTimeout(loadVisitData, 100);
else window.addEventListener('supabase-ready', loadVisitData);

// DOM READY
document.addEventListener('DOMContentLoaded', function () {
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

    var form = document.getElementById('visitForm');
    if (form) form.addEventListener('submit', handleVisitSubmit);

    var btnWriteReview = document.getElementById('btnWriteReview');
    if (btnWriteReview) btnWriteReview.addEventListener('click', openWriteReview);

    // Prayer Request
    var helpPrayer = document.getElementById('helpPrayer');
    if (helpPrayer) helpPrayer.addEventListener('click', function () {
        openModal('<div class="modal-icon-wrapper"><i class="fas fa-pray"></i></div>'
            + '<h2>Prayer Request</h2>'
            + '<form id="prayerForm" class="modal-form">'
            + '<label>Your Name *<input type="text" name="name" required></label>'
            + '<label>Email *<input type="email" name="email" required></label>'
            + '<label>Prayer Request *<textarea name="message" required></textarea></label>'
            + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit</button>'
            + '<p class="form-status"></p></form>');
        document.getElementById('prayerForm').addEventListener('submit', async function (ev) {
            ev.preventDefault();
            var st = ev.target.querySelector('.form-status');
            var p = {}; new FormData(ev.target).forEach(function (v, k) { p[k] = v; });
            st.textContent = 'Submitting...';
            try {
                await window.db.submitVolunteerRequest({ ministry: 'Prayer Request', name: p.name, email: p.email, message: p.message });
                st.textContent = '✅ Sent!'; st.style.color = 'green';
                ev.target.reset();
            } catch (err) { st.textContent = '❌ Error'; }
        });
    });

    // Ask a Question
    var helpQuestion = document.getElementById('helpQuestion');
    if (helpQuestion) helpQuestion.addEventListener('click', function () {
        openModal('<div class="modal-icon-wrapper"><i class="fas fa-question-circle"></i></div>'
            + '<h2>Ask a Question</h2>'
            + '<form id="questionForm" class="modal-form">'
            + '<label>Your Name *<input type="text" name="name" required></label>'
            + '<label>Email *<input type="email" name="email" required></label>'
            + '<label>Question *<textarea name="message" required></textarea></label>'
            + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit</button>'
            + '<p class="form-status"></p></form>');
        document.getElementById('questionForm').addEventListener('submit', async function (ev) {
            ev.preventDefault();
            var st = ev.target.querySelector('.form-status');
            var p = {}; new FormData(ev.target).forEach(function (v, k) { p[k] = v; });
            st.textContent = 'Submitting...';
            try {
                await window.db.submitVolunteerRequest({ ministry: 'Question', name: p.name, email: p.email, message: p.message });
                st.textContent = '✅ Sent!'; st.style.color = 'green';
                ev.target.reset();
            } catch (err) { st.textContent = '❌ Error'; }
        });
    });

    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
});