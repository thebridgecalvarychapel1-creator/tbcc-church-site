// ============================================
// BRIDGE CALVARY CHAPEL - MAIN UI
// File: js/main.js
// ============================================

var siteContent = {};
var smallGroupsCache = [];

// ============================================
// MODAL PANEL
// ============================================
window.openModal = function (html, theme) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    if (!panel || !body) { console.error('❌ modal elements not in HTML'); return; }

    // Remove any previous theme
    panel.classList.remove(
        'theme-blue', 'theme-maroon', 'theme-gold', 'theme-cyan',
        'theme-green', 'theme-purple', 'theme-rose', 'theme-success'
    );
    if (theme) panel.classList.add('theme-' + theme);

    body.innerHTML = html;
    overlay.classList.add('active');
    panel.classList.add('active');
    panel.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    var closeBtn = panel.querySelector('.modal-panel-close');
    if (closeBtn) closeBtn.focus();
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
// VALUE CARD PANELS (each with its own colors)
// ============================================
var VALUE_PANELS = {
    value_biblical: {
        theme: 'blue',
        icon: 'fa-bible',
        title: 'Biblical Teaching',
        subtitle: 'Verse-by-verse through every book of the Bible.',
        description: 'We teach through Scripture verse by verse, chapter by chapter, book by book. Every Sunday we open the Bible together and let the text speak — from Genesis to Revelation — so you grow in the whole counsel of God.',
        scripture: '"All Scripture is God-breathed and is useful for teaching, rebuking, correcting and training in righteousness, so that the servant of God may be thoroughly equipped for every good work." — 2 Timothy 3:16-17',
        highlights: [
            'We go through every book of the Bible, not just favorite passages',
            'We study the context, language, and meaning of each verse',
            'We apply Scripture to everyday life and faith',
            'We encourage personal Bible reading and study'
        ],
        ctaLabel: 'Explore Sermons',
        ctaLink: 'sermons.html'
    },
    value_community: {
        theme: 'maroon',
        icon: 'fa-users',
        title: 'Loving Community',
        subtitle: 'A family growing and doing life together.',
        description: 'We are not just a church — we are a family. We do life together through small groups, shared meals, prayer, and service. When one rejoices, we all rejoice. When one hurts, we all hurt. You belong here.',
        scripture: '"And let us consider how we may spur one another on toward love and good deeds, not giving up meeting together, as some are in the habit of doing, but encouraging one another." — Hebrews 10:24-25',
        highlights: [
            'Small groups that meet weekly across the city',
            'Shared meals and fellowship events',
            'Prayer and accountability together',
            'A place where you are known and loved'
        ],
        ctaLabel: 'Find a Small Group',
        ctaAction: 'smallgroup'
    },
    value_serve: {
        theme: 'gold',
        icon: 'fa-hands-helping',
        title: 'Serve Others',
        subtitle: 'Using our gifts to make a difference.',
        description: 'Every believer has been given gifts by the Holy Spirit, and every gift is meant to be used. Whether you teach children, sing on the worship team, greet visitors, or serve behind the scenes, there is a place for you to serve.',
        scripture: '"Each of you should use whatever gift you have received to serve others, as faithful stewards of God\'s grace in its various forms." — 1 Peter 4:10',
        highlights: [
            'Serve in children\'s or youth ministry',
            'Join the worship or media team',
            'Welcome and hospitality team',
            'Community outreach and mercy ministry'
        ],
        ctaLabel: 'Start Volunteering',
        ctaAction: 'volunteer'
    },
    value_world: {
        theme: 'cyan',
        icon: 'fa-globe-africa',
        title: 'Reach the World',
        subtitle: 'Sharing the gospel locally and globally.',
        description: 'We believe the Gospel is for every nation, tribe, and tongue. We support missionaries, send teams, and partner with churches around the world to fulfill the Great Commission — from our neighborhood to the nations.',
        scripture: '"Therefore go and make disciples of all nations, baptizing them in the name of the Father and of the Son and of the Holy Spirit." — Matthew 28:19',
        highlights: [
            'Support local and global missionaries',
            'Send mission teams around the world',
            'Partner with church-planting movements',
            'Engage our own community with the Gospel'
        ],
        ctaLabel: 'Explore Ministries',
        ctaLink: 'ministries.html'
    }
};

