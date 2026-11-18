// ============================================
// DONATIONS PAGE — Bridge Calvary Chapel
// File: js/donations.js (Donation-only; shop separated)
// ============================================

var siteContent = {};

// ============================================
// HELPERS
// ============================================
function setText(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.textContent = val; }
function setHTML(id, val) { var el = document.getElementById(id); if (el && val !== undefined && val !== null) el.innerHTML = val; }
function escapeHtml(str) { if (str === null || str === undefined) return ''; return String(str).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }
function money(n) { return 'UGX ' + Number(n || 0).toLocaleString(); }
function showToast(msg) {
    var t = document.createElement('div'); t.className = 'bcc-toast';
    t.innerHTML = '<i class="fas fa-check-circle"></i> ' + escapeHtml(msg);
    document.body.appendChild(t);
    setTimeout(function () { t.classList.add('show'); }, 20);
    setTimeout(function () { t.classList.remove('show'); setTimeout(function () { t.remove(); }, 400); }, 2200);
}

// ============================================
// MODAL
// ============================================
var modalLastFocused = null;
window.openModal = function (html, panelClass) {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    var body = document.getElementById('modalBody');
    if (!panel || !body) return;
    modalLastFocused = document.activeElement;
    panel.classList.remove('mobile-money-panel', 'donation-wizard-panel');
    if (panelClass === 'mobile-money-panel' || panelClass === 'donation-wizard-panel') panel.classList.add(panelClass);
    body.innerHTML = html;
    overlay.classList.add('active');
    panel.removeAttribute('inert');
    panel.classList.add('active');
    document.body.style.overflow = 'hidden';
    body.scrollTop = 0;
    var c = panel.querySelector('.modal-panel-close');
    if (c) c.focus();
};
window.closeModal = function () {
    var overlay = document.getElementById('modalOverlay');
    var panel = document.getElementById('modalPanel');
    if (!panel) return;
    if (document.activeElement && panel.contains(document.activeElement)) document.activeElement.blur();
    overlay.classList.remove('active');
    panel.classList.remove('active');
    panel.setAttribute('inert', '');
    document.body.style.overflow = '';
    if (modalLastFocused && typeof modalLastFocused.focus === 'function') { try { modalLastFocused.focus(); } catch (e) {} }
    modalLastFocused = null;
};

// ============================================
// HERO
// ============================================
function renderHero() {
    var h = siteContent.donations_hero || {};
    setText('heroEyebrow', h.eyebrow || 'BRIDGE CALVARY CHAPEL');
    var titleEl = document.getElementById('heroTitle');
    if (titleEl && h.title_line1) {
        titleEl.innerHTML = '<span class="hero-title-line">' + escapeHtml(h.title_line1) + '</span>'
            + '<span class="hero-title-line">' + escapeHtml(h.title_line2 || '') + ' <span class="accent">' + escapeHtml(h.title_line3 || '') + '</span></span>';
    } else if (titleEl) {
        titleEl.innerHTML = '<span class="hero-title-line">Give &amp; Support the</span><span class="hero-title-line"><span class="accent">Ministry</span></span>';
    }
    setText('heroVerse', h.verse || '"Each of you should give what you have decided in your heart to give..." — 2 Corinthians 9:7');
    setText('heroDesc', h.description || 'Your generous gifts help us serve people, spread the Gospel, and meet real community needs.');
    var hero = document.querySelector('.donations-hero');
    if (hero && hero.dataset.clickAnimationBound !== 'true') {
        hero.dataset.clickAnimationBound = 'true';
        var heroAnimationTimer;
        hero.addEventListener('click', function () {
            hero.classList.remove('hero-clicked');
            void hero.offsetWidth;
            hero.classList.add('hero-clicked');
            window.clearTimeout(heroAnimationTimer);
            heroAnimationTimer = window.setTimeout(function () {
                hero.classList.remove('hero-clicked');
            }, 1100);
        });
    }
    var video = document.getElementById('donationHeroVideo');
    if (video) {
        var fallback = document.getElementById('donationVideoFallback');
        var toggle = document.getElementById('heroVideoToggle');
        var videoUrl = h.video_url || h.video;
        if (fallback) fallback.hidden = true;
        video.onerror = function () {
            if (fallback) fallback.hidden = false;
            if (toggle) toggle.hidden = true;
        };
        video.src = videoUrl || 'https://interactive-examples.mdn.mozilla.net/media/cc0-videos/flower.mp4';
        video.load();
        var reducedMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
        var autoplayRetryInProgress = false;
        function removeAutoplayRetry() {
            document.removeEventListener('pointerdown', retryAutoplay, true);
            document.removeEventListener('keydown', retryAutoplay, true);
        }
        function retryAutoplay(event) {
            if (toggle && event && toggle.contains(event.target)) return;
            if (reducedMotion || !video.paused || autoplayRetryInProgress) return;
            autoplayRetryInProgress = true;
            var retryRequest = video.play();
            if (retryRequest && retryRequest.then) {
                retryRequest.then(function () {
                    autoplayRetryInProgress = false;
                    removeAutoplayRetry();
                }).catch(function () {
                    autoplayRetryInProgress = false;
                    updateVideoToggle(false);
                });
            } else {
                autoplayRetryInProgress = false;
                removeAutoplayRetry();
            }
        }
        function enableAutoplayRetry() {
            document.addEventListener('pointerdown', retryAutoplay, true);
            document.addEventListener('keydown', retryAutoplay, true);
        }
        function updateVideoToggle(playing) {
            if (!toggle) return;
            toggle.setAttribute('aria-pressed', playing ? 'true' : 'false');
            toggle.setAttribute('aria-label', playing ? 'Pause background video' : 'Play background video');
            toggle.innerHTML = '<i class="fas ' + (playing ? 'fa-pause' : 'fa-play') + '" aria-hidden="true"></i><span>' + (playing ? 'Pause video' : 'Play video') + '</span>';
        }
        video.onplay = function () {
            removeAutoplayRetry();
            updateVideoToggle(true);
        };
        video.onpause = function () { updateVideoToggle(false); };
        if (toggle) {
            toggle.hidden = false;
            toggle.onclick = function () {
                if (video.paused) {
                    var playRequest = video.play();
                    if (playRequest && playRequest.catch) playRequest.catch(function () { updateVideoToggle(false); });
                } else {
                    video.pause();
                }
            };
        }
        if (reducedMotion) {
            video.autoplay = false;
            video.pause();
            updateVideoToggle(false);
        } else {
            var autoplayRequest = video.play();
            if (autoplayRequest && autoplayRequest.catch) {
                autoplayRequest.catch(function () {
                    updateVideoToggle(false);
                    enableAutoplayRetry();
                });
            } else if (video.paused) {
                enableAutoplayRetry();
            }
        }
    }
    var statsHTML = '';
    for (var i = 1; i <= 3; i++) {
        var num = h['stat' + i + '_number']; var lbl = h['stat' + i + '_label'];
        if (!num) continue;
        var icon = i === 1 ? 'fa-users' : (i === 2 ? 'fa-people-group' : 'fa-church');
        statsHTML += '<div class="hero-stat-row"><div class="hero-stat-icon"><i class="fas ' + icon + '"></i></div><div class="hero-stat-content"><span class="hero-stat-num">' + escapeHtml(num) + '</span><span class="hero-stat-lbl">' + escapeHtml(lbl || '') + '</span></div></div>';
    }
    setHTML('heroStats', statsHTML);
}

