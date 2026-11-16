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
window.openModal = function (html, imageUrl, panelClass) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    var imageWrap = document.getElementById('modalPanelImage');
    var imageEl = document.getElementById('modalPanelImg');
    if (!panel || !body) return;
    panel.classList.toggle('devotion-panel', panelClass === 'devotion-panel');

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
    panel.classList.remove('devotion-panel');
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

    openModal(html, sectionImg(key));
};

// ---------- SMALL GROUP / VOLUNTEER ----------
window.openSmallGroupPanel = function () {
    if (!smallGroupsCache.length) {
        openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-users"></i></div><h2>Find Your Community</h2><p class="modal-panel-subtitle">There are no groups listed right now, but we would love to help you find one.</p></div><button class="modal-panel-btn" id="requestGroupInfo" type="button"><span>Request Group Information</span> <i class="fas fa-arrow-right"></i></button>');
        document.getElementById('requestGroupInfo').addEventListener('click', function () { joinGroup('Small Group'); });
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
    openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-users"></i></div><h2>Find Your Community</h2><p class="modal-panel-subtitle">Grow in faith and friendship through a group that fits your life.</p></div><div class="modal-list">' + items + '</div>');
    document.querySelectorAll('.modal-list-btn[data-group]').forEach(function (btn) {
        btn.addEventListener('click', function () { joinGroup(btn.dataset.group); });
    });
};

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
    openModal('<div class="modal-panel-header"><div class="modal-panel-icon"><i class="fas fa-hands-helping"></i></div><h2>Serve With Purpose</h2><p class="modal-panel-subtitle">Use your gifts to make an eternal impact.</p></div><div class="modal-list">' + items + '</div>');
    document.querySelectorAll('.modal-list-btn[data-volunteer]').forEach(function (btn) {
        btn.addEventListener('click', function () { volunteerInterest(btn.dataset.volunteer); });
    });
};

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
            showRequestContactActions(e.target, payload, 'Small group request');
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
            showRequestContactActions(e.target, payload, 'Volunteer interest');
        } catch (err) {
            console.error(err);
            st.textContent = '❌ ' + (err.message || 'Error'); st.className = 'form-status error'; btn.disabled = false;
        }
    });
};

function showRequestContactActions(form, payload, subject) {
    var contact = window.CHURCH_CONTACT || {};
    var phone = String(contact.whatsapp || '').replace(/\D/g, '');
    var email = contact.email || '';
    var lines = [
        'Hello ' + (contact.name || 'Bridge Calvary Chapel') + ',',
        '',
        subject,
        'Name: ' + (payload.name || ''),
        'Email: ' + (payload.email || ''),
        'Phone: ' + (payload.phone || 'Not provided'),
        'Message: ' + (payload.message || 'Not provided')
    ];
    if (payload.group_name) lines.splice(3, 0, 'Group: ' + payload.group_name);
    if (payload.ministry) lines.splice(3, 0, 'Ministry: ' + payload.ministry);

    var message = lines.join('\n');
    var actions = '';
    if (phone) {
        actions += '<a class="modal-btn modal-btn-whatsapp" href="https://wa.me/' + phone + '?text=' + encodeURIComponent(message) + '" target="_blank" rel="noopener"><i class="fab fa-whatsapp"></i> Send with WhatsApp</a>';
    }
    if (email) {
        actions += '<a class="modal-btn modal-btn-email" href="mailto:' + encodeURIComponent(email) + '?subject=' + encodeURIComponent(subject) + '&body=' + encodeURIComponent(message) + '"><i class="fas fa-envelope"></i> Send with Email</a>';
    }

    var status = actions
        ? 'Your request is saved. Choose WhatsApp or Email to send it to the church.'
        : 'Your request is saved, but the church contact details are not configured yet.';
    form.innerHTML = '<p class="form-status success">' + status + '</p>'
        + (actions ? '<div class="modal-actions request-contact-actions">' + actions + '</div>' : '');
}

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