window.openValuePanel = function (key) {
    var p = VALUE_PANELS[key];
    if (!p) { console.warn('No panel config for', key); return; }

    var highlightsHTML = p.highlights.map(function (h) {
        return '<li><i class="fas fa-check-circle"></i> ' + h + '</li>';
    }).join('');

    var ctaHTML;
    if (p.ctaAction === 'smallgroup') {
        ctaHTML = '<button class="modal-panel-btn" onclick="closeModal();setTimeout(openSmallGroupPanel,400);" type="button"><span>' + p.ctaLabel + '</span> <i class="fas fa-arrow-right"></i></button>';
    } else if (p.ctaAction === 'volunteer') {
        ctaHTML = '<button class="modal-panel-btn" onclick="closeModal();setTimeout(openVolunteerPanel,400);" type="button"><span>' + p.ctaLabel + '</span> <i class="fas fa-arrow-right"></i></button>';
    } else {
        ctaHTML = '<a href="' + p.ctaLink + '" class="modal-panel-btn"><span>' + p.ctaLabel + '</span> <i class="fas fa-arrow-right"></i></a>';
    }

    var html = ''
        + '<div class="modal-panel-header">'
        +   '<div class="modal-panel-icon"><i class="fas ' + p.icon + '"></i></div>'
        +   '<h2>' + p.title + '</h2>'
        +   '<p class="modal-panel-subtitle">' + p.subtitle + '</p>'
        + '</div>'
        + '<p class="modal-panel-description">' + p.description + '</p>'
        + '<div class="modal-panel-scripture"><p>' + p.scripture + '</p></div>'
        + '<div class="panel-highlights">'
        +   '<h4 class="panel-highlights-title">What this looks like:</h4>'
        +   '<ul>' + highlightsHTML + '</ul>'
        + '</div>'
        + ctaHTML;

    openModal(html, p.theme);
};

// ============================================
// FAMILY CARD PANELS (Church Family / Fellowship / Worship)
// ============================================
var FAMILY_PANELS = {
    family: {
        theme: 'gold',
        icon: 'fa-church',
        title: 'Our Church Family',
        subtitle: 'A family of 2,500+ believers growing together.',
        description: 'Bridge Calvary Chapel is more than a building — it is a family of over 2,500 believers from every walk of life, every tribe, and every generation. We gather every week to worship Jesus, study the Bible, and do life together.',
        scripture: '"For where two or three are gathered in my name, there am I with them." — Matthew 18:20',
        highlights: [
            'Over 2,500 members and regular attenders',
            'People from all ages and backgrounds',
            'Worship services every Sunday morning',
            'A place where you can belong and grow'
        ],
        ctaLabel: 'Plan Your Visit',
        ctaLink: 'plan-your-visit.html'
    },
    fellowship: {
        theme: 'maroon',
        icon: 'fa-handshake',
        title: 'Fellowship',
        subtitle: 'Doing life together, every day of the week.',
        description: 'Fellowship is not just coffee after the service — it is the shared life of believers. We eat together, pray together, laugh together, and carry each other\'s burdens. Our small groups, men\'s and women\'s ministries, and youth groups are where real fellowship happens.',
        scripture: '"They devoted themselves to the apostles\' teaching and to fellowship, to the breaking of bread and to prayer." — Acts 2:42',
        highlights: [
            'Weekly small groups across the city',
            'Men\'s and women\'s ministry gatherings',
            'Youth and young adult fellowship nights',
            'Monthly church-wide meals and events'
        ],
        ctaLabel: 'Find a Small Group',
        ctaAction: 'smallgroup'
    },
    worship: {
        theme: 'cyan',
        icon: 'fa-music',
        title: 'Worship',
        subtitle: 'Lifting up Jesus through song and praise.',
        description: 'Worship at Bridge Calvary Chapel is centered on Jesus. Every Sunday we lift our voices together — old hymns and new songs — declaring the greatness of our God. Our worship team leads with reverence, joy, and a heart for the presence of God.',
        scripture: '"Sing to the Lord a new song; sing to the Lord, all the earth. Sing to the Lord, praise his name; proclaim his salvation day after day." — Psalm 96:1-2',
        highlights: [
            'Christ-centered worship every Sunday',
            'Contemporary and traditional songs',
            'Worship team and choir ministries',
            'Monthly worship and prayer nights'
        ],
        ctaLabel: 'Join the Worship Team',
        ctaAction: 'volunteer'
    }
};