// ============================================
// DIRECT GIVING
// ============================================
function renderDirectGiving() {
    var d = siteContent.donations_bank || {};
    var header = siteContent.donations_direct || {};
    setText('directTitle', header.title || 'Direct Church Giving');
    setText('directDesc', header.description || 'Bank transfers, mobile money, and other verified donation methods');
    var grid = document.getElementById('directGrid');
    if (!grid) return;
    var bankName = d.bank_name || 'THE BRIDGE STANBIC BANK';
    var accountName = d.account_name || 'The Bridge of Calvary Chapel';
    var accountNum = d.account_number || '9030026398737';
    var branch = d.branch || 'Jinja';
    var swift = d.swift || 'SBICUGKX';
    var bankNote = d.note || 'Use "Donation - [Your Name]" as the reference.';
    var mobileNum = d.mobile_number || '9030026398737';
    var mobileNet = d.mobile_network || 'MTN MoMo / Airtel Money';
    var mobileAcct = d.mobile_account || 'The Bridge of Calvary Chapel';
    var mobileNote = d.mobile_note || 'Send via mobile money with "Donation" as reference.';
    var cardStatus = d.card_status || 'Coming Soon';
    var cardNote = d.card_note || 'Online card payments will be available soon. Please use bank transfer or mobile money in the meantime.';
    
    grid.innerHTML = ''
        + '<div class="direct-card"><div class="direct-card-icon"><i class="fas fa-university"></i></div><h4>Bank Transfer</h4>'
        + '<p class="direct-detail"><strong>Bank:</strong> ' + escapeHtml(bankName) + ' (' + escapeHtml(swift) + ')</p>'
        + '<p class="direct-detail"><strong>Branch:</strong> ' + escapeHtml(branch) + '</p>'
        + '<p class="direct-detail"><strong>Account:</strong> ' + escapeHtml(accountName) + '</p>'
        + '<p class="direct-detail"><strong>Number:</strong> ' + escapeHtml(accountNum) + '</p>'
        + '<p class="direct-note">' + escapeHtml(bankNote) + '</p></div>'
        
        + '<div class="direct-card direct-card-clickable" onclick="openMobileMoneyPanel()" tabindex="0" role="button">'
        +   '<div class="direct-card-icon"><i class="fas fa-mobile-alt"></i></div><h4>Mobile Money <i class="fas fa-chevron-right" style="font-size:10px;margin-left:4px;"></i></h4>'
        +   '<p class="direct-detail"><strong>Number:</strong> ' + escapeHtml(mobileNum) + '</p>'
        +   '<p class="direct-detail"><strong>Network:</strong> ' + escapeHtml(mobileNet) + '</p>'
        +   '<p class="direct-detail"><strong>Account:</strong> ' + escapeHtml(mobileAcct) + '</p>'
        +   '<p class="direct-note">Tap to see payment steps and send your confirmation.</p>'
        + '</div>'
        
        + '<div class="direct-card"><div class="direct-card-icon"><i class="fas fa-credit-card"></i></div><h4>Card Payment</h4>'
        + '<span class="badge-coming">' + escapeHtml(cardStatus) + '</span>'
        + '<p class="direct-note">' + escapeHtml(cardNote) + '</p></div>';
}