// ---------- RENDER: EVENTS (Horizontal, Small Cards) ----------
function renderEvents(events) {
    var c = document.getElementById('eventsSlider');
    if (!c) return;
    if (!events.length) { c.innerHTML = '<p style="padding:20px;color:#94a3b8;">No upcoming events.</p>'; return; }
    
    c.innerHTML = events.slice(0, 8).map(function (e) {
        return '<article class="event-card">'
            + '<div class="event-image"><img src="' + escapeHtml(e.image_url || '') + '" alt="" onerror="this.style.display=\'none\'"><div class="event-date-badge"><span class="event-month">' + escapeHtml(e.month_label || '') + '</span><span class="event-day">' + escapeHtml(e.day_label || '') + '</span></div></div>'
            + '<div class="event-body"><h4>' + escapeHtml(e.title || '') + '</h4>'
            + (e.time_label ? '<p><i class="fas fa-clock"></i> ' + escapeHtml(e.time_label) + '</p>' : '')
            + (e.location ? '<p><i class="fas fa-map-marker-alt"></i> ' + escapeHtml(e.location) + '</p>' : '')
            + '<a href="events-announcements.html" class="btn btn-primary" style="margin-top:12px;width:100%;justify-content:center;">View Details <i class="fas fa-arrow-right"></i></a>'
            + '</div></article>';
    }).join('');
}

// ---------- RENDER: MINISTRIES (Horizontal, Small Cards) ----------
function renderMinistries(ministries) {
    var c = document.getElementById('ministriesGrid');
    if (!c) return;
    if (!ministries.length) { c.innerHTML = '<p style="padding:20px;color:#94a3b8;">No ministries.</p>'; return; }
    
    var top8 = ministries.slice(0, 8);
    var colors = ['icon-blue', 'icon-maroon', 'icon-blue', 'icon-gold'];
    
    c.innerHTML = top8.map(function (m, i) {
        return '<a href="ministries.html" class="ministry-card">'
            + '<div class="ministry-image"><img src="' + escapeHtml(m.image_url || '') + '" alt="" onerror="this.style.display=\'none\'"></div>'
            + '<div class="ministry-icon ' + colors[i % colors.length] + '"><i class="fas ' + (m.icon || 'fa-church') + '"></i></div>'
            + '<div class="ministry-overlay"><h4>' + escapeHtml(m.name || '') + '</h4><span class="ministry-arrow"><i class="fas fa-arrow-right"></i></span></div></a>';
    }).join('');
}

// ---------- RENDER: SERMONS (Horizontal, Small Cards) ----------
function renderSermons(sermons) {
    var c = document.getElementById('sermonsSlider');
    if (!c) return;
    if (!sermons.length) { c.innerHTML = '<p style="padding:20px;color:#94a3b8;">No sermons.</p>'; return; }
    
    var top8 = sermons.slice(0, 8);
    
    c.innerHTML = top8.map(function (s) {
        return '<article class="sermon-card">'
            + '<div class="sermon-image"><img src="' + escapeHtml(s.thumbnail_url || '') + '" alt="" onerror="this.style.display=\'none\'"><div class="sermon-play"><i class="fas fa-play"></i></div>' + (s.duration ? '<span class="sermon-duration">' + escapeHtml(s.duration) + '</span>' : '') + '</div>'
            + '<div class="sermon-body"><h4>' + escapeHtml(s.title || '') + '</h4>'
            + (s.speaker ? '<p><i class="fas fa-user"></i> ' + escapeHtml(s.speaker) + '</p>' : '')
            + '<a href="sermons.html" class="btn btn-primary" style="margin-top:8px;width:100%;justify-content:center;">Watch <i class="fas fa-arrow-right"></i></a>'
            + '</div></article>';
    }).join('');
}