window.openFamilyPanel = function (which) {
    var p = FAMILY_PANELS[which || 'family'];
    if (!p) return;

    var highlightsHTML = p.highlights.map(function (h) {
        return '<li><i class="fas fa-check-circle"></i> ' + h + '</li>';
    }).join('');

    var ctaHTML;
    if (p.ctaAction === 'smallgroup') {
        ctaHTML = '<button class="modal-panel-btn" onclick="closeModal();setTimeout(openSmallGroupPanel,400);" type="button"><span>' + p.ctaLabel + '</span> <i class="fas fa-arrow-right"></i></button>';
    } else if (p.ctaAction === 'volunteer') {
        ctaHTML = '<button class="modal-panel-btn" onclick="closeModal();setTimeout(openVolunteerPanel,400);" type="button"><span>' + p.ctaLabel + '</span> <i class="fas fa-arrow-right"></i></button>';
    } else {
        ctaHTML = '<a href="' + p.ctaLink + '" class="modal-panel-btn"><span>' + p.ctaLabel + '</span> <i class="fas fa-arrow-right"></i></a>';
    }

    var html = ''
        + '<div class="modal-panel-header">'
        +   '<div class="modal-panel-icon"><i class="fas ' + p.icon + '"></i></div>'
        +   '<h2>' + p.title + '</h2>'
        +   '<p class="modal-panel-subtitle">' + p.subtitle + '</p>'
        + '</div>'
        + '<p class="modal-panel-description">' + p.description + '</p>'
        + '<div class="modal-panel-scripture"><p>' + p.scripture + '</p></div>'
        + '<div class="panel-highlights">'
        +   '<h4 class="panel-highlights-title">What this looks like:</h4>'
        +   '<ul>' + highlightsHTML + '</ul>'
        + '</div>'
        + ctaHTML;

    openModal(html, p.theme);
};

// ============================================
// SMALL GROUP PANEL
// ============================================
window.openSmallGroupPanel = function () {
    if (!smallGroupsCache.length) {
        openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-users"></i></div><h2>Find a Small Group</h2><p class="modal-panel-subtitle">No groups available right now.</p></div>', 'blue');
        return;
    }

    var items = smallGroupsCache.map(function (g) {
        return '<div class="modal-list-item">'
            + '<h4><i class="fas fa-users"></i> ' + g.name + '</h4>'
            + '<p>' + (g.description || '') + '</p>'
            + '<div class="modal-list-meta">'
            +   (g.meeting_day ? '<span><i class="fas fa-calendar"></i> ' + g.meeting_day + '</span>' : '')
            +   (g.meeting_time ? '<span><i class="fas fa-clock"></i> ' + g.meeting_time + '</span>' : '')
            +   (g.location ? '<span><i class="fas fa-map-marker-alt"></i> ' + g.location + '</span>' : '')
            + '</div>'
            + '<button class="modal-list-btn" data-group="' + g.name + '" type="button">Join This Group <i class="fas fa-arrow-right"></i></button>'
            + '</div>';
    }).join('');

    openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-users"></i></div><h2>Find a Small Group</h2><p class="modal-panel-subtitle">Grow deeper in your faith through real community.</p></div><div class="modal-list">' + items + '</div>', 'blue');

    document.querySelectorAll('.modal-list-btn[data-group]').forEach(function (btn) {
        btn.addEventListener('click', function () { joinGroup(btn.dataset.group); });
    });
};

// ============================================
// VOLUNTEER PANEL
// ============================================
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
        return '<div class="modal-list-item">'
            + '<h4><i class="fas ' + o.icon + '"></i> ' + o.name + '</h4>'
            + '<button class="modal-list-btn" data-volunteer="' + o.name + '" type="button">Get Involved <i class="fas fa-arrow-right"></i></button>'
            + '</div>';
    }).join('');

    openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-hands-helping"></i></div><h2>Start Volunteering</h2><p class="modal-panel-subtitle">Use your gifts to make an eternal impact.</p></div><div class="modal-list">' + items + '</div>', 'gold');

    document.querySelectorAll('.modal-list-btn[data-volunteer]').forEach(function (btn) {
        btn.addEventListener('click', function () { volunteerInterest(btn.dataset.volunteer); });
    });
};