// ============================================
// MOBILE MONEY PANEL
// ============================================
window.openMobileMoneyPanel = function () {
    var d = siteContent.donations_bank || {};
    var p = siteContent.mm_procedure || {};
    var mobileNum = d.mobile_number || '9030026398737';
    var mobileAcct = d.mobile_account || 'The Bridge of Calvary Chapel';
    var networks = [
        {
            name: 'MTN MoMo',
            steps: [
                'Dial *165# and choose Send Money.',
                'Choose the Mobile Money recipient option.',
                'Enter ' + mobileNum + ' and the amount you want to give.',
                'Confirm the account name: ' + mobileAcct + '.',
                'Enter your PIN, then keep the transaction SMS.'
            ]
        },
        {
            name: 'Airtel Money',
            steps: [
                'Dial *185# and choose Send Money.',
                'Choose the Airtel Money recipient option.',
                'Enter ' + mobileNum + ' and the amount you want to give.',
                'Confirm the account name: ' + mobileAcct + '.',
                'Enter your PIN, then keep the transaction SMS.'
            ]
        }
    ];
    var networkCards = networks.map(function (network) {
        var stepsHtml = network.steps.map(function (step, index) {
            return '<li><span class="num">' + (index + 1) + '</span><span>' + escapeHtml(step) + '</span></li>';
        }).join('');
        return '<article class="mm-network-card">'
            + '<div class="mm-network-label"><i class="fas fa-signal"></i> ' + escapeHtml(network.name) + '</div>'
            + '<h3>Give with ' + escapeHtml(network.name) + '</h3>'
            + '<ol class="mm-network-steps">' + stepsHtml + '</ol>'
            + '<button class="modal-btn modal-btn-primary mm-give-button" type="button" data-give-network="' + escapeHtml(network.name) + '">Give with ' + escapeHtml(network.name) + ' <i class="fas fa-arrow-right"></i></button>'
            + '</article>';
    }).join('');

    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#005BEA,#078BFF);"><i class="fas fa-mobile-alt"></i></div>'
        + '<h2>' + escapeHtml(p.title || 'Give with Mobile Money') + '</h2>'
        + '<p class="mm-intro">Choose your network, follow its steps, then select Give to choose Tithe or Offering and share your details.</p>'
        + '<div class="mm-network-grid">' + networkCards + '</div>'
        + (p.note ? '<p class="mm-note">' + escapeHtml(p.note) + '</p>' : '')
        + '<div class="modal-actions mm-close-row"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html, 'mobile-money-panel');
    document.querySelectorAll('[data-give-network]').forEach(function (button) {
        button.addEventListener('click', function () {
            window.openMonetaryDonation(button.dataset.giveNetwork);
        });
    });
};

// ============================================
// MINISTRY SUPPORT
// ============================================
window.openMinistrySupport = function () {
    var items = [];
    for (var i = 1; i <= 12; i++) { var m = siteContent['support_ministry_' + i]; if (m && m.title) items.push(m); }
    if (!items.length) {
        items = [
            { title: 'Youth Ministry', description: 'Supporting teens through Bible teaching, camps, and mentorship.' },
            { title: 'Hospital Ministry', description: 'Prayer and practical care for patients and families.' },
            { title: 'Worship Ministry', description: 'Sustaining instruments, sound, and worship training.' },
            { title: "Children's Ministry", description: 'Sunday school materials and children\'s programs.' },
            { title: 'Evangelism & Outreach', description: 'Community outreach, street evangelism, and mission trips.' },
            { title: 'Media Ministry', description: 'Livestreaming, recording, and communications.' }
        ];
    }
    var cards = items.map(function (m) {
        return '<div class="support-list-card" data-ministry="' + escapeHtml(m.title) + '"><h4>' + escapeHtml(m.title) + '</h4><p>' + escapeHtml(m.description || '') + '</p></div>';
    }).join('');
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);"><i class="fas fa-church"></i></div>'
        + '<h2>Support a Ministry</h2>'
        + '<p style="text-align:center;font-size:12.5px;color:#49658A;">Choose a ministry to support.</p>'
        + '<div class="modal-section-label">Available Ministries</div>'
        + '<div class="support-list-grid">' + cards + '</div>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html);
    document.querySelectorAll('.support-list-card').forEach(function (card) {
        card.addEventListener('click', function () { openMinistrySupportForm(card.getAttribute('data-ministry')); });
    });
};

