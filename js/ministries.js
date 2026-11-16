// ============================================
// MINISTRIES PAGE — Bridge Calvary Chapel
// File: js/ministries.js
// ============================================

var siteContent = {};
var allMinistries = [];

function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;');
}
function secImg(name) { var s = siteContent[name] || {}; return s.image || s.image_url || s.hero_image || s.background_image || ''; }

function parseGallery(g) {
    if (!g) return [];
    if (Array.isArray(g)) return g.filter(Boolean);
    return String(g).split(',').map(function (s) { return s.trim(); }).filter(Boolean);
}

function videoEmbedUrl(url) {
    if (!url) return '';
    var u = String(url).trim();
    var yt = u.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([A-Za-z0-9_-]{6,})/);
    if (yt) return 'https://www.youtube.com/embed/' + yt[1];
    var vm = u.match(/vimeo\.com\/(\d+)/);
    if (vm) return 'https://player.vimeo.com/video/' + vm[1];
    return u;
}

var MINISTRY_EXTRAS = {
    1: { accent: '#12D8F5', accentDark: '#0EA5E9', leader: 'Pastor Grace Mukiibi', activities: ['Bible stories and lessons','Worship songs','Crafts and games','Memory verse challenges'], schedule: 'Sunday 9:15 AM & 11:45 AM', location: "Children's Wing, 2nd Floor", audience: 'Ages 3-12' },
    2: { accent: '#8B5CF6', accentDark: '#7C3AED', leader: 'Sarah', activities: ['Relevant Bible teaching','Small group discussions','Worship nights','Outreach events'], schedule: 'Friday 6:30 PM', location: 'Youth Center', audience: 'Grades 6-12' },
    3: { accent: '#06B6D4', accentDark: '#0891B2', leader: 'Williams', activities: ['Hospital visitation','Prayer with patients','Scripture sharing','Family support'], schedule: 'Saturday 10:00 AM', location: 'Mulago Hospital', audience: 'All Adults' },
    4: { accent: '#F43F5E', accentDark: '#E11D48', leader: 'Pastor John Doe', activities: ['Bible study','Prayer breakfasts','Conferences','Fellowship events'], schedule: '1st Saturday 9:00 AM', location: 'Fellowship Hall', audience: 'All Women' },
    5: { accent: '#005BEA', accentDark: '#078BFF', leader: 'David Muwonge', activities: ['Worship rehearsals','Sunday worship leading','Worship nights','Choir practice'], schedule: 'Thursday 7:00 PM', location: 'Worship Center', audience: 'All Ages' },
    6: { accent: '#A78BFA', accentDark: '#8B5CF6', leader: 'Pastor Sarah Johnson', activities: ['Corporate prayer','Intercession','Prayer walks','Prayer chains'], schedule: 'Friday 6:30 AM & 7:00 PM', location: 'Prayer Room', audience: 'All Ages' },
    7: { accent: '#10B981', accentDark: '#059669', leader: 'TR BETI & RICHARD', activities: ['Hospital visits','Prayer sessions','Scripture distribution','Practical support'], schedule: 'Saturday 10:00 AM', location: 'Toddler class', audience: '2-5yrs' },
    8: { accent: '#0EA5E9', accentDark: '#0284C7', leader: 'Pastor Michael Davis', activities: ['Livestream services','Video recording','Photography','Sound engineering'], schedule: 'Every Sunday', location: 'Media Room', audience: 'All Ages' },
    9: { accent: '#F59E0B', accentDark: '#D97706', leader: 'Pastor John Doe', activities: ['Street evangelism','Community events','Witness training','Gospel outreach'], schedule: 'Sunday 2:00 PM', location: 'Various Locations', audience: 'All Ages' },
    10: { accent: '#6366F1', accentDark: '#4F46E5', leader: 'Pastor Sarah Johnson', activities: ['Verse-by-verse study','Small group discussion','Scripture memory','Topical studies'], schedule: 'Wednesday 7:00 PM', location: 'Fellowship Hall', audience: 'All Ages' },
    11: { accent: '#078BFF', accentDark: '#005BEA', leader: 'Pastor John Doe', activities: ['Missionary support','Mission trips','Fundraising','Prayer for missions'], schedule: '2nd Saturday 10:00 AM', location: 'Conference Room', audience: 'All Ages' },
    12: { accent: '#F472B6', accentDark: '#EC4899', leader: 'Outreach Team', activities: ['Food distribution','Elderly care','Community clean-ups',"Children's programs"], schedule: 'Saturday 9:00 AM', location: 'Various Locations', audience: 'All Ages' }
};

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
// RENDER HERO
// ============================================
function renderHero() {
    var h = siteContent.ministries_hero || {};
    setText('heroEyebrow', h.eyebrow);
    setText('heroLine1', h.title_line1);
    setText('heroLine2', h.title_line2);
    setText('heroSubtitle', h.subtitle);
    setText('heroDescription', h.description);
    var url = secImg('ministries_hero');
    if (url) { var bg = document.getElementById('heroBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
}

// ============================================
// RENDER HEADER
// ============================================
function renderHeader() {
    var h = siteContent.ministries_header || {};
    setText('catLabel', h.label);
    setText('catTitle', h.title);
    setText('headerVerseText', h.verse_text);
    setText('headerVerseRef', h.verse_reference);
}

// ============================================
// MINISTRIES GRID
// ============================================
function renderMinistries() {
    var grid = document.getElementById('ministriesGrid');
    if (!grid) return;
    var count = document.getElementById('catCount');
    if (count) count.textContent = allMinistries.length + ' Ministries';
    if (!allMinistries.length) { grid.innerHTML = '<p style="grid-column:1/-1;text-align:center;color:#49658A;padding:40px;">No ministries available.</p>'; return; }

    var html = allMinistries.map(function (m, idx) {
        var extras = MINISTRY_EXTRAS[m.display_order] || { accent: '#005BEA', accentDark: '#078BFF', leader: '', schedule: '', location: '' };
        return '<article class="ministry-card" data-idx="' + idx + '" tabindex="0" role="button" style="--accent:' + extras.accent + ';--accent-dark:' + extras.accentDark + ';--accent-glow:' + extras.accent + '55;">'
            + '<div class="ministry-image">'
            +   '<img src="' + escapeHtml(m.image_url || '') + '" alt="" onerror="this.style.display=\'none\'">'
            +   '<div class="ministry-icon"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            +   '<span class="ministry-arrow"><i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '<div class="ministry-body">'
            +   '<h3 class="ministry-title">' + escapeHtml(m.name || '') + '</h3>'
            +   (extras.leader ? '<div class="ministry-leader">' + escapeHtml(extras.leader) + '</div>' : '')
            +   '<p class="ministry-desc">' + escapeHtml(m.description || '') + '</p>'
            +   (extras.schedule ? '<div class="ministry-meta"><i class="fas fa-calendar"></i><span>' + escapeHtml(extras.schedule) + '</span></div>' : '')
            +   (extras.location ? '<div class="ministry-meta"><i class="fas fa-map-marker-alt"></i><span>' + escapeHtml(extras.location) + '</span></div>' : '')
            +   '<button class="btn-explore" type="button">Explore Ministry <i class="fas fa-arrow-right"></i></button>'
            + '</div></article>';
    }).join('');

    html += '<div class="ministry-card quote-card"><div><p class="quote-text">Go therefore and make disciples of all nations.</p><span class="quote-ref">— Matthew 28:19</span></div></div>';
    grid.innerHTML = html;

    grid.querySelectorAll('.ministry-card[data-idx]').forEach(function (card) {
        var open = function () { openMinistryModal(allMinistries[parseInt(card.dataset.idx, 10)]); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
    });
}

// ============================================
// MINISTRY DETAILS PANEL (with gallery)
// ============================================
function openMinistryModal(m) {
    if (!m) return;
    var extras = MINISTRY_EXTRAS[m.display_order] || { accent: '#005BEA', accentDark: '#078BFF', leader: '', activities: [], schedule: '', location: '', audience: '' };

    var gallery = parseGallery(m.gallery_images);
    var embedUrl = videoEmbedUrl(m.video_url);

    var activitiesHTML = '';
    if (extras.activities && extras.activities.length) {
        activitiesHTML = '<div class="modal-section-title">What We Do</div><div class="modal-activities">'
            + extras.activities.map(function (a) { return '<div class="modal-activity-item"><i class="fas fa-check-circle"></i><span>' + escapeHtml(a) + '</span></div>'; }).join('')
            + '</div>';
    }
    var detailsHTML = '';
    if (extras.schedule || extras.location || extras.audience || extras.leader) {
        detailsHTML = '<div class="modal-section-title">Ministry Details</div><div class="modal-details">'
            + (extras.schedule ? '<div class="modal-detail-row"><i class="fas fa-calendar"></i><span class="detail-label">Schedule</span><span class="detail-value">' + escapeHtml(extras.schedule) + '</span></div>' : '')
            + (extras.location ? '<div class="modal-detail-row"><i class="fas fa-map-marker-alt"></i><span class="detail-label">Location</span><span class="detail-value">' + escapeHtml(extras.location) + '</span></div>' : '')
            + (extras.audience ? '<div class="modal-detail-row"><i class="fas fa-users"></i><span class="detail-label">For</span><span class="detail-value">' + escapeHtml(extras.audience) + '</span></div>' : '')
            + (extras.leader ? '<div class="modal-detail-row"><i class="fas fa-user"></i><span class="detail-label">Leader</span><span class="detail-value">' + escapeHtml(extras.leader) + '</span></div>' : '')
            + '</div>';
    }

    var galleryHTML = '';
    if (gallery.length) {
        galleryHTML = '<div class="modal-section-title">Gallery</div><div class="modal-gallery">'
            + gallery.map(function (url, i) {
                return '<a class="gallery-thumb" href="' + escapeHtml(url) + '" target="_blank" rel="noopener" data-full="' + i + '">'
                    + '<img src="' + escapeHtml(url) + '" alt="" onerror="this.parentNode.style.display=\'none\'">'
                    + '<span class="gallery-download" data-download="' + escapeHtml(url) + '" title="Download image"><i class="fas fa-download"></i></span>'
                    + '</a>';
            }).join('')
            + '</div>';
    }

    var videoHTML = '';
    if (embedUrl) {
        videoHTML = '<div class="modal-section-title">Video' + (m.video_title ? ': ' + escapeHtml(m.video_title) : '') + '</div>'
            + '<div class="modal-video">'
            + (embedUrl.match(/\.(mp4|webm|ogg)$/i)
                ? '<video controls preload="metadata" src="' + escapeHtml(embedUrl) + '"></video>'
                : '<div class="video-thumb" data-embed="' + escapeHtml(embedUrl) + '"><img src="https://img.youtube.com/vi/' + (embedUrl.split('/embed/')[1] || '') + '/hqdefault.jpg" alt="" onerror="this.parentNode.classList.add(\'no-thumb\')"><span class="video-play"><i class="fas fa-play"></i> Play Video</span></div>')
            + '</div>';
    }

    var html = ''
        + '<img class="modal-hero-image" src="' + escapeHtml(m.image_url || '') + '" alt="" onerror="this.style.display=\'none\'">'
        + '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(120deg,' + extras.accent + ',' + extras.accentDark + ');"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
        + '<h2>' + escapeHtml(m.name || '') + '</h2>'
        + (extras.leader ? '<p class="modal-subtitle">Led by ' + escapeHtml(extras.leader) + '</p>' : '')
        + '<p class="modal-description">' + escapeHtml(m.description || '') + '</p>'
        + galleryHTML
        + videoHTML
        + activitiesHTML
        + detailsHTML
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-primary" onclick="openJoinForm(\'' + escapeHtml(m.name).replace(/'/g, "\\'") + '\')" type="button"><i class="fas fa-user-plus"></i> Join This Ministry</button>'
        +   '<button class="modal-btn modal-btn-secondary" onclick="openSupportForm(' + allMinistries.indexOf(m) + ')" type="button"><i class="fas fa-heart"></i> Support</button>'
        + '</div></div>';
    openModal(html);
    wireGalleryAndVideo();
}

function wireGalleryAndVideo() {
    document.querySelectorAll('.gallery-thumb').forEach(function (a) {
        a.addEventListener('click', function (e) {
            var dl = e.target.closest('.gallery-download');
            if (dl) {
                e.preventDefault();
                e.stopPropagation();
                var url = dl.getAttribute('data-download');
                downloadImage(url);
                return;
            }
        });
    });
    document.querySelectorAll('.video-thumb').forEach(function (t) {
        t.addEventListener('click', function () {
            var embed = t.getAttribute('data-embed');
            if (!embed) return;
            t.outerHTML = '<div class="video-frame"><iframe src="' + embed + '?autoplay=1" frameborder="0" allow="autoplay; encrypted-media; fullscreen; picture-in-picture" allowfullscreen></iframe></div>';
        });
    });
}

async function downloadImage(url) {
    if (!url) return;
    try {
        var res = await fetch(url, { mode: 'cors' });
        var blob = await res.blob();
        var tmp = URL.createObjectURL(blob);
        var a = document.createElement('a');
        a.href = tmp;
        a.download = url.split('/').pop().split('?')[0] || 'image.jpg';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(tmp);
    } catch (err) {
        window.open(url, '_blank');
    }
}

// ============================================
// JOIN MINISTRY FORM (unchanged)
// ============================================
window.openJoinForm = function (ministryName) {
    var html = '<div class="modal-content"><h2>Join ' + escapeHtml(ministryName) + '</h2><p class="modal-subtitle">Fill in your details.</p>'
        + '<form id="joinMinForm" class="modal-form">'
        + '<input type="hidden" name="ministry" value="' + escapeHtml(ministryName) + '">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone"></label>'
        + '<label>Message<textarea name="message" rows="3"></textarea></label>'
        + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit Request</button>'
        + '<p class="form-status"></p></form></div>';
    openModal(html);
    document.getElementById('joinMinForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var st = e.target.querySelector('.form-status');
        var btn = e.target.querySelector('button[type="submit"]');
        st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
        var p = {}; new FormData(e.target).forEach(function (v, k) { p[k] = v; });
        try {
            await window.db.submitVolunteerRequest({ ministry: p.ministry, name: p.name, email: p.email, phone: p.phone || null, message: p.message || '' });
            st.textContent = '✅ Thank you!'; st.className = 'form-status success'; e.target.reset();
        } catch (err) { st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false; }
    });
};

// ============================================
// SUPPORT FORM — Step 1 fill, Step 2 summary
// SEND: WhatsApp  OR  Gmail Web Compose
// ============================================
window.openSupportForm = function (ministryIdx) {
    var m = allMinistries[ministryIdx];
    if (!m) return;
    var name = m.name || '';

    var html = '<div class="modal-content">'
        + '<h2>Support ' + escapeHtml(name) + '</h2>'
        + '<p class="modal-subtitle">Step 1 of 2 — Fill in your information</p>'
        + '<form id="supportForm" class="modal-form">'
        + '<input type="hidden" name="ministry" value="' + escapeHtml(name) + '">'
        + '<input type="hidden" name="ministryIdx" value="' + ministryIdx + '">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone / WhatsApp<input type="tel" name="phone"></label>'
        + '<label>Support Type'
        +   '<select name="supportType" required>'
        +     '<option value="">— Select —</option>'
        +     '<option>Financial gift</option>'
        +     '<option>Material donation</option>'
        +     '<option>Volunteer time</option>'
        +     '<option>Prayer support</option>'
        +   '</select></label>'
        + '<label>Amount or Item <input type="text" name="amountOrItem" placeholder="e.g. UGX 50,000 or 3 blankets"></label>'
        + '<label>Message<textarea name="message" rows="3" placeholder="Any extra details..."></textarea></label>'
        + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-arrow-right"></i> Review &amp; Send</button>'
        + '<p class="form-status"></p></form></div>';
    openModal(html);

    document.getElementById('supportForm').addEventListener('submit', function (e) {
        e.preventDefault();
        var p = {}; new FormData(e.target).forEach(function (v, k) { p[k] = v; });
        openSupportSummary(p, m);
    });
};

function openSupportSummary(p, m) {
    var church = window.CHURCH_CONTACT || {};
    var churchEmail = church.email || 'thebridgecalvarychapel1@gmail.com';
    var churchPhone = (church.whatsapp || '256785228381').replace(/[^\d]/g, '');

    var lines = [
        'Support Request',
        '',
        'Ministry: ' + p.ministry,
        'Name: ' + p.name,
        'Email: ' + p.email,
        'Phone: ' + (p.phone || '—'),
        'Support Type: ' + p.supportType,
        'Amount/Item: ' + (p.amountOrItem || '—'),
        'Message: ' + (p.message || '—')
    ];
    var summaryText = lines.join('\n');
    var subject = 'Support Request — ' + p.ministry;

    // WhatsApp URL
    var waUrl = 'https://wa.me/' + churchPhone + '?text=' + encodeURIComponent(summaryText);
    // Gmail Web Compose URL (opens in a new tab, prefilled)
    var gmailUrl = 'https://mail.google.com/mail/?view=cm&fs=1'
        + '&to=' + encodeURIComponent(churchEmail)
        + '&su=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(summaryText);
    // Fallback mailto (used only if Gmail button doesn't work for visitor)
    var mailtoUrl = 'mailto:' + encodeURIComponent(churchEmail)
        + '?subject=' + encodeURIComponent(subject)
        + '&body=' + encodeURIComponent(summaryText);

    var html = '<div class="modal-content">'
        + '<h2>Review &amp; Send</h2>'
        + '<p class="modal-subtitle">Step 2 of 2 — Confirm your information</p>'
        + '<div class="summary-box">'
        +   '<div class="summary-row"><span>Ministry</span><strong>' + escapeHtml(p.ministry) + '</strong></div>'
        +   '<div class="summary-row"><span>Name</span><strong>' + escapeHtml(p.name) + '</strong></div>'
        +   '<div class="summary-row"><span>Email</span><strong>' + escapeHtml(p.email) + '</strong></div>'
        +   '<div class="summary-row"><span>Phone</span><strong>' + escapeHtml(p.phone || '—') + '</strong></div>'
        +   '<div class="summary-row"><span>Support Type</span><strong>' + escapeHtml(p.supportType) + '</strong></div>'
        +   '<div class="summary-row"><span>Amount/Item</span><strong>' + escapeHtml(p.amountOrItem || '—') + '</strong></div>'
        +   '<div class="summary-row summary-message"><span>Message</span><strong>' + escapeHtml(p.message || '—') + '</strong></div>'
        + '</div>'
        + '<div class="modal-actions">'
        +   '<a class="modal-btn modal-btn-whatsapp" href="' + waUrl + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Send via WhatsApp</a>'
        +   '<a class="modal-btn modal-btn-email" href="' + gmailUrl + '" target="_blank" rel="noopener"><i class="fas fa-envelope"></i> Send via Gmail</a>'
        + '</div>'
        + '<p class="modal-note">Gmail opens in a new tab with your message ready — just click Send. If you use a different email app, <a href="' + mailtoUrl + '" class="modal-link">click here</a>.</p>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-secondary" onclick="openSupportForm(' + allMinistries.indexOf(m) + ')" type="button"><i class="fas fa-arrow-left"></i> Back to Edit</button>'
        +   '<button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Cancel</button>'
        + '</div>'
        + '</div>';
    openModal(html);
}

// ============================================
// VERSE BANNER
// ============================================
function renderVerseBanner() {
    var banner = document.getElementById('verseBanner');
    if (!banner) return;
    var q = siteContent.ministries_quotes || {};
    var html = '';
    for (var i = 1; i <= 4; i++) {
        var t = q['quote_' + i + '_text'];
        var r = q['quote_' + i + '_ref'];
        if (!t) continue;
        html += '<div class="verse-banner-item"><span class="verse-banner-quote-mark">"</span><p class="verse-banner-text">' + escapeHtml(t) + '</p><span class="verse-banner-ref">' + escapeHtml(r || '') + '</span></div>';
    }
    banner.innerHTML = html;
}

// ============================================
// INVOLVED
// ============================================
function renderInvolved() {
    var i = siteContent.ministries_involved || {};
    setText('involvedLabel', i.label);
    setText('involvedTitle', i.title);
    setText('involvedDesc', i.description);
    var url = secImg('ministries_involved');
    if (url) { var bg = document.getElementById('involvedBg'); if (bg) bg.style.backgroundImage = 'url("' + url + '")'; }
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
async function loadMinistriesData() {
    console.log('📥 Loading ministries data...');
    try {
        var results = await Promise.all([window.db.getSiteContent(), window.db.getMinistries()]);
        siteContent = results[0] || {};
        allMinistries = results[1] || [];
        renderHero(); renderHeader(); renderMinistries(); renderVerseBanner(); renderInvolved(); renderFooter();
        console.log('✅ Ministries loaded: ' + allMinistries.length + ' items');
    } catch (err) { console.error('❌ Ministries load error:', err); }
}

if (window.db) setTimeout(loadMinistriesData, 100);
else window.addEventListener('supabase-ready', loadMinistriesData);
setTimeout(function () { if (window.db && Object.keys(siteContent).length === 0) loadMinistriesData(); }, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ ministries.js initialized');
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

    var cardJoin = document.getElementById('cardJoinMinistry');
    if (cardJoin) cardJoin.addEventListener('click', function () { document.getElementById('ministriesGrid').scrollIntoView({ behavior: 'smooth' }); });

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