// ============================================
// JOIN GROUP FORM
// ============================================
window.joinGroup = function (groupName) {
    var html = '<div class="modal-panel-header">'
        + '<div class="modal-panel-icon"><i class="fas fa-user-plus"></i></div>'
        + '<h2>Join "' + groupName + '"</h2>'
        + '<p class="modal-panel-subtitle">Fill in your details. We\'ll prepare a message for you to send us via WhatsApp or Email.</p>'
        + '</div>'
        + '<form id="joinGroupForm" class="modal-form">'
        + '<input type="hidden" name="group_name" value="' + groupName + '">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone" placeholder="+256..."></label>'
        + '<label>Message<textarea name="message" rows="3" placeholder="Anything you\'d like us to know?"></textarea></label>'
        + '<button type="submit" class="modal-panel-btn"><span>Submit &amp; Send to Church</span> <i class="fas fa-paper-plane"></i></button>'
        + '<p class="form-status"></p>'
        + '</form>';

    openModal(html, 'blue');

    document.getElementById('joinGroupForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var status = e.target.querySelector('.form-status');
        var btn = e.target.querySelector('button[type="submit"]');
        status.textContent = 'Submitting...';
        status.className = 'form-status loading';
        btn.disabled = true;

        var payload = { type: 'Join Small Group' };
        new FormData(e.target).forEach(function (v, k) { payload[k] = v; });

        try {
            await window.db.submitGroupRequest(payload);
            showSubmissionSummary(payload);
        } catch (err) {
            console.error('Group submit error:', err);
            status.textContent = '❌ ' + (err.message || 'Something went wrong. Please try again.');
            status.className = 'form-status error';
            btn.disabled = false;
        }
    });
};

// ============================================
// VOLUNTEER FORM
// ============================================
window.volunteerInterest = function (ministryName) {
    var html = '<div class="modal-panel-header">'
        + '<div class="modal-panel-icon"><i class="fas fa-hands-helping"></i></div>'
        + '<h2>Volunteer: ' + ministryName + '</h2>'
        + '<p class="modal-panel-subtitle">Fill in your details. We\'ll prepare a message for you to send us via WhatsApp or Email.</p>'
        + '</div>'
        + '<form id="volunteerForm" class="modal-form">'
        + '<input type="hidden" name="ministry" value="' + ministryName + '">'
        + '<label>Your Name *<input type="text" name="name" required></label>'
        + '<label>Email *<input type="email" name="email" required></label>'
        + '<label>Phone<input type="tel" name="phone" placeholder="+256..."></label>'
        + '<label>Message<textarea name="message" rows="3" placeholder="Tell us how you\'d like to serve"></textarea></label>'
        + '<button type="submit" class="modal-panel-btn"><span>Submit &amp; Send to Church</span> <i class="fas fa-paper-plane"></i></button>'
        + '<p class="form-status"></p>'
        + '</form>';

    openModal(html, 'gold');

    document.getElementById('volunteerForm').addEventListener('submit', async function (e) {
        e.preventDefault();
        var status = e.target.querySelector('.form-status');
        var btn = e.target.querySelector('button[type="submit"]');
        status.textContent = 'Submitting...';
        status.className = 'form-status loading';
        btn.disabled = true;

        var payload = { type: 'Volunteer Signup' };
        new FormData(e.target).forEach(function (v, k) { payload[k] = v; });

        try {
            await window.db.submitVolunteerRequest(payload);
            showSubmissionSummary(payload);
        } catch (err) {
            console.error('Volunteer submit error:', err);
            status.textContent = '❌ ' + (err.message || 'Something went wrong. Please try again.');
            status.className = 'form-status error';
            btn.disabled = false;
        }
    });
};