function openMinistrySupportForm(name) {
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#8B5CF6,#7C3AED);"><i class="fas fa-heart"></i></div>'
        + '<h2>Support ' + escapeHtml(name) + '</h2>'
        + '<form id="minSupportForm" class="order-form-grid">'
        +   '<div class="form-group full"><label>Your Name <span class="req">*</span></label><input type="text" name="name" required></div>'
        +   '<div class="form-group full"><label>Email <span class="req">*</span></label><input type="email" name="email" required></div>'
        +   '<div class="form-group full"><label>Phone</label><input type="tel" name="phone"></div>'
        +   '<div class="form-group full"><label>Support Type</label><select name="supportType"><option>Financial gift</option><option>Prayer support</option><option>Volunteer time</option><option>Material donation</option></select></div>'
        +   '<div class="form-group full"><label>Amount / Note</label><input type="text" name="amount"></div>'
        +   '<div class="form-group full"><label>Message</label><textarea name="message" rows="3"></textarea></div>'
        + '</form>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-whatsapp" id="btnMinWhatsApp"><i class="fab fa-whatsapp"></i> Send WhatsApp</button>'
        +   '<button class="modal-btn modal-btn-email" id="btnMinEmail"><i class="fas fa-envelope"></i> Send Gmail</button>'
        + '</div>'
        + '<div class="modal-actions" style="margin-top:8px;"><button class="modal-btn modal-btn-secondary" onclick="openMinistrySupport()" type="button">Back</button><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html);
    function collect() { var p = {}; new FormData(document.getElementById('minSupportForm')).forEach(function (v, k) { p[k] = v; }); return p; }
    function buildMessage(p) { return ['Support Request — ' + name, '', 'Name: ' + (p.name||''), 'Email: ' + (p.email||''), 'Phone: ' + (p.phone||'—'), 'Support Type: ' + (p.supportType||''), 'Amount / Note: ' + (p.amount||'—'), 'Message: ' + (p.message||'—')].join('\n'); }
    document.getElementById('btnMinWhatsApp').addEventListener('click', function () {
        var p = collect(); if (!p.name || !p.email) { alert('Please fill name and email.'); return; }
        var c = window.CHURCH_CONTACT || { whatsapp: '256793240756' };
        window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildMessage(p)), '_blank');
    });
    document.getElementById('btnMinEmail').addEventListener('click', function () {
        var p = collect(); if (!p.name || !p.email) { alert('Please fill name and email.'); return; }
        var c = window.CHURCH_CONTACT || { email: 'thebridgecalvarychapel1@gmail.com' };
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Support — ' + name) + '&body=' + encodeURIComponent(buildMessage(p)), '_blank');
    });
}

// ============================================
// SPECIAL PROJECTS
// ============================================
window.openSpecialProjects = function () {
    var items = [];
    for (var i = 1; i <= 12; i++) { var p = siteContent['special_project_' + i]; if (p && p.title) items.push(p); }
    if (!items.length) {
        items = [
            { title: 'Sanctuary Renovation', description: 'New flooring, seating, and lighting.', target: 'UGX 15,000,000' },
            { title: 'Youth Camp Fund', description: 'Send our youth to camp.', target: 'UGX 8,000,000' },
            { title: 'Roof Repair', description: 'Replacing the leaking roof over the fellowship hall.', target: 'UGX 5,000,000' }
        ];
    }
    var cards = items.map(function (p) {
        return '<div class="support-list-card" data-project="' + escapeHtml(p.title) + '"><h4>' + escapeHtml(p.title) + '</h4><p>' + escapeHtml(p.description || '') + '</p>' + (p.target ? '<span class="target-tag">Target: ' + escapeHtml(p.target) + '</span>' : '') + '</div>';
    }).join('');
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#F59E0B,#D97706);"><i class="fas fa-hard-hat"></i></div>'
        + '<h2>Special Projects</h2>'
        + '<p style="text-align:center;font-size:12.5px;color:#49658A;">Click a project to send your support.</p>'
        + '<div class="modal-section-label">Current Projects</div>'
        + '<div class="support-list-grid">' + cards + '</div>'
        + '<div class="modal-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html);
    document.querySelectorAll('.support-list-card').forEach(function (card) {
        card.addEventListener('click', function () { openSpecialProjectForm(card.getAttribute('data-project')); });
    });
};

