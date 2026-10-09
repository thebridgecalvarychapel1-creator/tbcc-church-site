// ============================================
// MINISTRIES PAGE — BRIDGE CALVARY CHAPEL
// File: js/ministries.js
// ============================================

var heroContent = {};
var headerContent = {};
var quotesContent = {};
var involvedContent = {};
var footerContent = {};
var allMinistries = [];

// Per-ministry accent colors and detail info
// This map enriches what Supabase already returns
var MINISTRY_EXTRAS = {
    1: { accent: '#12D8F5', accentDark: '#0EA5E9', leader: 'Pastor Grace Mukiibi',
         activities: ['Bible stories and lessons', 'Worship songs', 'Crafts and games', 'Memory verse challenges'],
         schedule: 'Sunday 9:15 AM & 11:45 AM', location: 'Children\'s Wing, 2nd Floor', audience: 'Ages 3-12' },
    2: { accent: '#8B5CF6', accentDark: '#7C3AED', leader: 'Sarah',
         activities: ['Relevant Bible teaching', 'Small group discussions', 'Worship nights', 'Outreach events'],
         schedule: 'Friday 6:30 PM', location: 'Youth Center', audience: 'Grades 6-12' },
    3: { accent: '#06B6D4', accentDark: '#0891B2', leader: 'Williams',
         activities: ['Hospital visitation', 'Prayer with patients', 'Scripture sharing', 'Family support'],
         schedule: 'Saturday 10:00 AM', location: 'Mulago Hospital', audience: 'All Adults' },
    4: { accent: '#F43F5E', accentDark: '#E11D48', leader: 'Pastor John Doe',
         activities: ['Bible study', 'Prayer breakfasts', 'Conferences', 'Fellowship events'],
         schedule: '1st Saturday 9:00 AM', location: 'Fellowship Hall', audience: 'All Women' },
    5: { accent: '#005BEA', accentDark: '#078BFF', leader: 'David Muwonge',
         activities: ['Worship rehearsals', 'Sunday worship leading', 'Worship nights', 'Choir practice'],
         schedule: 'Thursday 7:00 PM', location: 'Worship Center', audience: 'All Ages' },
    6: { accent: '#A78BFA', accentDark: '#8B5CF6', leader: 'Pastor Sarah Johnson',
         activities: ['Corporate prayer', 'Intercession', 'Prayer walks', 'Prayer chains'],
         schedule: 'Friday 6:30 AM & 7:00 PM', location: 'Prayer Room', audience: 'All Ages' },
    7: { accent: '#10B981', accentDark: '#059669', leader: 'Deacon Peter Okello',
         activities: ['Hospital visits', 'Prayer sessions', 'Scripture distribution', 'Practical support'],
         schedule: 'Saturday 10:00 AM', location: 'Various Hospitals', audience: 'All Adults' },
    8: { accent: '#0EA5E9', accentDark: '#0284C7', leader: 'Pastor Michael Davis',
         activities: ['Livestream services', 'Video recording', 'Photography', 'Sound engineering'],
         schedule: 'Every Sunday', location: 'Media Room', audience: 'All Ages' },
    9: { accent: '#F59E0B', accentDark: '#D97706', leader: 'Pastor John Doe',
         activities: ['Street evangelism', 'Community events', 'Witness training', 'Gospel outreach'],
         schedule: 'Sunday 2:00 PM', location: 'Various Locations', audience: 'All Ages' },
    10: { accent: '#6366F1', accentDark: '#4F46E5', leader: 'Pastor Sarah Johnson',
         activities: ['Verse-by-verse study', 'Small group discussion', 'Scripture memory', 'Topical studies'],
         schedule: 'Wednesday 7:00 PM', location: 'Fellowship Hall', audience: 'All Ages' },
    11: { accent: '#078BFF', accentDark: '#005BEA', leader: 'Pastor John Doe',
         activities: ['Missionary support', 'Mission trips', 'Fundraising', 'Prayer for missions'],
         schedule: '2nd Saturday 10:00 AM', location: 'Conference Room', audience: 'All Ages' },
    12: { accent: '#F472B6', accentDark: '#EC4899', leader: 'Outreach Team',
         activities: ['Food distribution', 'Elderly care', 'Community clean-ups', 'Children\'s programs'],
         schedule: 'Saturday 9:00 AM', location: 'Various Locations', audience: 'All Ages' }
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
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val) el.innerHTML = val; }