// ============================================
// SUBMISSION SUMMARY (WhatsApp + Email)
// ============================================
window.showSubmissionSummary = function (payload) {
    var c = window.CHURCH_CONTACT || { whatsapp: '', email: '', name: 'the Church' };

    var lines = [];
    lines.push('🙏 ' + payload.type + ' — Bridge Calvary Chapel');
    lines.push('');
    lines.push('👤 Name: ' + (payload.name || '—'));
    lines.push('📧 Email: ' + (payload.email || '—'));
    if (payload.phone)      lines.push('📱 Phone: ' + payload.phone);
    if (payload.group_name) lines.push('👥 Group: ' + payload.group_name);
    if (payload.ministry)   lines.push('🤝 Ministry: ' + payload.ministry);
    if (payload.message)    lines.push('📝 Message: ' + payload.message);
    lines.push('');
    lines.push('Sent from Bridge Calvary Chapel website');

    var fullText = lines.join('\n');
    var waText = encodeURIComponent(fullText);
    var emailSubject = encodeURIComponent(payload.type + ' — ' + (payload.name || 'Website'));
    var emailBody = encodeURIComponent(fullText);

    var summaryRows = '';
    if (payload.name)       summaryRows += '<div class="summary-row"><span>👤 Name</span><strong>' + payload.name + '</strong></div>';
    if (payload.email)      summaryRows += '<div class="summary-row"><span>📧 Email</span><strong>' + payload.email + '</strong></div>';
    if (payload.phone)      summaryRows += '<div class="summary-row"><span>📱 Phone</span><strong>' + payload.phone + '</strong></div>';
    if (payload.group_name) summaryRows += '<div class="summary-row"><span>👥 Group</span><strong>' + payload.group_name + '</strong></div>';
    if (payload.ministry)   summaryRows += '<div class="summary-row"><span>🤝 Ministry</span><strong>' + payload.ministry + '</strong></div>';
    if (payload.message)    summaryRows += '<div class="summary-row full"><span>📝 Message</span><strong>' + payload.message + '</strong></div>';

    var html = ''
        + '<div class="modal-panel-header">'
        +   '<div class="modal-panel-icon"><i class="fas fa-check"></i></div>'
        +   '<h2>Sent Successfully!</h2>'
        +   '<p class="modal-panel-subtitle">Your request was saved. Now send it to our church office so we can respond quickly.</p>'
        + '</div>'
        + '<div class="submission-summary">'
        +   '<h4 class="summary-title">Your Information</h4>'
        +   summaryRows
        + '</div>'
        + '<div class="send-options">'
        +   '<h4 class="send-title">Send to our church office:</h4>'
        +   '<a class="send-btn send-whatsapp" href="https://wa.me/' + c.whatsapp + '?text=' + waText + '" target="_blank" rel="noopener">'
        +     '<i class="fab fa-whatsapp"></i>'
        +     '<div><strong>Send via WhatsApp</strong><small>Chat with +' + c.whatsapp + '</small></div>'
        +     '<i class="fas fa-external-link-alt"></i>'
        +   '</a>'
        +   '<a class="send-btn send-email" href="mailto:' + c.email + '?subject=' + emailSubject + '&body=' + emailBody + '">'
        +     '<i class="fas fa-envelope"></i>'
        +     '<div><strong>Send via Email</strong><small>' + c.email + '</small></div>'
        +     '<i class="fas fa-external-link-alt"></i>'
        +   '</a>'
        +   '<button class="modal-panel-btn modal-panel-btn-secondary" onclick="closeModal();" type="button"><span>Close</span></button>'
        + '</div>';

    openModal(html, 'success');
};

// ============================================
// RENDER HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el) el.textContent = val || ''; }
function setSrc(id, val) { var el = document.getElementById(id); if (el && val) el.src = val; }

function renderHero() {
    var h = siteContent.hero || {};
    setText('heroEyebrow', h.eyebrow);
    setText('heroLine1', h.title_line1);
    setText('heroLine2', h.title_line2);
    setText('heroLine3', h.title_line3);
    setText('heroTagline', h.tagline);
    setText('heroDescription', h.description);
    setSrc('heroImage', h.hero_image);
}

function renderFamily() {
    var f = siteContent.family || {};
    setSrc('familyMainImg', f.main_image);
    setSrc('familySmall1', f.small_image_1);
    setSrc('familySmall2', f.small_image_2);
    setText('familyStatNumber', f.stat_number);
    setText('familyStatLabel', f.stat_label);
    setText('familyVerseText', f.verse_text);
    setText('familyVerseRef', f.verse_reference);
}