function openSpecialProjectForm(name) {
    var html = '<div class="modal-content">'
        + '<div class="modal-icon-wrapper" style="background:linear-gradient(135deg,#F59E0B,#D97706);"><i class="fas fa-hand-holding-heart"></i></div>'
        + '<h2>Support: ' + escapeHtml(name) + '</h2>'
        + '<form id="projSupportForm" class="order-form-grid">'
        +   '<div class="form-group full"><label>Your Name <span class="req">*</span></label><input type="text" name="name" required></div>'
        +   '<div class="form-group full"><label>Email <span class="req">*</span></label><input type="email" name="email" required></div>'
        +   '<div class="form-group full"><label>Phone</label><input type="tel" name="phone"></div>'
        +   '<div class="form-group full"><label>Amount (UGX)</label><input type="text" name="amount"></div>'
        +   '<div class="form-group full"><label>Message</label><textarea name="message" rows="3"></textarea></div>'
        + '</form>'
        + '<div class="modal-actions">'
        +   '<button class="modal-btn modal-btn-whatsapp" id="btnProjWhatsApp"><i class="fab fa-whatsapp"></i> Send WhatsApp</button>'
        +   '<button class="modal-btn modal-btn-email" id="btnProjEmail"><i class="fas fa-envelope"></i> Send Gmail</button>'
        + '</div>'
        + '<div class="modal-actions" style="margin-top:8px;"><button class="modal-btn modal-btn-secondary" onclick="openSpecialProjects()" type="button">Back</button><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div>'
        + '</div>';
    openModal(html);
    function collect() { var p = {}; new FormData(document.getElementById('projSupportForm')).forEach(function (v, k) { p[k] = v; }); return p; }
    function buildMessage(p) { return ['Special Project Support — ' + name, '', 'Name: ' + (p.name||''), 'Email: ' + (p.email||''), 'Phone: ' + (p.phone||'—'), 'Amount: UGX ' + (p.amount||'—'), 'Message: ' + (p.message||'—')].join('\n'); }
    document.getElementById('btnProjWhatsApp').addEventListener('click', function () {
        var p = collect(); if (!p.name || !p.email) { alert('Please fill name and email.'); return; }
        var c = window.CHURCH_CONTACT || { whatsapp: '256793240756' };
        window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(buildMessage(p)), '_blank');
    });
    document.getElementById('btnProjEmail').addEventListener('click', function () {
        var p = collect(); if (!p.name || !p.email) { alert('Please fill name and email.'); return; }
        var c = window.CHURCH_CONTACT || { email: 'thebridgecalvarychapel1@gmail.com' };
        window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Support Project — ' + name) + '&body=' + encodeURIComponent(buildMessage(p)), '_blank');
    });
}

// ============================================
// MONEY WIZARD
// ============================================
var monetaryWizard = { step: 1, fund: '', network: '', amount: 0, donor: { name: '', email: '', phone: '' }, notes: '' };
window.openMonetaryDonation = function (network) {
    monetaryWizard = { step: 1, fund: '', network: network || '', amount: 0, donor: { name: '', email: '', phone: '' }, notes: '' };
    renderMonetaryStep();
};
function fundChoice(val, icon, title, sub) {
    var active = monetaryWizard.fund === val ? 'active' : '';
    return '<button type="button" class="donation-panel-choice ' + active + '" data-value="' + val + '" aria-pressed="' + (active ? 'true' : 'false') + '"><i class="fas ' + icon + '"></i><span class="donation-panel-choice-title">' + title + '</span><span class="donation-panel-choice-sub">' + sub + '</span></button>';
}
function renderMonetaryStep() {
    var step = monetaryWizard.step;
    var body = '';
    if (step === 1) {
        body = '<div class="wizard-title">Choose Your Gift</div><div class="wizard-subtitle">Select whether this gift is a tithe or an offering.</div>'
            + '<div class="donation-panel-choice-row">'
            + fundChoice('tithe', 'fa-hands-praying', 'Tithe', 'A faithful portion given to God')
            + fundChoice('offering', 'fa-heart', 'Offering', 'Support the church and its ministry')
            + '</div>';
    } else {
        var d = siteContent.donations_bank || {};
        var mobileNum = d.mobile_number || '9030026398737';
        var mobileAcct = d.mobile_account || 'The Bridge of Calvary Chapel';
        body = '<div class="wizard-title">Your Giving Details</div>'
            + '<div class="wizard-subtitle">Your message will open in WhatsApp or email for you to send.</div>'
            + '<div class="wizard-payment-summary"><strong>' + escapeHtml(monetaryWizard.network || 'MTN MoMo or Airtel Money') + '</strong>'
            + '<span>Send to ' + escapeHtml(mobileNum) + ' · ' + escapeHtml(mobileAcct) + '</span></div>'
            + '<form id="monDonorForm" class="wizard-form">'
            + '<label>Gift type<input type="text" value="' + (monetaryWizard.fund === 'tithe' ? 'Tithe' : 'Offering') + '" readonly></label>'
            + '<label>Amount (UGX) *<input type="number" id="monAmount" name="amount" min="1000" step="1000" required placeholder="e.g. 50,000"></label>'
            + '<label>Full Name *<input type="text" id="monName" name="name" required autocomplete="name"></label>'
            + '<label>Email *<input type="email" id="monEmail" name="email" required autocomplete="email"></label>'
            + '<label>Phone Number *<input type="tel" id="monPhone" name="phone" required autocomplete="tel"></label>'
            + '<label>Note (optional)<textarea id="monNotes" name="notes" rows="2" placeholder="Add a note"></textarea></label>'
            + '</form>'
            + '<div class="wizard-actions"><button type="button" class="modal-btn modal-btn-whatsapp" id="monWhatsApp"><i class="fab fa-whatsapp"></i> Continue with WhatsApp</button><button type="button" class="modal-btn modal-btn-email" id="monEmailBtn"><i class="fas fa-envelope"></i> Continue with Email</button></div>';
    }
    var html = '<div class="wizard"><div class="wizard-progress">' + [1, 2].map(function (n) {
        var cls = n < step ? 'done' : (n === step ? 'current' : '');
        return '<div class="wizard-progress-step ' + cls + '"><span class="wizard-progress-num">' + n + '</span><span class="wizard-progress-label">' + (n === 1 ? 'Gift type' : 'Your details') + '</span></div>';
    }).join('') + '</div>' + body + '<div class="wizard-nav">'
        + (step === 2 ? '<button class="modal-btn modal-btn-secondary" id="monBack" type="button"><i class="fas fa-arrow-left"></i> Back</button>' : '')
        + (step === 1 ? '<button class="modal-btn modal-btn-primary" id="monNext" type="button">Continue <i class="fas fa-arrow-right"></i></button>' : '')
        + '</div></div>';
    openModal(html, 'donation-wizard-panel');
    if (step === 1) document.querySelectorAll('.donation-panel-choice').forEach(function (button) {
        button.addEventListener('click', function () {
            monetaryWizard.fund = button.dataset.value;
            document.querySelectorAll('.donation-panel-choice').forEach(function (choice) {
                choice.classList.toggle('active', choice === button);
                choice.setAttribute('aria-pressed', choice === button ? 'true' : 'false');
            });
        });
    });
    var back = document.getElementById('monBack');
    var next = document.getElementById('monNext');
    if (back) back.addEventListener('click', function () { monetaryWizard.step = 1; renderMonetaryStep(); });
    if (next) next.addEventListener('click', advanceMonetary);
    if (step === 2) {
        document.getElementById('monWhatsApp').addEventListener('click', function () { submitMonetary('whatsapp'); });
        document.getElementById('monEmailBtn').addEventListener('click', function () { submitMonetary('email'); });
    }
}
function advanceMonetary() {
    if (!monetaryWizard.fund) { alert('Please choose Tithe or Offering.'); return; }
    monetaryWizard.step = 2;
    renderMonetaryStep();
}
function submitMonetary(method) {
    var form = document.getElementById('monDonorForm');
    if (!form || !form.reportValidity()) return;
    var data = new FormData(form);
    monetaryWizard.amount = Number(data.get('amount'));
    monetaryWizard.donor = {
        name: String(data.get('name') || '').trim(),
        email: String(data.get('email') || '').trim(),
        phone: String(data.get('phone') || '').trim()
    };
    monetaryWizard.notes = String(data.get('notes') || '').trim();
    var fundName = monetaryWizard.fund === 'tithe' ? 'Tithe' : 'Offering';
    var d = siteContent.donations_bank || {};
    var mobileNum = d.mobile_number || '9030026398737';
    var mobileAcct = d.mobile_account || 'The Bridge of Calvary Chapel';
    var c = window.CHURCH_CONTACT || { whatsapp: '256793240756', email: 'thebridgecalvarychapel1@gmail.com' };
    var msg = 'MONETARY GIFT\nGift type: ' + fundName + '\nAmount: ' + money(monetaryWizard.amount) + '\nPayment method: ' + (monetaryWizard.network || 'MTN MoMo or Airtel Money') + '\nMobile money number: ' + mobileNum + '\nAccount name: ' + mobileAcct + '\nName: ' + monetaryWizard.donor.name + '\nEmail: ' + monetaryWizard.donor.email + '\nPhone: ' + monetaryWizard.donor.phone + (monetaryWizard.notes ? '\nNote: ' + monetaryWizard.notes : '');
    if (method === 'whatsapp') window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg), '_blank');
    else window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent(fundName + ' Donation') + '&body=' + encodeURIComponent(msg), '_blank');
    showThankYouDonation('monetary', monetaryWizard.amount);
}