function drawDevotionShareText(ctx, text, x, y, maxWidth, lineHeight, maxLines) {
    var words = String(text || '').replace(/\s+/g, ' ').trim().split(' ');
    if (!words[0]) return y;

    var lines = [];
    var line = '';
    var index = 0;
    var truncated = false;
    for (; index < words.length; index++) {
        var candidate = line ? line + ' ' + words[index] : words[index];
        if (line && ctx.measureText(candidate).width > maxWidth) {
            lines.push(line);
            line = words[index];
            if (lines.length >= maxLines) {
                truncated = true;
                break;
            }
        } else {
            line = candidate;
        }
    }
    if (line && lines.length < maxLines) {
        lines.push(line);
        if (index < words.length - 1) truncated = true;
    }
    if (truncated && lines.length) {
        var last = lines[lines.length - 1];
        while (last && ctx.measureText(last + '...').width > maxWidth) last = last.slice(0, -1);
        lines[lines.length - 1] = last.trimEnd() + '...';
    }
    lines.forEach(function (value, lineIndex) {
        ctx.fillText(value, x, y + lineIndex * lineHeight);
    });
    return y + lines.length * lineHeight;
}

function createDevotionShareImage(devotion) {
    return new Promise(function (resolve, reject) {
        var canvas = document.createElement('canvas');
        canvas.width = 1080;
        canvas.height = 1350;
        var ctx = canvas.getContext('2d');
        if (!ctx) {
            reject(new Error('Your browser could not create the devotion image.'));
            return;
        }

        var background = ctx.createLinearGradient(0, 0, 1080, 1350);
        background.addColorStop(0, '#071E42');
        background.addColorStop(0.55, '#0B5ED7');
        background.addColorStop(1, '#06152F');
        ctx.fillStyle = background;
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        ctx.fillStyle = 'rgba(24, 200, 255, 0.18)';
        ctx.beginPath();
        ctx.arc(940, 180, 260, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = 'rgba(255, 255, 255, 0.08)';
        ctx.beginPath();
        ctx.arc(80, 1190, 300, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#8BE9FF';
        ctx.font = '700 25px Arial, sans-serif';
        ctx.fillText('DAILY INSPIRATION', 78, 105);

        ctx.fillStyle = '#FFFFFF';
        ctx.font = '700 56px Georgia, serif';
        var titleBottom = drawDevotionShareText(ctx, devotion.title || 'Daily Devotion', 78, 185, 920, 70, 2);

        ctx.fillStyle = '#B9F2FF';
        ctx.font = '700 27px Arial, sans-serif';
        ctx.fillText(String(devotion.verse_reference || 'A moment in Scripture').slice(0, 68), 78, titleBottom + 18, 920);

        ctx.fillStyle = 'rgba(4, 20, 45, 0.5)';
        ctx.fillRect(60, titleBottom + 58, 960, 400);
        ctx.fillStyle = '#8BE9FF';
        ctx.font = '700 22px Arial, sans-serif';
        ctx.fillText('SCRIPTURE', 92, titleBottom + 112);
        ctx.fillStyle = '#FFFFFF';
        ctx.font = 'italic 34px Georgia, serif';
        var verseBottom = drawDevotionShareText(ctx, devotion.verse_text || devotion.description || '', 92, titleBottom + 170, 890, 48, 5);

        ctx.fillStyle = '#8BE9FF';
        ctx.font = '700 22px Arial, sans-serif';
        ctx.fillText('REFLECTION', 78, verseBottom + 98);
        ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        ctx.font = '30px Arial, sans-serif';
        var reflectionBottom = drawDevotionShareText(ctx, devotion.reflection || devotion.description || '', 78, verseBottom + 150, 920, 44, 5);

        if (devotion.prayer) {
            ctx.fillStyle = '#8BE9FF';
            ctx.font = '700 22px Arial, sans-serif';
            ctx.fillText('PRAYER', 78, reflectionBottom + 58);
            ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
            ctx.font = 'italic 27px Georgia, serif';
            drawDevotionShareText(ctx, devotion.prayer, 78, reflectionBottom + 104, 920, 40, 3);
        }

        ctx.fillStyle = 'rgba(255, 255, 255, 0.72)';
        ctx.font = '700 20px Arial, sans-serif';
        ctx.fillText('THE BRIDGE CALVARY CHAPEL', 78, 1290);
        canvas.toBlob(function (blob) {
            if (blob) resolve(blob);
            else reject(new Error('The devotion image could not be created.'));
        }, 'image/png');
    });
}

async function shareDevotionImage(devotion, status) {
    status.textContent = 'Preparing your devotion image...';
    try {
        var blob = await createDevotionShareImage(devotion);
        var safeTitle = (devotion.title || 'daily-devotion').replace(/[^\w-]+/g, '-').replace(/^-+|-+$/g, '').toLowerCase();
        var file = new File([blob], (safeTitle || 'daily-devotion') + '.png', { type: 'image/png' });
        var shareText = (devotion.title || 'Daily Devotion') + (devotion.verse_reference ? ' — ' + devotion.verse_reference : '');

        if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
            await navigator.share({ files: [file], title: devotion.title || 'Daily Devotion', text: shareText });
            status.textContent = 'Your devotion image was shared.';
            return;
        }

        var url = URL.createObjectURL(blob);
        var download = document.createElement('a');
        download.href = url;
        download.download = file.name;
        document.body.appendChild(download);
        download.click();
        download.remove();
        setTimeout(function () { URL.revokeObjectURL(url); }, 30000);
        status.textContent = 'Image downloaded. Attach it to a message to share.';
    } catch (err) {
        if (err.name === 'AbortError') {
            status.textContent = 'Sharing cancelled.';
            return;
        }
        console.error('Could not share the devotion image:', err);
        status.textContent = 'Could not create the image. Please try again.';
    }
}

// ---------- RENDER: DEVOTIONS (Five Latest Published Cards) ----------
function renderDevotion(devotions) {
    var container = document.getElementById('devotionSlider');
    if (!container) return;
    
    var list = Array.isArray(devotions) ? devotions : (devotions ? [devotions] : []);
    
    if (!list.length) {
        container.innerHTML = '<p style="padding:20px;color:#94a3b8;">No devotions available.</p>';
        return;
    }

    container.innerHTML = list.slice(0, 5).map(function(d, idx) {
        var imageUrl = d.image_url || sectionImg('devotion') || 'assets/images/yh.jpg';
        var imgHtml = '<div class="devotion-thumb"><img src="' + escapeHtml(imageUrl) + '" alt="' + escapeHtml(d.title || 'Daily devotion') + '" loading="lazy" onerror="this.onerror=null;this.src=\'assets/images/yh.jpg\'"></div>';
        return '<div class="devotion-card" data-devotion="' + idx + '" role="button" tabindex="0">'
            + imgHtml
            + '<div class="devotion-card-title">' + escapeHtml(d.title || 'Daily Devotion') + '</div>'
            + '<div class="devotion-card-ref">' + escapeHtml(d.verse_reference || '') + '</div>'
            + '<div class="devotion-card-desc">' + escapeHtml(d.reflection || '') + '</div>'
            + '<div class="devotion-card-btn">Read More <i class="fas fa-arrow-right"></i></div>'
            + '</div>';
    }).join('');

    container.querySelectorAll('.devotion-card').forEach(function(card) {
        function openDevotion() {
            var idx = parseInt(card.dataset.devotion, 10);
            var d = list[idx];
            if (!d) return;
            
            var html = '<div class="modal-panel-header">'
                + '<div class="modal-panel-icon"><i class="fas fa-book-bible"></i></div>'
                + '<h2>' + escapeHtml(d.title || 'Daily Devotion') + '</h2>'
                + '<p class="modal-panel-subtitle">' + escapeHtml(d.verse_reference || '') + '</p>'
                + '</div>'
                + (d.description ? '<p class="devotion-panel-intro">' + escapeHtml(d.description) + '</p>' : '')
                + (d.verse_text ? '<div class="modal-panel-scripture devotion-panel-scripture"><span class="devotion-panel-label">TODAY\'S SCRIPTURE</span><p>"' + escapeHtml(d.verse_text) + '"</p></div>' : '')
                + (d.reflection ? '<section class="devotion-panel-reflection"><h3>Reflection</h3><p class="modal-panel-description">' + escapeHtml(d.reflection) + '</p></section>' : '')
                + (d.prayer ? '<div class="modal-panel-scripture devotion-panel-prayer"><span class="devotion-panel-label">PRAYER</span><p>' + escapeHtml(d.prayer) + '</p></div>' : '')
                + '<div class="devotion-share-row"><button class="devotion-share-button" id="shareDevotionImage" type="button"><i class="fas fa-share-alt"></i> Share devotion image</button><p class="devotion-share-status" id="devotionShareStatus" role="status" aria-live="polite"></p></div>';
            
            var panelImageUrl = d.image_url || sectionImg('devotion') || 'assets/images/yh.jpg';
            var panelImage = document.getElementById('modalPanelImg');
            if (panelImage) {
                panelImage.onerror = function () {
                    panelImage.onerror = null;
                    if (!document.getElementById('modalPanelImage').hidden) panelImage.src = 'assets/images/yh.jpg';
                };
            }
            openModal(html, panelImageUrl, 'devotion-panel');
            var shareButton = document.getElementById('shareDevotionImage');
            var shareStatus = document.getElementById('devotionShareStatus');
            shareButton.addEventListener('click', function () { shareDevotionImage(d, shareStatus); });
        }

        card.addEventListener('click', openDevotion);
        card.addEventListener('keydown', function(e) {
            if (e.key !== 'Enter' && e.key !== ' ') return;
            e.preventDefault();
            openDevotion();
        });
    });
}

// ============================================
// ROTATING POPUP
// ============================================
function pickRandomCard(cards) {
    if (!cards || !cards.length) return null;
    return cards[Math.floor(Math.random() * cards.length)];
}

function renderPopupCard(card) {
    if (!card) return;
    var overlay = document.getElementById('shopPopupOverlay');
    if (!overlay) return;

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
            img.onerror = function () { this.style.display = 'none'; ph.style.display = 'flex'; };
            img.onload = function () { this.style.display = 'block'; ph.style.display = 'none'; };
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

    var btn = document.getElementById('shopPopupBtn');
    if (btn) {
        btn.href = card.button_url || (isDonation ? 'donations.html' : 'church-shop.html');
        btn.innerHTML = (card.button_text || (isDonation ? 'Donate Now' : 'Visit Church Shop')) + ' <i class="fas fa-arrow-right"></i>';
        btn.classList.toggle('is-donation', isDonation);
    }

    var delay = (card.display_delay_seconds || 3) * 1000;
    var duration = (card.display_duration_seconds || 60) * 1000;

    setTimeout(function () { overlay.classList.add('active'); overlay.setAttribute('aria-hidden', 'false'); }, delay);
    setTimeout(function () { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true'); }, delay + duration);

    var closeBtn = document.getElementById('shopPopupClose');
    if (closeBtn) closeBtn.onclick = function() { overlay.classList.remove('active'); overlay.setAttribute('aria-hidden', 'true'); };
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
            window.db.getDevotions ? window.db.getDevotions(5) : Promise.resolve([]),
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

        // Engagement Cards Fallback Images
        var sgImg = document.getElementById('engSmallGroupImg');
        if (sgImg) sgImg.src = siteContent.engagement_smallgroup && (siteContent.engagement_smallgroup.image || siteContent.engagement_smallgroup.image_url) ? (siteContent.engagement_smallgroup.image || siteContent.engagement_smallgroup.image_url) : 'assets/images/sp.jpg';

        var volImg = document.getElementById('engVolunteerImg');
        if (volImg) volImg.src = siteContent.engagement_volunteer && (siteContent.engagement_volunteer.image || siteContent.engagement_volunteer.image_url) ? (siteContent.engagement_volunteer.image || siteContent.engagement_volunteer.image_url) : 'assets/images/yh.jpg';

        var newsImg = document.getElementById('engNewsletterImg');
        if (newsImg) newsImg.src = siteContent.engagement_newsletter && siteContent.engagement_newsletter.image ? siteContent.engagement_newsletter.image : 'https://images.unsplash.com/photo-1497633762265-9d179a990aa6?q=80&w=600';

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
    if (!video.getAttribute('src')) {
        console.error('Set a local video path on #welcomeVideo in index.html.');
        return;
    }
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    try {
        video.play().catch(function (err) {
            if (err.name !== 'NotAllowedError') console.error('Could not play the church welcome video:', err);
        });
    } catch (err) {
        console.error('Could not play the church welcome video:', err);
    }
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

    // THEME MODES
    var festiveBtn = document.getElementById('festiveBtn');
    var washBtn = document.getElementById('washBtn');
    var isFestive = localStorage.getItem('themeMode') === 'festive';
    var isWash = localStorage.getItem('themeMode') === 'wash';
    var animationInterval;

    if (isFestive) { document.body.classList.add('festive-mode'); startFestiveAnimations(); }
    else if (isWash) { document.body.classList.add('wash-mode'); startWashAnimations(); }

    if (festiveBtn) {
        festiveBtn.addEventListener('click', function() {
            document.body.classList.remove('wash-mode');
            document.body.classList.toggle('festive-mode');
            if (document.body.classList.contains('festive-mode')) { localStorage.setItem('themeMode', 'festive'); startFestiveAnimations(); }
            else { localStorage.setItem('themeMode', 'none'); stopAnimations(); }
        });
    }

    if (washBtn) {
        washBtn.addEventListener('click', function() {
            document.body.classList.remove('festive-mode');
            document.body.classList.toggle('wash-mode');
            if (document.body.classList.contains('wash-mode')) { localStorage.setItem('themeMode', 'wash'); startWashAnimations(); }
            else { localStorage.setItem('themeMode', 'none'); stopAnimations(); }
        });
    }

    function stopAnimations() {
        clearInterval(animationInterval);
        animationInterval = null;
        document.querySelectorAll('.snowflake, .christmas-ball, .soap-bubble').forEach(function(el) { el.remove(); });
    }
    function startFestiveAnimations() {
        stopAnimations();
        animationInterval = setInterval(function() {
            createSnowflake();
            if (Math.random() < 0.25) createChristmasBall();
        }, 300);
    }
    function createSnowflake() {
        var snowflake = document.createElement('div');
        snowflake.classList.add('snowflake');
        var size = Math.random() * 1.5 + 0.5;
        snowflake.innerHTML = '❅';
        snowflake.style.left = Math.random() * 100 + 'vw';
        snowflake.style.fontSize = size + 'em';
        snowflake.style.opacity = Math.random() * 0.7 + 0.3;
        snowflake.style.animationDuration = (Math.random() * 3 + 3) + 's';
        document.body.appendChild(snowflake);
        setTimeout(function() { snowflake.remove(); }, 6000);
    }
    function createChristmasBall() {
        var ball = document.createElement('div');
        ball.classList.add('christmas-ball');
        var size = Math.random() * 20 + 15;
        var colors = ['#ff0000', '#005BEA', '#F4C430', '#16A34A', '#ffffff'];
        ball.style.width = size + 'px'; ball.style.height = size + 'px';
        ball.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
        ball.style.left = Math.random() * 100 + 'vw';
        ball.style.animationDuration = (Math.random() * 2 + 4) + 's';
        document.body.appendChild(ball);
        setTimeout(function() { ball.remove(); }, 7000);
    }
    function startWashAnimations() {
        stopAnimations();
        animationInterval = setInterval(function() { createSoapBubble(); }, 400);
    }
    function createSoapBubble() {
        var bubble = document.createElement('div');
        bubble.classList.add('soap-bubble');
        var size = Math.random() * 30 + 10;
        bubble.style.width = size + 'px'; bubble.style.height = size + 'px';
        bubble.style.left = Math.random() * 100 + 'vw';
        bubble.style.animationDuration = (Math.random() * 4 + 4) + 's';
        document.body.appendChild(bubble);
        setTimeout(function() { bubble.remove(); }, 8000);
    }
});