function renderService(service) {
    if (!service) return;
    setText('serviceTitle', service.title);
    setText('serviceDay', service.day_label);
    setText('serviceTime', service.time_label);
    setText('serviceInvite', service.invite_text);
}

function renderValueCards() {
    var grid = document.getElementById('valuesGrid');
    if (!grid) return;
    var keys = ['value_biblical', 'value_community', 'value_serve', 'value_world'];
    var html = keys.map(function (key) {
        var p = VALUE_PANELS[key];
        if (!p) return '';
        var variant = (key === 'value_community') ? 'value-maroon' : (key === 'value_serve' ? 'value-gold' : (key === 'value_world' ? 'value-cyan' : 'value-blue'));
        return '<article class="value-card ' + variant + '" data-value="' + key + '" tabindex="0" role="button">'
            + '<div class="value-image">'
            +   '<div class="value-icon"><i class="fas ' + p.icon + '"></i></div>'
            + '</div>'
            + '<div class="value-body">'
            +   '<h3>' + p.title + '</h3>'
            +   '<p>' + p.subtitle + '</p>'
            +   '<span class="value-btn">Learn More <i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '</article>';
    }).join('');
    grid.innerHTML = html;

    grid.querySelectorAll('.value-card').forEach(function (card) {
        var open = function () { openValuePanel(card.dataset.value); };
        card.addEventListener('click', open);
        card.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); }
        });
    });
}

