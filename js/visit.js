// ============================================
// PLAN YOUR VISIT — Bridge Calvary Chapel
// File: js/visit.js
// ============================================

var visitContent = {};
var allMinistries = [];
var allReviews = [];

function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function escapeHtml(str) { if (!str) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function secImg(name) { var s = visitContent[name] || {}; return s.image || s.hero_image || s.background_image || ''; }

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
    var h = visitContent.visit_hero || {};
    setText('heroEyebrow', h.eyebrow);
    setText('heroLine1', h.title_line1);
    setText('heroLine2', h.title_line2);
    setText('heroDesc', h.description);
    setText('heroScript', h.script_text || 'You Belong Here');
    var url = secImg('visit_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// ============================================
// INFO CARDS
// ============================================
function renderInfoCards() {
    var grid = document.getElementById('infoGrid');
    if (!grid) return;
    var html = '';
    for (var i = 1; i <= 6; i++) {
        var d = visitContent['visit_card_' + i];
        if (!d) continue;
        html += '<div class="info-card" data-card="' + i + '" tabindex="0" role="button">'
            + '<div class="info-icon"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div>'
            + '<h3>' + escapeHtml(d.title || '') + '</h3>'
            + '<p>' + escapeHtml(d.short || '') + '</p>'
            + '<span class="info-cta">' + escapeHtml(d.cta || 'Learn More') + ' <i class="fas fa-arrow-right"></i></span></div>';
    }
    grid.innerHTML = html;
    grid.querySelectorAll('[data-card]').forEach(function (card) {
        var open = function () { openInfoModal(card.dataset.card); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

function openInfoModal(n) {
    var d = visitContent['visit_card_' + n];
    if (!d) return;
    openModal('<div class="modal-icon-wrapper"><i class="fas ' + (d.icon || 'fa-star') + '"></i></div><h2>' + escapeHtml(d.title || '') + '</h2><p>' + escapeHtml(d.detail || '') + '</p><div class="modal-actions"><button class="modal-btn modal-btn-primary" onclick="closeModal();document.getElementById(\'visitForm\').scrollIntoView({behavior:\'smooth\'})" type="button"><i class="fas fa-calendar-check"></i> Plan My Visit</button></div>');
}

// ============================================
// FORM + FIND US
// ============================================
function renderFormAndFindUs() {
    var f = visitContent.visit_form || {};
    setText('formTitle', f.title);
    setText('formSubtitle', f.description);
    setText('submitLabel', f.button_text || 'Submit My Visit');

    var fu = visitContent.visit_findus || {};
    setText('findusTitle', fu.title);
    setText('findusAddress', fu.address);
    setText('findusPhone', fu.phone);
    setText('findusEmail', fu.email);
    setText('findusService1', fu.service_1);
    setText('findusService2', fu.service_2);
    setText('findusService3', fu.service_3);
    setText('findusParking', fu.parking);
    var mapFrame = document.getElementById('mapFrame');
    if (mapFrame && fu.map_embed) mapFrame.src = fu.map_embed;
    var mapBtn = document.getElementById('mapBtn');
    if (mapBtn && fu.map_link) mapBtn.href = fu.map_link;
    var btnDir = document.getElementById('btnDirections');
    if (btnDir && fu.map_link) btnDir.href = fu.map_link;
}

function populateMinistryDropdown() {
    var sel = document.getElementById('ministrySelect');
    if (!sel || !allMinistries.length) return;
    sel.innerHTML = '<option value="">Select a ministry...</option>';
    allMinistries.forEach(function (m) {
        var opt = document.createElement('option');
        opt.value = m.name;
        opt.textContent = m.name;
        sel.appendChild(opt);
    });
}

// ============================================
// MINI MINISTRIES
// ============================================
function renderMiniMinistries() {
    var info = visitContent.visit_ministries || {};
    setText('minLabel', info.label);
    setText('minTitle', info.title);
    setText('minDesc', info.description);
    var btn = document.getElementById('minBtn');
    if (btn) btn.innerHTML = escapeHtml(info.button_text || 'Explore All Ministries') + ' <i class="fas fa-arrow-right"></i>';

    var grid = document.getElementById('miniMinistriesGrid');
    if (!grid) return;
    var list = allMinistries.slice(0, 8);
    grid.innerHTML = list.map(function (m, i) {
        return '<div class="mini-ministry-card" data-min="' + i + '" tabindex="0" role="button">'
            + '<img src="' + escapeHtml(m.image_url || '') + '" alt="" onerror="this.style.display=\'none\'">'
            + '<div class="mini-ministry-icon"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            + '<div class="mini-ministry-overlay"><h4>' + escapeHtml(m.name || '') + '</h4><span>Click to Learn More <i class="fas fa-arrow-right"></i></span></div></div>';
    }).join('');
    grid.querySelectorAll('[data-min]').forEach(function (card) {
        var open = function () { openMinistryModal(list[parseInt(card.dataset.min, 10)]); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

function openMinistryModal(m) {
    if (!m) return;
    var html = '<div class="modal-icon-wrapper"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
        + '<h2>' + escapeHtml(m.name || '') + '</h2>'
        + '<p>' + escapeHtml(m.description || '') + '</p>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-primary" onclick="closeModal();openJoinMinistry(\'' + escapeHtml(m.name || '').replace(/\'/g, "\\'") + '\')" type="button"><i class="fas fa-user-plus"></i> Join This Ministry</button>'
        +   '<button class="modal-btn modal-btn-secondary" onclick="closeModal();openSupportMinistry(\'' + escapeHtml(m.name || '').replace(/\'/g, "\\'") + '\')" type="button"><i class="fas fa-heart"></i> Support</button>'
        + '</div>';
    openModal(html);
}

window.openJoinMinistry = function (name) {
    var html = '<h2>Join ' + escapeHtml(name) + '</h2><p>Fill in your details and we\'ll be in touch.</p>'
        + '<form id="joinMinForm" class="modal-form">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone"></label>'
        + '<label>Message<textarea name="message" rows="3"></textarea></label>'
        + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit Request</button>'
        + '<p class="form-status"></p></form>';
    openModal(html);
    document.getElementById('joinMinForm').addEventListener('submit', async function (ev) {
        ev.preventDefault();
        var st = ev.target.querySelector('.form-status');
        var btn = ev.target.querySelector('button[type="submit"]');
        st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
        var p = {}; new FormData(ev.target).forEach(function (v, k) { p[k] = v; });
        try {
            await window.db.submitVolunteerRequest({ ministry: name, name: p.name, email: p.email, phone: p.phone || null, message: p.message || '' });
            st.textContent = '✅ Thank you!'; st.className = 'form-status success'; ev.target.reset();
        } catch (err) { st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false; }
    });
};

window.openSupportMinistry = function (name) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var html = '<h2>Support ' + escapeHtml(name) + '</h2><p>To give toward <strong>' + escapeHtml(name) + '</strong>, please contact our church office.</p>'
        + '<div style="background:#F1F8FF;border-left:3px solid #078BFF;border-radius:8px;padding:14px 16px;margin:14px 0;">'
        + '<p style="margin:6px 0;font-size:13px;color:#041A3A;"><strong>WhatsApp:</strong> +' + c.whatsapp + '</p>'
        + '<p style="margin:6px 0;font-size:13px;color:#041A3A;"><strong>Email:</strong> ' + c.email + '</p>'
        + '</div><div class="modal-actions"><a class="modal-btn modal-btn-whatsapp" href="https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent('I would like to support the ' + name + ' ministry') + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Contact on WhatsApp</a></div>';
    openModal(html);
};

// ============================================
// REVIEWS
// ============================================
function renderReviews() {
    var r = visitContent.visit_reviews || {};
    setText('revLabel', r.label);
    setText('revTitle', r.title);
    setText('revDesc', r.description);
    setText('revBtnLabel', r.button_text || 'Write a Review');
    var grid = document.getElementById('reviewsGrid');
    if (!grid) return;
    if (!allReviews.length) { grid.innerHTML = '<p style="color:#49658A;padding:20px;">No reviews yet.</p>'; return; }
    grid.innerHTML = allReviews.map(function (v) {
        var stars = '★'.repeat(v.rating || 5) + '☆'.repeat(5 - (v.rating || 5));
        var initial = (v.name || '?').substring(0, 1).toUpperCase();
        return '<div class="review-card"><div class="review-header">'
            + '<div class="review-avatar">' + (v.image_url ? '<img src="' + escapeHtml(v.image_url) + '" alt="">' : initial) + '</div>'
            + '<div><div class="review-name">' + escapeHtml(v.name) + '</div><div class="review-date">' + escapeHtml(v.visit_label || '') + '</div></div>'
            + '</div><div class="review-stars">' + stars + '</div><p class="review-text">"' + escapeHtml(v.text) + '"</p></div>';
    }).join('');
}

window.openWriteReview = function () {
    var html = '<div class="modal-icon-wrapper"><i class="fas fa-star"></i></div>'
        + '<h2>Write a Review</h2><p>Share your experience at Bridge Calvary Chapel.</p>'
        + '<form id="reviewForm" class="modal-form">'
        + '<label>Display Name *<input type="text" name="name" required></label>'
        + '<label>Visit Date<input type="text" name="visit_label" placeholder="e.g. Visited June 2025"></label>'
        + '<label>Your Rating *<div class="star-select" id="starSelect">'
        + '<i class="fas fa-star" data-r="1"></i><i class="fas fa-star" data-r="2"></i><i class="fas fa-star" data-r="3"></i><i class="fas fa-star" data-r="4"></i><i class="fas fa-star" data-r="5"></i>'
        + '</div><input type="hidden" name="rating" id="ratingInput" value="5"></label>'
        + '<label>Your Review *<textarea name="text" rows="4" required></textarea></label>'
        + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit Review</button>'
        + '<p class="form-status"></p></form>';
    openModal(html);
    document.querySelectorAll('.star-select i').forEach(function (star) {
        star.addEventListener('click', function () {
            var r = parseInt(star.dataset.r, 10);
            document.getElementById('ratingInput').value = r;
            document.querySelectorAll('.star-select i').forEach(function (s) { s.classList.toggle('active', parseInt(s.dataset.r, 10) <= r); });
        });
    });
    document.querySelectorAll('.star-select i').forEach(function (s) { s.classList.add('active'); });
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
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify(Object.assign({}, payload, { is_approved: false }))
            });
            if (!res.ok) throw new Error('Failed to save');
            st.textContent = '✅ Thank you! Your review will appear after approval.'; st.className = 'form-status success';
            ev.target.reset();
            setTimeout(closeModal, 1800);
        } catch (err) { st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false; }
    });
};

// ============================================
// HELP
// ============================================
function renderHelp() {
    var h = visitContent.visit_help || {};
    setText('helpTitle', h.title);
    setText('helpDesc', h.description);
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    setText('helpCallNumber', '+' + c.whatsapp);
    setText('helpEmailAddress', c.email);
    var call = document.getElementById('helpCall'); if (call) call.href = 'tel:+' + c.whatsapp;
    var wa = document.getElementById('helpWhatsApp'); if (wa) wa.href = 'https://wa.me/' + c.whatsapp;
    var em = document.getElementById('helpEmail'); if (em) em.href = 'mailto:' + c.email;
}

// ============================================
// WELCOME
// ============================================
function renderWelcome() {
    var w = visitContent.visit_welcome || {};
    setText('welcomeScript', w.title);
    var verseEl = document.getElementById('welcomeVerse');
    if (verseEl && w.verse_text) verseEl.innerHTML = escapeHtml(w.verse_text) + '<span class="ref">' + escapeHtml(w.verse_reference || '') + '</span>';
    setText('welcomeMessage', w.description);
    var url = secImg('visit_welcome');
    if (url) { var bg = document.getElementById('welcomeBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// ============================================
// FOOTER
// ============================================
function renderFooter() {
    var f = visitContent.footer || {};
    setText('footerTagline', f.tagline);
    setText('footerPhone', f.phone);
    setText('footerEmail', f.email);
    setText('footerAddress', f.address);
    setText('footerCopyrightName', f.copyright_name);
}

// ============================================
// VISIT FORM SUBMIT
// ============================================
async function handleVisitSubmit(e) {
    e.preventDefault();
    var form = e.target;
    var status = document.getElementById('formStatus');
    var btn = document.getElementById('btnSubmitVisit');
    status.textContent = 'Submitting...'; status.className = 'form-status loading'; btn.disabled = true;
    var payload = {};
    new FormData(form).forEach(function (v, k) { payload[k] = v; });
    if (!payload.full_name || !payload.email) { status.textContent = '❌ Please fill in required fields.'; status.className = 'form-status error'; btn.disabled = false; return; }
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
                first_time: payload.first_time || null,
                ministry: payload.ministry || null,
                message: payload.message || null
            })
        });
        if (!res.ok) throw new Error('Failed to save');
        var c = window.CHURCH_CONTACT || { whatsapp: '' };
        var lines = [];
        lines.push('Hello Bridge Calvary Chapel, I would like to plan my visit.');
        lines.push('');
        lines.push('👤 Name: ' + (payload.full_name || '—'));
        lines.push('📧 Email: ' + (payload.email || '—'));
        if (payload.phone) lines.push('📱 Phone: ' + payload.phone);
        if (payload.preferred_date) lines.push('📅 Preferred Date: ' + payload.preferred_date);
        if (payload.number_of_people) lines.push('👥 Number of People: ' + payload.number_of_people);
        if (payload.first_time) lines.push('🆕 First Time: ' + payload.first_time);
        if (payload.ministry) lines.push('🙏 Ministry of Interest: ' + payload.ministry);
        if (payload.message) lines.push('💬 Message: ' + payload.message);
        lines.push('');
        lines.push('Sent from Bridge Calvary Chapel website');
        var waUrl = 'https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(lines.join('\n'));
        openModal('<div class="modal-icon-wrapper" style="background:linear-gradient(120deg,#22C55E,#16A34A);"><i class="fas fa-check"></i></div><h2>Your Visit Request Is Ready!</h2><p>Your information has been saved. Click below to send your visit details to our church office via WhatsApp.</p><div class="modal-actions"><a class="modal-btn modal-btn-whatsapp" href="' + waUrl + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Send Visit Details on WhatsApp</a></div><p style="font-size:11px;color:#49658A;text-align:center;margin-top:10px;">WhatsApp will open with your message pre-filled. Please press Send to complete.</p><div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>');
        status.textContent = '✅ Saved! Open WhatsApp to send.'; status.className = 'form-status success';
        form.reset();
    } catch (err) { status.textContent = '❌ ' + (err.message || 'Error'); status.className = 'form-status error'; }
    finally { btn.disabled = false; }
}

// ============================================
// LOAD
// ============================================
async function loadVisitData() {
    console.log('📥 Loading visit page data...');
    try {
        var content = await window.db.getSiteContent();
        var ministries = await window.db.getMinistries();
        visitContent = content || {};
        allMinistries = ministries || [];
        try {
            var revRes = await fetch('https://mtmgvmvhgkoqjuhiqvsk.supabase.co/rest/v1/reviews?select=*&is_approved=eq.true&limit=6&apikey=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im10bWd2bXZoZ2tvcWp1aGlxdnNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE1NDUxNTEsImV4cCI6MjEwNzEyMTE1MX0.NqaWJyVulLgAvakFDqn5M8TD-IpSSgSn2LLEmL16c_U');
            allReviews = await revRes.json();
        } catch (e) {}
        renderHero(); renderInfoCards(); renderFormAndFindUs(); populateMinistryDropdown();
        renderMiniMinistries(); renderReviews(); renderHelp(); renderWelcome(); renderFooter();
        console.log('✅ Visit page loaded: ' + allMinistries.length + ' ministries');
    } catch (err) { console.error('❌ Visit load error:', err); }
}

if (window.db) setTimeout(loadVisitData, 100);
else window.addEventListener('supabase-ready', loadVisitData);
setTimeout(function () { if (window.db && Object.keys(visitContent).length === 0) loadVisitData(); }, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ visit.js initialized');
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
    var form = document.getElementById('visitForm');
    if (form) form.addEventListener('submit', handleVisitSubmit);
    var btnWrite = document.getElementById('btnWriteReview');
    if (btnWrite) btnWrite.addEventListener('click', openWriteReview);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
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
    var y = document.getElementById('currentYear'); if (y) y.textContent = new Date().getFullYear();
});