// ============================================
// RENDER HERO
// ============================================
function renderHero() {
    setText('heroEyebrow', heroContent.eyebrow);
    setText('heroLine1', heroContent.title_line1);
    setText('heroLine2', heroContent.title_line2);
    setText('heroSubtitle', heroContent.subtitle);
    setText('heroDescription', heroContent.description);
    if (heroContent.hero_image) {
        var bg = document.getElementById('heroBg');
        if (bg) bg.style.backgroundImage = 'url("' + heroContent.hero_image + '")';
    }
}

// ============================================
// RENDER HEADER
// ============================================
function renderHeader() {
    setText('catLabel', headerContent.label);
    setText('catTitle', headerContent.title);
    setText('headerVerseText', headerContent.verse_text);
    setText('headerVerseRef', headerContent.verse_reference);
}

// ============================================
// RENDER MINISTRIES GRID
// ============================================
function renderMinistries() {
    var grid = document.getElementById('ministriesGrid');
    if (!grid) return;

    var count = document.getElementById('catCount');
    if (count) count.textContent = allMinistries.length + ' Ministries';

    if (!allMinistries.length) {
        grid.innerHTML = '<p style="grid-column: 1/-1;text-align:center;color:#49658A;padding:40px;">No ministries available.</p>';
        return;
    }

    var html = allMinistries.map(function (m, idx) {
        var extras = MINISTRY_EXTRAS[m.display_order] || { accent: '#005BEA', accentDark: '#078BFF', leader: '', activities: [], schedule: '', location: '', audience: '' };
        return '<article class="ministry-card" data-idx="' + idx + '" tabindex="0" role="button" style="--accent: ' + extras.accent + '; --accent-dark: ' + extras.accentDark + '; --accent-glow: ' + extras.accent + '55;">'
            + '<div class="ministry-image">'
            +   '<img src="' + (m.image_url || '') + '" alt="' + (m.name || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="ministry-icon"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            +   '<span class="ministry-arrow"><i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '<div class="ministry-body">'
            +   '<h3 class="ministry-title">' + (m.name || '') + '</h3>'
            +   (extras.leader ? '<div class="ministry-leader">' + extras.leader + '</div>' : '')
            +   '<p class="ministry-desc">' + (m.description || '') + '</p>'
            +   (extras.schedule ? '<div class="ministry-meta"><i class="fas fa-calendar"></i><span>' + extras.schedule + '</span></div>' : '')
            +   (extras.location ? '<div class="ministry-meta"><i class="fas fa-map-marker-alt"></i><span>' + extras.location + '</span></div>' : '')
            +   '<button class="btn-explore" type="button">Explore Ministry <i class="fas fa-arrow-right"></i></button>'
            + '</div>'
            + '</article>';
    }).join('');

    // Add the scripture quote card as the last card
    html += '<div class="ministry-card quote-card">'
        + '<div>'
        +   '<p class="quote-text">Go therefore and make disciples of all nations.</p>'
        +   '<span class="quote-ref">— Matthew 28:19</span>'
        + '</div>'
        + '</div>';

    grid.innerHTML = html;

    // Attach click handlers
    grid.querySelectorAll('.ministry-card[data-idx]').forEach(function (card) {
        var open = function () {
            var idx = parseInt(card.dataset.idx, 10);
            openMinistryModal(allMinistries[idx]);
        };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

// ============================================
// OPEN MINISTRY MODAL
// ============================================
function openMinistryModal(m) {
    if (!m) return;
    var extras = MINISTRY_EXTRAS[m.display_order] || { accent: '#005BEA', accentDark: '#078BFF', leader: '', activities: [], schedule: '', location: '', audience: '' };

    var activitiesHTML = '';
    if (extras.activities && extras.activities.length) {
        activitiesHTML = '<div class="modal-section-title">What We Do</div>'
            + '<div class="modal-activities">'
            + extras.activities.map(function (a) {
                return '<div class="modal-activity-item"><i class="fas fa-check-circle"></i><span>' + a + '</span></div>';
            }).join('')
            + '</div>';
    }

    var detailsHTML = '';
    if (extras.schedule || extras.location || extras.audience || extras.leader) {
        detailsHTML = '<div class="modal-section-title">Ministry Details</div>'
            + '<div class="modal-details">'
            + (extras.schedule ? '<div class="modal-detail-row"><i class="fas fa-calendar"></i><span class="detail-label">Schedule</span><span class="detail-value">' + extras.schedule + '</span></div>' : '')
            + (extras.location ? '<div class="modal-detail-row"><i class="fas fa-map-marker-alt"></i><span class="detail-label">Location</span><span class="detail-value">' + extras.location + '</span></div>' : '')
            + (extras.audience ? '<div class="modal-detail-row"><i class="fas fa-users"></i><span class="detail-label">For</span><span class="detail-value">' + extras.audience + '</span></div>' : '')
            + (extras.leader ? '<div class="modal-detail-row"><i class="fas fa-user"></i><span class="detail-label">Leader</span><span class="detail-value">' + extras.leader + '</span></div>' : '')
            + '</div>';
    }

    var html = ''
        + '<img class="modal-hero-image" src="' + (m.image_url || '') + '" alt="' + (m.name || '') + '" onerror="this.style.display=\'none\'">'
        + '<div class="modal-content">'
        +   '<div class="modal-icon-wrapper" style="background: linear-gradient(120deg, ' + extras.accent + ', ' + extras.accentDark + ');">'
        +     '<i class="fas ' + (m.icon || 'fa-church') + '"></i>'
        +   '</div>'
        +   '<h2>' + (m.name || '') + '</h2>'
        +   (extras.leader ? '<p class="modal-subtitle">Led by ' + extras.leader + '</p>' : '')
        +   '<p class="modal-description">' + (m.description || '') + '</p>'
        +   activitiesHTML
        +   detailsHTML
        +   '<div class="modal-actions">'
        +     '<button class="modal-btn modal-btn-primary" onclick="openJoinForm(\'' + (m.name || '').replace(/\'/g, "\\'") + '\')" type="button">'
        +       '<i class="fas fa-user-plus"></i> Join This Ministry'
        +     '</button>'
        +     '<button class="modal-btn modal-btn-secondary" onclick="openSupportInfo(\'' + (m.name || '').replace(/\'/g, "\\'") + '\')" type="button">'
        +       '<i class="fas fa-heart"></i> Support'
        +     '</button>'
        +   '</div>'
        + '</div>';

    openModal(html);
}

// ============================================
// JOIN FORM
// ============================================
window.openJoinForm = function (ministryName) {
    var html = ''
        + '<div class="modal-content">'
        +   '<h2>Join ' + ministryName + '</h2>'
        +   '<p class="modal-subtitle">Fill in your details below and we\'ll be in touch.</p>'
        +   '<form id="joinMinistryForm" class="modal-form">'
        +     '<input type="hidden" name="ministry" value="' + ministryName + '">'
        +     '<label>Your Name *<input type="text" name="name" required></label>'
        +     '<label>Email *<input type="email" name="email" required></label>'
        +     '<label>Phone<input type="tel" name="phone" placeholder="+256..."></label>'
        +     '<label>Preferred Way to Participate<select name="preferred">'
        +       '<option value="Serve on team">Serve on team</option>'
        +       '<option value="Attend meetings">Attend meetings</option>'
        +       '<option value="Prayer support">Prayer support</option>'
        +       '<option value="Financial support">Financial support</option>'
        +     '</select></label>'
        +     '<label>Message<textarea name="message" rows="3"></textarea></label>'
        +     '<button type="submit" class="modal-btn modal-btn-primary">'
        +       '<i class="fas fa-paper-plane"></i> Submit Request'
        +     '</button>'
        +     '<p class="form-status"></p>'
        +   '</form>'
        + '</div>';

    openModal(html);

    document.getElementById('joinMinistryForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var status = e.target.querySelector('.form-status');
        var btn = e.target.querySelector('button[type="submit"]');
        status.textContent = 'Submitting...';
        status.className = 'form-status loading';
        btn.disabled = true;

        var payload = {};
        new FormData(e.target).forEach(function (v, k) { payload[k] = v; });

        try {
            // Save to Supabase
            await window.db.submitVolunteerRequest({
                ministry: payload.ministry,
                name: payload.name,
                email: payload.email,
                phone: payload.phone || null,
                message: (payload.preferred ? 'Preferred: ' + payload.preferred + '. ' : '') + (payload.message || '')
            });
            status.textContent = '✅ Thank you! Your request was received. Please send it to our church office below.';
            status.className = 'form-status success';
            e.target.reset();
            setTimeout(function () { showSendSummary(payload); }, 800);
        } catch (err) {
            console.error(err);
            status.textContent = '❌ ' + (err.message || 'Something went wrong.');
            status.className = 'form-status error';
            btn.disabled = false;
        }
    });
};

// ============================================
// SEND SUMMARY (WhatsApp + Email)
// ============================================
window.showSendSummary = function (payload) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var lines = [];
    lines.push('🙏 Join Ministry Request — Bridge Calvary Chapel');
    lines.push('');
    lines.push('🤝 Ministry: ' + (payload.ministry || '—'));
    lines.push('👤 Name: ' + (payload.name || '—'));
    lines.push('📧 Email: ' + (payload.email || '—'));
    if (payload.phone)     lines.push('📱 Phone: ' + payload.phone);
    if (payload.preferred) lines.push('💡 Preferred: ' + payload.preferred);
    if (payload.message)   lines.push('📝 Message: ' + payload.message);
    lines.push('');
    lines.push('Sent from Bridge Calvary Chapel website');

    var text = encodeURIComponent(lines.join('\n'));
    var subject = encodeURIComponent('Join Ministry — ' + (payload.name || 'Website'));

    var html = ''
        + '<div class="modal-content">'
        +   '<h2>Send to Our Church Office</h2>'
        +   '<p class="modal-subtitle">Your request is saved. Now send it so we can respond quickly.</p>'
        +   '<a class="modal-btn modal-btn-primary" style="background: linear-gradient(120deg, #25D366, #128C7E); text-decoration: none; margin-bottom: 10px;" href="https://wa.me/' + c.whatsapp + '?text=' + text + '" target="_blank" rel="noopener">'
        +     '<i class="fab fa-whatsapp"></i> Send via WhatsApp'
        +   '</a>'
        +   '<a class="modal-btn modal-btn-secondary" style="text-decoration: none;" href="mailto:' + c.email + '?subject=' + subject + '&body=' + text + '">'
        +     '<i class="fas fa-envelope"></i> Send via Email'
        +   '</a>'
        + '</div>';
    openModal(html);
};

// ============================================
// SUPPORT INFO
// ============================================
window.openSupportInfo = function (ministryName) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '' };
    var html = ''
        + '<div class="modal-content">'
        +   '<h2>Support ' + ministryName + '</h2>'
        +   '<p class="modal-subtitle">Thank you for wanting to support this ministry.</p>'
        +   '<p class="modal-description">To give toward <strong>' + ministryName + '</strong>, please contact our church office. You can send your gift by phone, mobile money, or email us for details.</p>'
        +   '<div class="modal-details">'
        +     '<div class="modal-detail-row"><i class="fas fa-phone"></i><span class="detail-label">WhatsApp</span><span class="detail-value">+' + c.whatsapp + '</span></div>'
        +     '<div class="modal-detail-row"><i class="fas fa-envelope"></i><span class="detail-label">Email</span><span class="detail-value">' + c.email + '</span></div>'
        +   '</div>'
        +   '<div class="modal-actions">'
        +     '<a class="modal-btn modal-btn-primary" href="https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent('I would like to support the ' + ministryName) + '" target="_blank" rel="noopener">'
        +       '<i class="fab fa-whatsapp"></i> Contact on WhatsApp'
        +     '</a>'
        +   '</div>'
        + '</div>';
    openModal(html);
};

// ============================================
// RENDER VERSE BANNER
// ============================================
function renderVerseBanner() {
    var banner = document.getElementById('verseBanner');
    if (!banner) return;
    var html = '';
    for (var i = 1; i <= 4; i++) {
        var t = quotesContent['quote_' + i + '_text'];
        var r = quotesContent['quote_' + i + '_ref'];
        if (!t) continue;
        html += '<div class="verse-banner-item">'
            + '<span class="verse-banner-quote-mark">"</span>'
            + '<p class="verse-banner-text">' + t + '</p>'
            + '<span class="verse-banner-ref">' + (r || '') + '</span>'
            + '</div>';
    }
    banner.innerHTML = html;
}

// ============================================
// RENDER INVOLVED
// ============================================
function renderInvolved() {
    setText('involvedLabel', involvedContent.label);
    setText('involvedTitle', involvedContent.title);
    setText('involvedDesc', involvedContent.description);
    if (involvedContent.background_image) {
        var bg = document.getElementById('involvedBg');
        if (bg) bg.style.backgroundImage = 'url("' + involvedContent.background_image + '")';
    }
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
// LOAD DATA
// ============================================
async function loadMinistriesData() {
    console.log('📥 Loading ministries data...');
    try {
        var results = await Promise.all([
            window.db.getSiteContent(),
            window.db.getMinistries()
        ]);
        var content = results[0] || {};
        allMinistries = (results[1] || []).slice();

        heroContent = content.ministries_hero || {};
        headerContent = content.ministries_header || {};
        quotesContent = content.ministries_quotes || {};
        involvedContent = content.ministries_involved || {};
        footerContent = content.footer || {};

        renderHero();
        renderHeader();
        renderMinistries();
        renderVerseBanner();
        renderInvolved();
        renderFooter();

        console.log('✅ Ministries loaded: ' + allMinistries.length + ' items');
    } catch (err) {
        console.error('❌ Ministries load error:', err);
    }
}

window.addEventListener('supabase-ready', loadMinistriesData);
setTimeout(function () {
    if (window.db && Object.keys(heroContent).length === 0) loadMinistriesData();
}, 2000);

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ ministries.js initialized');

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

    // Get Involved cards
    var cardJoin = document.getElementById('cardJoinMinistry');
    if (cardJoin) {
        var openJoin = function () { document.getElementById('ministriesGrid').scrollIntoView({ behavior: 'smooth' }); };
        cardJoin.addEventListener('click', openJoin);
        cardJoin.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openJoin(); }
        });
    }
    var cardVol = document.getElementById('cardVolunteer');
    if (cardVol) {
        var openVol = function () {
            var html = '<div class="modal-content"><h2>Volunteer With Us</h2><p class="modal-subtitle">Tell us how you\'d like to serve.</p>'
                + '<form id="volForm" class="modal-form">'
                + '<label>Your Name *<input type="text" name="name" required></label>'
                + '<label>Email *<input type="email" name="email" required></label>'
                + '<label>Phone<input type="tel" name="phone"></label>'
                + '<label>Message<textarea name="message" rows="3"></textarea></label>'
                + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-paper-plane"></i> Submit</button>'
                + '<p class="form-status"></p>'
                + '</form></div>';
            openModal(html);
            document.getElementById('volForm').addEventListener('submit', async function (ev) {
                ev.preventDefault();
                var st = ev.target.querySelector('.form-status');
                var btn = ev.target.querySelector('button[type="submit"]');
                st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
                var p = {}; new FormData(ev.target).forEach(function (v, k) { p[k] = v; });
                try {
                    await window.db.submitVolunteerRequest({ ministry: 'General Volunteering', name: p.name, email: p.email, phone: p.phone || null, message: p.message || '' });
                    st.textContent = '✅ Thank you!'; st.className = 'form-status success';
                    ev.target.reset();
                    setTimeout(function () { showSendSummary({ ministry: 'General Volunteering', name: p.name, email: p.email, phone: p.phone, message: p.message, preferred: 'Volunteer' }); }, 800);
                } catch (err) {
                    st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false;
                }
            });
        };
        cardVol.addEventListener('click', openVol);
        cardVol.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openVol(); }
        });
    }
    var cardPrayer = document.getElementById('cardPrayer');
    if (cardPrayer) {
        var openPrayer = function () {
            var html = '<div class="modal-content"><h2>Request Prayer</h2><p class="modal-subtitle">We would be honored to pray for you.</p>'
                + '<form id="prayerForm" class="modal-form">'
                + '<label>Your Name *<input type="text" name="name" required></label>'
                + '<label>Email *<input type="email" name="email" required></label>'
                + '<label>Prayer Request *<textarea name="message" rows="4" required></textarea></label>'
                + '<button type="submit" class="modal-btn modal-btn-primary"><i class="fas fa-pray"></i> Submit Prayer</button>'
                + '<p class="form-status"></p>'
                + '</form></div>';
            openModal(html);
            document.getElementById('prayerForm').addEventListener('submit', async function (ev) {
                ev.preventDefault();
                var st = ev.target.querySelector('.form-status');
                var btn = ev.target.querySelector('button[type="submit"]');
                st.textContent = 'Submitting...'; st.className = 'form-status loading'; btn.disabled = true;
                var p = {}; new FormData(ev.target).forEach(function (v, k) { p[k] = v; });
                try {
                    await window.db.submitVolunteerRequest({ ministry: 'Prayer Request', name: p.name, email: p.email, message: p.message });
                    st.textContent = '✅ Thank you! We will pray for you.'; st.className = 'form-status success';
                    ev.target.reset();
                } catch (err) {
                    st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false;
                }
            });
        };
        cardPrayer.addEventListener('click', openPrayer);
        cardPrayer.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openPrayer(); }
        });
    }

    // Newsletter
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