function renderEvents(events) {
    var c = document.getElementById('eventsSlider');
    if (!c) return;
    if (!events.length) { c.innerHTML = '<p class="empty-state">No upcoming events.</p>'; return; }
    c.innerHTML = events.map(function (e) {
        return '<article class="event-card">'
            + '<div class="event-image">'
            +   '<img src="' + (e.image_url || '') + '" alt="' + (e.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="event-date-badge"><span class="event-month">' + (e.month_label || '') + '</span><span class="event-day">' + (e.day_label || '') + '</span></div>'
            + '</div>'
            + '<div class="event-body">'
            +   '<h4>' + (e.title || '') + '</h4>'
            +   (e.time_label ? '<p><i class="fas fa-clock"></i> ' + e.time_label + '</p>' : '')
            +   (e.location ? '<p><i class="fas fa-map-marker-alt"></i> ' + e.location + '</p>' : '')
            +   '<span class="event-arrow"><i class="fas fa-arrow-right"></i></span>'
            + '</div>'
            + '</article>';
    }).join('');
}

function renderMinistries(ministries) {
    var c = document.getElementById('ministriesGrid');
    if (!c) return;
    if (!ministries.length) { c.innerHTML = '<p class="empty-state">No ministries.</p>'; return; }
    var top3 = ministries.slice(0, 3);
    var colors = ['icon-blue', 'icon-maroon', 'icon-gold'];
    c.innerHTML = top3.map(function (m, i) {
        return '<a href="ministries.html" class="ministry-card">'
            + '<div class="ministry-image">'
            +   '<img src="' + (m.image_url || '') + '" alt="' + (m.name || '') + '" onerror="this.style.display=\'none\'">'
            + '</div>'
            + '<div class="ministry-icon ' + colors[i % 3] + '"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            + '<div class="ministry-overlay"><h4>' + (m.name || '') + '</h4><span class="ministry-arrow"><i class="fas fa-arrow-right"></i></span></div>'
            + '</a>';
    }).join('');
}

function renderSermons(sermons) {
    var c = document.getElementById('sermonsSlider');
    if (!c) return;
    if (!sermons.length) { c.innerHTML = '<p class="empty-state">No sermons.</p>'; return; }
    var top3 = sermons.slice(0, 3);
    c.innerHTML = top3.map(function (s) {
        return '<article class="sermon-card">'
            + '<div class="sermon-image">'
            +   '<img src="' + (s.thumbnail_url || '') + '" alt="' + (s.title || '') + '" onerror="this.style.display=\'none\'">'
            +   '<div class="sermon-play"><i class="fas fa-play"></i></div>'
            +   (s.duration ? '<span class="sermon-duration">' + s.duration + '</span>' : '')
            + '</div>'
            + '<div class="sermon-body">'
            +   '<h4>' + (s.title || '') + '</h4>'
            +   (s.speaker ? '<p><i class="fas fa-user"></i> ' + s.speaker + '</p>' : '')
            +   (s.date_label ? '<p><i class="fas fa-calendar"></i> ' + s.date_label + '</p>' : '')
            + '</div>'
            + '</article>';
    }).join('');

    c.querySelectorAll('.sermon-card').forEach(function (card) {
        card.addEventListener('click', function () { window.location.href = 'sermons.html'; });
    });
}

// ============================================
// LOAD DATA
// ============================================
async function loadAllData() {
    console.log('📥 Loading data...');
    try {
        var results = await Promise.all([
            window.db.getSiteContent(),
            window.db.getNextService(),
            window.db.getMinistries(),
            window.db.getEvents(),
            window.db.getSermons(),
            window.db.getSmallGroups()
        ]);
        siteContent = results[0] || {};
        smallGroupsCache = results[5] || [];

        renderHero();
        renderFamily();
        renderService(results[1]);
        renderValueCards();
        renderEvents(results[3]);
        renderMinistries(results[2]);
        renderSermons(results[4]);

        console.log('✅ All data loaded and rendered');
    } catch (err) {
        console.error('❌ Load error:', err);
    }
}

window.addEventListener('supabase-ready', loadAllData);
setTimeout(function () {
    if (window.db && Object.keys(siteContent).length === 0) loadAllData();
}, 2000);

// ============================================
// WELCOME VIDEO
// ============================================
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

// ============================================
// DOM READY
// ============================================
document.addEventListener('DOMContentLoaded', function () {
    console.log('✅ main.js initialized');

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

    // Welcome video button
    var btnWelcome = document.getElementById('btnWatchWelcome');
    if (btnWelcome) btnWelcome.addEventListener('click', openWelcomeVideo);

    // Modal close
    var overlay = document.getElementById('modalOverlay');
    var closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);

    // Video modal close
    document.querySelectorAll('[data-close-modal]').forEach(function (el) {
        el.addEventListener('click', closeWelcomeVideo);
    });

    // Engagement panel buttons
    document.querySelectorAll('[data-panel]').forEach(function (btn) {
        btn.addEventListener('click', function () {
            var p = btn.dataset.panel;
            if (p === 'smallgroup') openSmallGroupPanel();
            if (p === 'volunteer') openVolunteerPanel();
        });
    });

    // Family card individual photo clicks
    var fMain = document.getElementById('familyMainImg');
    var fSmall1 = document.getElementById('familySmall1');
    var fSmall2 = document.getElementById('familySmall2');
    if (fMain)   fMain.parentElement.addEventListener('click',   function (e) { e.stopPropagation(); openFamilyPanel('family'); });
    if (fSmall1) fSmall1.parentElement.addEventListener('click', function (e) { e.stopPropagation(); openFamilyPanel('fellowship'); });
    if (fSmall2) fSmall2.parentElement.addEventListener('click', function (e) { e.stopPropagation(); openFamilyPanel('worship'); });

    // Family card background click
    var familyCard = document.getElementById('familyCard');
    if (familyCard) {
        familyCard.addEventListener('click', function () { openFamilyPanel('family'); });
        familyCard.addEventListener('keydown', function (e) {
            if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openFamilyPanel('family'); }
        });
    }

    // Newsletter form
    var newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', async function (e) {
            e.preventDefault();
            var input = e.target.querySelector('input[type="email"]');
            var btn = e.target.querySelector('button');
            var email = input.value.trim();
            if (!email || email.indexOf('@') === -1) { alert('Please enter a valid email.'); return; }

            var orig = btn.innerHTML;
            btn.innerHTML = '...';
            btn.disabled = true;
            try {
                var result = await window.db.subscribeNewsletter(email);
                alert(result.duplicate ? 'You are already subscribed!' : '✅ Thank you for subscribing!');
                input.value = '';
            } catch (err) {
                console.error(err);
                alert('❌ Something went wrong. Please try again.');
            } finally {
                btn.innerHTML = orig;
                btn.disabled = false;
            }
        });
    }

    // Escape closes
    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape') { closeModal(); closeWelcomeVideo(); }
    });

    // Year
    var y = document.getElementById('currentYear');
    if (y) y.textContent = new Date().getFullYear();
});