// ============================================
// MATERIAL WIZARD
// ============================================
var materialWizard = { step: 1, category: null, items: '', qty: '', condition: 'New', donor: { name: '', email: '', phone: '', address: '' }, deliveryMethod: 'dropoff', notes: '' };
window.openMaterialDonation = function () { materialWizard = { step: 1, category: null, items: '', qty: '', condition: 'New', donor: { name: '', email: '', phone: '', address: '' }, deliveryMethod: 'dropoff', notes: '' }; renderMaterialStep(); };
function renderMaterialStep() {
    var step = materialWizard.step; var body = '';
    if (step === 1) {
        var cats = [
            { id: 'bibles', icon: 'fa-bible', name: 'Bibles & Books', desc: 'Study Bibles' },
            { id: 'clothing', icon: 'fa-tshirt', name: 'Clothing & Shoes', desc: 'Gently used' },
            { id: 'food', icon: 'fa-bread-slice', name: 'Food & Essentials', desc: 'Rice, beans' },
            { id: 'school', icon: 'fa-graduation-cap', name: 'School Supplies', desc: 'Books, pens' },
            { id: 'medical', icon: 'fa-medkit', name: 'Medical Items', desc: 'First aid' },
            { id: 'household', icon: 'fa-home', name: 'Household Items', desc: 'Blankets' }
        ];
        body = '<div class="wizard-title">Step 1: Category</div><div class="material-category-grid">'
            + cats.map(function (c) {
                var sel = materialWizard.category === c.id ? 'selected' : '';
                return '<div class="material-category-card ' + sel + '" data-cat="' + c.id + '"><div class="material-category-icon"><i class="fas ' + c.icon + '"></i></div><div class="material-category-info"><h4>' + c.name + '</h4><p>' + c.desc + '</p></div></div>';
            }).join('') + '</div>';
    } else if (step === 2) {
        body = '<div class="wizard-title">Step 2: Items</div><div class="wizard-form">'
            + '<label>Description *<input type="text" id="matItems" placeholder="e.g. 5 Bibles, 2 bags of rice" value="' + escapeHtml(materialWizard.items) + '"></label>'
            + '<label>Quantity<input type="text" id="matQty" value="' + escapeHtml(materialWizard.qty) + '"></label>'
            + '<label>Condition<select id="matCondition">'
            + ['New', 'Like new', 'Good', 'Used'].map(function (o) { return '<option ' + (materialWizard.condition === o ? 'selected' : '') + '>' + o + '</option>'; }).join('')
            + '</select></label></div>';
    } else if (step === 3) {
        body = '<div class="wizard-title">Step 3: Your Details</div><div class="wizard-form">'
            + '<label>Full Name *<input type="text" id="matName" value="' + escapeHtml(materialWizard.donor.name) + '"></label>'
            + '<label>Email<input type="email" id="matEmail" value="' + escapeHtml(materialWizard.donor.email) + '"></label>'
            + '<label>Phone *<input type="tel" id="matPhone" value="' + escapeHtml(materialWizard.donor.phone) + '"></label>'
            + '<label>Address<input type="text" id="matAddress" value="' + escapeHtml(materialWizard.donor.address) + '"></label></div>';
    } else if (step === 4) {
        body = '<div class="wizard-title">Step 4: Delivery</div>'
            + '<div class="donation-panel-choice-row">'
            + '<div class="donation-panel-choice ' + (materialWizard.deliveryMethod === 'dropoff' ? 'active' : '') + '" data-delivery="dropoff"><i class="fas fa-church"></i><div class="donation-panel-choice-title">Drop Off</div><div class="donation-panel-choice-sub">At the church</div></div>'
            + '<div class="donation-panel-choice ' + (materialWizard.deliveryMethod === 'collection' ? 'active' : '') + '" data-delivery="collection"><i class="fas fa-truck"></i><div class="donation-panel-choice-title">Collection</div><div class="donation-panel-choice-sub">We collect</div></div></div>'
            + '<div class="wizard-form"><label>Notes<textarea id="matNotes" rows="2">' + escapeHtml(materialWizard.notes) + '</textarea></label></div>';
    } else if (step === 5) {
        var catNames = { bibles: 'Bibles & Books', clothing: 'Clothing & Shoes', food: 'Food & Essentials', school: 'School Supplies', medical: 'Medical Items', household: 'Household Items' };
        body = '<div class="wizard-title">Step 5: Review</div>'
            + '<div class="donation-summary-receipt"><h4>Summary</h4>'
            + '<div class="donation-summary-row"><span class="label">Category</span><span class="value">' + (catNames[materialWizard.category] || '') + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Items</span><span class="value">' + escapeHtml(materialWizard.items) + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Donor</span><span class="value">' + escapeHtml(materialWizard.donor.name) + '</span></div>'
            + '<div class="donation-summary-row"><span class="label">Method</span><span class="value">' + (materialWizard.deliveryMethod === 'dropoff' ? 'Drop Off' : 'Collection') + '</span></div>'
            + '</div><div class="wizard-note">This is a request. The church will contact you to confirm.</div>'
            + '<div class="wizard-actions"><button class="modal-btn modal-btn-whatsapp" id="matWhatsApp"><i class="fab fa-whatsapp"></i> WhatsApp</button><button class="modal-btn modal-btn-email" id="matEmailBtn"><i class="fas fa-envelope"></i> Email</button></div>';
    }
    var html = '<div class="wizard"><div class="wizard-progress">' + [1, 2, 3, 4, 5].map(function (n) {
        var cls = n < step ? 'done' : (n === step ? 'current' : '');
        return '<div class="wizard-progress-step ' + cls + '"><span class="wizard-progress-num">' + n + '</span></div>';
    }).join('') + '</div>' + body + '<div class="wizard-nav">'
        + (step > 1 ? '<button class="modal-btn modal-btn-secondary" id="matBack"><i class="fas fa-arrow-left"></i> Back</button>' : '')
        + (step < 5 ? '<button class="modal-btn modal-btn-primary" id="matNext">Continue <i class="fas fa-arrow-right"></i></button>' : '')
        + '</div></div>';
    openModal(html);
    if (step === 1) document.querySelectorAll('.material-category-card').forEach(function (b) {
        b.addEventListener('click', function () { materialWizard.category = b.dataset.cat; renderMaterialStep(); });
    });
    if (step === 4) document.querySelectorAll('.donation-panel-choice').forEach(function (b) {
        b.addEventListener('click', function () { materialWizard.deliveryMethod = b.dataset.delivery; renderMaterialStep(); });
    });
    var back = document.getElementById('matBack'); var next = document.getElementById('matNext');
    if (back) back.addEventListener('click', function () { materialWizard.step--; renderMaterialStep(); });
    if (next) next.addEventListener('click', advanceMaterial);
    if (step === 5) {
        document.getElementById('matWhatsApp').addEventListener('click', function () { submitMaterial('whatsapp'); });
        document.getElementById('matEmailBtn').addEventListener('click', function () { submitMaterial('email'); });
    }
}
function advanceMaterial() {
    var step = materialWizard.step;
    if (step === 1 && !materialWizard.category) { alert('Please select a category.'); return; }
    if (step === 2) {
        var i = document.getElementById('matItems').value.trim();
        if (!i) { alert('Please describe items.'); return; }
        materialWizard.items = i; materialWizard.qty = document.getElementById('matQty').value.trim();
        materialWizard.condition = document.getElementById('matCondition').value;
    }
    if (step === 3) {
        var name = document.getElementById('matName').value.trim();
        var phone = document.getElementById('matPhone').value.trim();
        if (!name || !phone) { alert('Please enter name and phone.'); return; }
        materialWizard.donor = { name: name, email: document.getElementById('matEmail').value.trim(), phone: phone, address: document.getElementById('matAddress').value.trim() };
    }
    if (step === 4) { var n = document.getElementById('matNotes'); if (n) materialWizard.notes = n.value; }
    materialWizard.step++; renderMaterialStep();
}
function submitMaterial(method) {
    var catNames = { bibles: 'Bibles & Books', clothing: 'Clothing & Shoes', food: 'Food & Essentials', school: 'School Supplies', medical: 'Medical Items', household: 'Household Items' };
    var c = window.CHURCH_CONTACT || { whatsapp: '256793240756', email: 'thebridgecalvarychapel1@gmail.com' };
    var msg = '🙏 MATERIAL DONATION REQUEST\nCategory: ' + (catNames[materialWizard.category] || '') + '\nItems: ' + materialWizard.items + '\nQuantity: ' + (materialWizard.qty || '—') + '\nCondition: ' + materialWizard.condition + '\nMethod: ' + (materialWizard.deliveryMethod === 'dropoff' ? 'Drop Off' : 'Collection') + '\nDonor: ' + materialWizard.donor.name + '\nPhone: ' + materialWizard.donor.phone + (materialWizard.donor.email ? '\nEmail: ' + materialWizard.donor.email : '') + (materialWizard.donor.address ? '\nAddress: ' + materialWizard.donor.address : '');
    if (method === 'whatsapp') window.open('https://wa.me/' + c.whatsapp + '?text=' + encodeURIComponent(msg), '_blank');
    else window.open('https://mail.google.com/mail/?view=cm&fs=1&to=' + encodeURIComponent(c.email) + '&su=' + encodeURIComponent('Material Donation') + '&body=' + encodeURIComponent(msg), '_blank');
    showThankYouDonation('material', 0);
}

function showThankYouDonation(type, amount) {
    var title = type === 'monetary' ? 'Thank You for Your Gift!' : 'Thank You for Your Donation!';
    var msg = type === 'monetary' ? 'Your ' + money(amount) + ' gift details are ready. Please send the pre-filled message in WhatsApp or email so the church can confirm it.' : 'Your donation request has been prepared. Our team will contact you to arrange drop-off or collection.';
    openModal('<div class="wizard" style="text-align:center;">'
        + '<div class="thankyou-icon"><i class="fas fa-heart"></i></div>'
        + '<h2 style="font-size:22px;color:var(--navy-deep);margin-bottom:8px;">' + title + '</h2>'
        + '<p style="font-size:13px;color:var(--text-blue-gray);margin-bottom:20px;">' + msg + '</p>'
        + '<div class="wizard-actions"><button class="modal-btn modal-btn-secondary" onclick="closeModal()" type="button">Close</button></div></div>');
}

// ============================================
// LOAD
// ============================================
async function loadDonationData() {
    try {
        if (window.db && window.db.getSiteContent) siteContent = await window.db.getSiteContent() || {};
        renderHero();
        renderDirectGiving();
    } catch (err) { console.error(err); }
}

document.addEventListener('DOMContentLoaded', function () {
    window.addEventListener('scroll', function () {
        var n = document.getElementById('navbar');
        if (n) n.style.boxShadow = window.pageYOffset > 40 ? '0 8px 24px rgba(4,26,58,0.4)' : 'none';
    }, { passive: true });
    var navToggle = document.getElementById('navToggle'), navMenu = document.getElementById('navMenu');
    if (navToggle && navMenu) navToggle.addEventListener('click', function () {
        navMenu.classList.toggle('active');
        var icon = navToggle.querySelector('i');
        icon.classList.toggle('fa-bars'); icon.classList.toggle('fa-times');
    });
    var overlay = document.getElementById('modalOverlay'), closeBtn = document.getElementById('modalClose');
    if (overlay) overlay.addEventListener('click', closeModal);
    if (closeBtn) closeBtn.addEventListener('click', closeModal);
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeModal(); });
    var nl = document.getElementById('footerNewsletter');
    if (nl) nl.addEventListener('submit', function (e) { e.preventDefault(); alert('✅ Subscribed!'); nl.reset(); });
    var y = document.getElementById('currentYear'); if (y) y.textContent = new Date().getFullYear();
    loadDonationData();
});